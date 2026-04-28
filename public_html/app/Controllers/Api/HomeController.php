<?php

namespace App\Controllers\Api;

use App\Models\Home;
use App\Models\HomeAvailability;
use App\Models\HomePrice;
use App\Models\Taxonomy;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Favourite;
use App\Models\User;
use App\Models\LastMinute;
use Illuminate\Support\Facades\DB;

class HomeController extends APIController
{
	private static $_inst;     

	public function __construct() {
		$this->model = new Home();
	}

	public function getPriceRealtime($id, Request $request){
	    if($id) {
            $rules = [
                'check_in' => 'required|string',
                'check_out' => 'required|string'
            ];

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => $validator->errors()
                ]);
            }

            $startDate = strtotime(request()->get('check_in'));
            $endDate = strtotime(request()->get('check_out'));
            $startTime = request()->get('start_time');
            $endTime = request()->get('end_time');
            $number_adults = (int)request()->get('number_adult');
            $number_children = (int)request()->get('number_children');
            $extraServices = request()->get('extra_services');

            $total = 0;
            $home = \App\Controllers\Services\HomeController::get_inst()->getById($id);
            if ($home->booking_type == 'per_night') {
                $numberNight = hh_date_diff($startDate, $endDate);
                $price = \App\Controllers\Services\HomeController::get_inst()->getRealPrice($home, $startDate, $endDate, $number_adults + $number_children);
                $requiredExtra = \App\Controllers\Services\HomeController::get_inst()->getRequiredExtraPrice($home, $numberNight);
                $extra = \App\Controllers\Services\HomeController::get_inst()->getExtraPrice($home, $extraServices, $numberNight);
                $total = $price + $requiredExtra + $extra;
            } elseif ($home->booking_type == 'per_hour') {
                if(empty($startTime)) {
                    return $this->sendJson([
                        'status' => 0,
                        'message' => __('Start time is required')
                    ]);
                }
                if(empty($endTime)){
                    return $this->sendJson([
                        'status' => 0,
                        'message' => __('End time is required')
                    ]);
                }

                $startTime = strtotime(date('Y-m-d', $startDate) . ' ' . $startTime);
                $endTime = strtotime(date('Y-m-d', $endDate) . ' ' . $endTime);
                if (is_timestamp($startTime) && is_timestamp($endTime) && $startTime < $endTime) {
                    $numberNight = hh_date_diff($startTime, $endTime, 'hour');
                    $price = \App\Controllers\Services\HomeController::get_inst()->getRealPriceByTime($home, $startTime, $endTime, $number_adults + $number_children);
                    $requiredExtra = \App\Controllers\Services\HomeController::get_inst()->getRequiredExtraPrice($home, $numberNight);
                    $extra = \App\Controllers\Services\HomeController::get_inst()->getExtraPrice($home, $extraServices, $numberNight);
                    $total = $price + $requiredExtra + $extra;
                } else {
                    return $this->sendJson( [
                        'status'  => 0,
                        'message' => __('Data is invalid')
                    ] );
                }
            };
            return $this->sendJson([
                'status' => 1,
                'message' => __('Success'),
                'price' => $total,
                'price_html' => convert_price($total)
            ]);
        }
        return $this->sendJson( [
            'status'  => 0,
            'message' => __('Data is invalid')
        ] );
    }

	public function addToCart(Request $request){
		$rules = [
			'post_id' => 'required|integer',
			'number_adult' => 'required|integer',
			'number_children' => 'integer',
			'number_infant' => 'integer',
			'check_in' => 'required|string',
			'check_out' => 'required|string'
		];

		$validator = Validator::make( $request->all(), $rules );
		if ( $validator->fails() ) {
			return $this->sendJson( [
				'status'  => 0,
				'message' => $validator->errors()
			] );
		}

		$user = get_user_by_access_token($request->bearerToken());

		$post_id = $request->post('post_id');
		$home_object = get_post($post_id, 'home');
		if($home_object && $user) {
			$request->request->add( [
				'homeID'        => $post_id,
				'homeEncrypt'   => hh_encrypt($post_id),
				'num_adults'    => $request->post( 'number_adult' ),
				'num_children'  => $request->post( 'number_children' ),
				'num_infants'   => $request->post( 'number_infant' ),
				'checkIn'       => $request->post( 'check_in' ),
				'checkOut'      => $request->post( 'check_out' ),
				'startTime'     => $request->post( 'start_time' ),
				'endTime'       => $request->post( 'end_time' ),
				'extraServices' => $request->post( 'extra_service' ),
				'last'          =>$request->post( 'last' ),
			] );

			$result = \App\Controllers\Services\HomeController::get_inst()->_addToCartHome($request, true);

			if(!$result['status']){
				return $this->sendJson( [
					'status'  => 0,
					'message' => $result['message']
				] );
			}else{
				update_user_meta($user->id, 'cart_data', json_encode($result['cart']));
				$result['cart']['cartData']['startDate']=date("Y-m-d",$result['cart']['cartData']['startDate']);
				$result['cart']['cartData']['endDate']=date("Y-m-d",$result['cart']['cartData']['endDate']);
				$result['cart']['cartData']['startTime']= date(hh_time_format(),$result['cart']['cartData']['startTime']);
				$result['cart']['cartData']['endTime']=date(hh_time_format(),$result['cart']['cartData']['endTime']);
				return $this->sendJson( [
					'status'  => 1,
					'message' => __('Success'),
					'cart' => $result['cart']
				] );
			}
		}
		return $this->sendJson( [
			'status'  => 0,
			'message' => __('Data is invalid')
		] );
	}

    public function getTimeAvailability($id, Request $request){
        if(!empty($id)) {
            $rules = [
                'date' => 'required|string'
            ];
            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => $validator->errors()
                ]);
            }

            $date = request()->get('date');

            if ($date) {
                $home = get_post($id, 'home');
                $start_time = (!empty($home->checkin_time)) ? $home->checkin_time : '12:00 AM';
                $end_time = (!empty($home->checkout_time)) ? $home->checkout_time : '11:30 PM';
                $start_date = strtotime($date . ' ' . $start_time);
                $end_date = strtotime($date . ' ' . $end_time);
                $avai_model = new HomeAvailability();
                $calendarItems = $avai_model->getAvailabilityItems($id, strtotime($date), strtotime($date));
                $times = list_hours(30);
                $result = $times;
                foreach ($times as $key => $time) {
                    $timestamp = strtotime($date . ' ' . $key);
                    if ($timestamp < $start_date || $timestamp > $end_date) {
                        unset($result[$key]);
                        continue;
                    }
                    foreach ($calendarItems['results'] as $item) {
                        if ($timestamp >= $item->start_time && $timestamp <= $item->end_time) {
                            unset($result[$key]);
                            break;
                        }
                    }
                } 
                 $a=[];
                 foreach ($result as $key => $time) {
                    $a[]=$key;
                     
                 }
                return $this->sendJson([
                    'status' => 1,
                    'message' => __('Success'),
                    'data' => $a
                ]);
            }
        }
        return $this->sendJson([
            'status' => 0,
            'message' => __('Data is invalid')
        ]);
    }

	public function getAvailability($id, Request $request){
	    if(!empty($id)) {
            $rules = [
                'start_time' => 'required|string',
                'end_time' => 'required|string',
            ];
            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => $validator->errors()
                ]);
            }

            $events['events'] = [];
            $startTime = strtotime($request->post('start_time'));
            $endTime = strtotime($request->post('end_time'));
            if(!empty($startTime) && !empty($endTime)){
                $price_model = new HomePrice();
                $avai_model = new HomeAvailability();

                $priceItems = $price_model->getPriceItems($id, $startTime, $endTime, $status = 'on');
                $homeObject = \App\Controllers\Services\HomeController::get_inst()->getById($id);

                $price = (float)$homeObject->base_price;
                $wprice = $homeObject->weekend_price;
                $ruleWeekend = $homeObject->weekend_to_apply;
                if ($homeObject->booking_type == 'per_night') {
                    $endTime = strtotime('-1 day', $endTime);
                    $avaiItems = $avai_model->getAvailabilityItems($id, $startTime, $endTime);
                    for ($i = $startTime; $i <= $endTime; $i = strtotime('+1 day', $i)) {
                        $status = 'available';
                        $event = convert_price($price);
                        $inCustom = false;
                        foreach ($avaiItems['results'] as $avaiItem) {
                            if ($i >= $avaiItem->start_date && $i <= $avaiItem->end_date) {
                                if ($avaiItem->booking_id == 0 && $avaiItem->total_minutes == 1440) {
                                    $status = 'not_available';
                                    $event = 'Unavailable';
                                    break;
                                } else {
                                    $status = 'booked';
                                    $event = __('Booked');
                                    break;
                                }
                            }
                        }
                        if ($status == 'available') {
                            foreach ($priceItems['results'] as $range) {
                                if ($i >= $range->start_time && $i <= $range->end_time) {
                                    $event = convert_price($range->price);
                                    $inCustom = true;
                                    break;
                                }
                            }
                        }

                        if (!$inCustom) {
                            if (!is_null($wprice) && is_weekend($i, $ruleWeekend)) {
                                $event = convert_price($wprice);
                            }
                        }
                        $events['events'][] = [
                            'start' => date('Y-m-d', $i),
                            'end' => date('Y-m-d', $i),
                            'status' => $status,
                            'event' => $event
                        ];
                    }
                } elseif ($homeObject->booking_type == 'per_hour') {
                    $avaiItems = $avai_model->getAvailabilityTimeItems($id, $startTime, $endTime);
                    $date = date('Y-m-d');
                    $start_time = (!empty($homeObject->checkin_time)) ? $homeObject->checkin_time : '12:00 AM';
                    $end_time = (!empty($homeObject->checkout_time)) ? $homeObject->checkout_time : '11:30 PM';
                    $start_date = strtotime($date . ' ' . $start_time);
                    $end_date = strtotime($date . ' ' . $end_time);
                    $range_time = hh_date_diff($start_date, $end_date, 'minute');
                    for ($i = $startTime; $i <= $endTime; $i = strtotime('+1 day', $i)) {
                        $status = 'available';

                        $event = convert_price($price);
                        $inCustom = false;
                        foreach ($avaiItems['results'] as $item) {
                            if ($i >= $item->start_date && $i <= $item->end_date) {
                                if ((int)$item->total >= $range_time) {
                                    $status = ($item->has_booking > 0) ? 'booked' : 'not_available';
                                    break;
                                }
                            }
                        }
                        if ($status == 'available') {
                            foreach ($priceItems['results'] as $range) {
                                if ($i >= $range->start_time && $i <= $range->end_time) {
                                    $event = convert_price($range->price);
                                    $inCustom = true;
                                    break;
                                }
                            }
                            if (!$inCustom) {
                                if (!empty($wprice) && is_weekend($i, $ruleWeekend)) {
                                    $event = convert_price($wprice);
                                }
                            }
                        } elseif ($status == 'booked') {
                            $event = __('Booked');
                        } else {
                            $event = __('Unavailable');
                        }
                        $events['events'][] = [
                            'start' => date('Y-m-d', $i),
                            'end' => date('Y-m-d', $i),
                            'status' => $status,
                            'event' => $event
                        ];
                    }
                }
                return $this->sendJson([
                    'status' => 1,
                    'message' => __('Success'),
                    'data' => $events
                ]);
            }
        }
        return $this->sendJson([
            'status' => 0,
            'message' => __('Data is invalid')
        ]);
    }

	public function getFilters(Request $request){
        $lang = $request->get('lang', get_current_language());
        $price_range = \App\Controllers\Services\HomeController::get_inst()->getMinMaxPrice();
        $currency_symbol = current_currency('symbol');
        $symbol_position = current_currency('position');

        $terms = [];
        $filter_type = [
            'home-type' => __('Home Type'),
            'home-amenity' => __('Home Amenity')
        ];

        $term = new Term();
        $tax = new Taxonomy();

        foreach ($filter_type as $k => $v) {
            $taxObject = $tax->getByName($k);
            $term_temp = [];
            if (!empty($taxObject) && is_object($taxObject)) {
                $terms_data = $term->getTerms($taxObject->taxonomy_id);
                if ($terms_data) {
                    foreach ($terms_data as $item) {
                        $term_temp[$item->term_id] = esc_attr(get_translate($item->term_title, $lang));
                    }
                }
            }

            $terms[$k] = [
                'label' => $v,
                'items' => $term_temp
            ];
        }

        $filters = [
            [
                'id' => 'price_range',
                'title' => __('Price'),
                'data' => [
                    'min' => $price_range['min'],
                    'max' => $price_range['max'],
                    'min_html' => convert_price($price_range['min']),
                    'max_html' => convert_price($price_range['max']),
                    'currency_symbol' => $currency_symbol,
                    'symbol_position' => $symbol_position
                ]
            ],
            [
                'id' => 'attributes',
                'title' => __('Attributes'),
                'data' => $terms
            ]
        ];

        return $this->sendJson([
            'status' => 1,
            'message' => __('Success'),
            'data' => $filters
        ]);
	}

	public function search(Request $request){
		$rules = [
			'page' => 'integer|min:1',
			'lat' => 'numeric',
			'lng' => 'numeric',
			'address' => 'string',
			'check_in' => 'date',
			'check_out' => 'date',
			'check_in_time' => 'string',
			'check_out_time' => 'string',
			'start_time' => 'string',
			'end_time' => 'string',
			'booking_type' => 'in:per_night,per_hour',
			'num_adults' => 'integer|min:1',
			'num_children' => 'integer',
			'num_infants' => 'integer',
			'price_filter' => 'string',
			'home_type' => 'string',
			'home_amenity' => 'string',
			'number' => 'integer|min:1'
		];
		$validator = Validator::make($request->all(), $rules); 

		if ($validator->fails()) {
			return $this->sendJson([
				'status' => 0,
				'message' => $validator->errors()
			]);
		}
		$data = parse_request($request, array_keys($rules));
		$data = $this->parseRequestParams($data, [
			'check_in' => 'checkIn',
			'check_out' => 'checkOut',
			'check_in_time' => 'checkInTime',
			'check_out_time' => 'checkOutTime',
			'start_time' => 'startTime',
			'end_time' => 'endTime',
			'booking_type' => 'bookingType',
			'home_type' => 'home-type',
			'home_amenity' => 'home-amenity'
		]);

		$posts = $this->model->getSearchResult($data);
		$results = [];
		if($posts['total'] > 0){
			$lang = $request->get('lang', get_current_language());
			foreach ($posts['results'] as $k => $v){
				$temp = $v;
				$temp->post_title = get_translate($v->post_title, $lang);
				$temp->post_content = get_translate($v->post_content, $lang);
				$temp->post_description = get_translate($v->post_description, $lang);
				$temp->location_address = get_translate($v->location_address, $lang);
				$temp->location_state = get_translate($v->location_state, $lang);
				$temp->location_country = get_translate($v->location_country, $lang);
				$temp->location_city = get_translate($v->location_city, $lang);
				$temp->cancellation_detail = get_translate($v->cancellation_detail, $lang);
				$temp->text_external_link = get_translate($v->text_external_link, $lang);
				$temp->thumbnail_url = get_attachment_url($v->thumbnail_id);
				$temp->author_name = get_username($v->author);
				$temp->created_at = date(hh_date_format(), $v->created_at);
				$temp->extra_services = maybe_unserialize($v->extra_services);
				$temp->import_ical_url = maybe_unserialize($v->import_ical_url);

				$extra_services = $temp->extra_services;
				if(!empty($extra_services)){
                    foreach ($extra_services as $exk => $exv){
                        $extemp = $exv;
                        $extemp['name'] = get_translate($exv['name'], $lang);
                        $extra_services[$exk] = $extemp;
                    }
                    $temp->extra_services = $extra_services;
                }

				//Gallery
				$gallery = $v->gallery;
				$galleries = [];
				if(!empty($gallery)){
					$gallery = explode(',', $gallery);
					foreach ($gallery as $gk => $gv){
						$galleries[$gk] = get_attachment_url($gv);
					}
				}

				$temp->gallery = $galleries;

				//Post categories
				$home_amenities = $v->amenities;
				$amenities = [];
				if(!empty($home_amenities)){
					$home_amenities = explode(',', $home_amenities);
					foreach ($home_amenities as $termk => $termv) {
						$term_temp = get_term_by('id', $termv);
						if($term_temp){
							$amenities[] = [
								'id' => $term_temp->term_id,
								'link' => get_term_link($term_temp->term_name),
								'name' => get_translate($term_temp->term_title, $lang)
							];
						}

					}
				}
				$temp->amenities = $amenities;

				$home_type = $v->home_type;
				if(!empty($home_type)){
					$term_temp = get_term_by('id', $home_type);
					if($term_temp) {
						$temp->home_type = [
							'id' => $home_type,
							'link' => get_term_link($term_temp->term_name),
							'name' => get_translate($term_temp->term_title, $lang)
						];
					}else{
						$temp->home_type = [];
					}
				}

				$results[] = $temp;
			}
		}

		return $this->sendJson([
			'status' => 1,
			'message' => __('Success'),
			'total' => $posts['total'],
			'results' => $results
		]);
	}

    public function show($id, Request $request)
    { DB::table('home')->where('post_id', $id)->update(['count'=> DB::raw('count+1.00')]);
        $lang = 1;
        $data = $this->model->getById($id);
         if($request->bearerToken()!=null){
       
         $user =get_user_by_access_token($request->bearerToken());
         if($user!=null && user_can_review( $user->id, $id, 'home')){$data->{"canComment"}='1';}
         else{$data->{"canComment"}='0';}
          }
          else{$data->{"canComment"}='0';}
        if($data){
            $data->cancellation_detail = get_translate($data->cancellation_detail, $lang);
            $data->post_title = get_translate($data->post_title, $lang);
            $data->post_content = get_translate($data->post_content, $lang);
            $data->post_description = get_translate($data->post_description, $lang);
	        $data->thumbnail_url = get_attachment_url($data->thumbnail_id);
            $data->author_name = get_username($data->author);
            $data->created_at = date('Y-m-d H:i:s', $data->created_at);
	        $data->location_address = get_translate($data->location_address, $lang);
	        $data->location_state = get_translate($data->location_state, $lang);
	        $data->location_country = get_translate($data->location_country, $lang);
	        $data->location_city = get_translate($data->location_city, $lang);
	        $data->cancellation_detail = get_translate($data->cancellation_detail, $lang);
	        $data->text_external_link = get_translate($data->text_external_link, $lang);
     if($data->is_featured=='on')
            {
                $data->is_featured="1";
            }
            else{
                 $data->is_featured=null;
                
            }
             $sql3=LastMinute::where('home_id','=',$id)->first();
             if($sql3!=null)
            {
                $data->{'last_minute'}="1";
                $data->{'offer_price'}=$sql3->price;
                $data->{'creattted_at'}=$sql3->creattted_at;
                $data->{'last_id'}=$sql3->id;
                
            }
            else{
               $data->{'last_minute'}="0"; 
               $data->{'offer_price'}='';
               $data->{'creattted_at'}='';
               $data->{'last_id'}='';
               
            }
	        //Gallery
            $galleries = $data->gallery;
            $galleries_temp = [];
            if(!empty($galleries)){
                $galleries = explode(',', $galleries);
                foreach ($galleries as $k => $v){
                    $img = get_attachment($v);
                    if($img){
                        array_push(  $galleries_temp,$img);
                       // $galleries_temp = $img;
                    }
                }
            }
            $data->gallery = $galleries_temp;

	        //Extra services
            if(!empty($data->extra_services)){
                $extras = maybe_unserialize($data->extra_services);
                $extras_temp = [];
                foreach ($extras as $k => $v){
                    $extras_temp[] = $v;
                    $extras_temp[$k]['name'] = get_translate($v['name'], $lang);
                }
                $data->extra_services = $extras_temp;
            }
            
             $user=User::find($data->author);
             $data->{"mobile"}=$user->mobile;
             $data->{"avatar"}=get_attachment_url($user->avatar);
            
            //Home Amenities
            $home_amenities = $data->amenities;
            $amenities = [];
            if(!empty($home_amenities)){
                $home_amenities = explode(',', $home_amenities);
                foreach ($home_amenities as $k => $v) {
                    $term = get_term_by('id', $v);
                    if($term) {
                        $amenities[] = [
                            'id' => $term->term_id,
                            'link' => get_term_link($term->term_name),
                            'name' => get_translate($term->term_title, $lang)
                        ];
                    }
                }
            }

            $data->amenities = $amenities;

            // //Home Type
            // $home_type = $data->home_type;
            // if(!empty($home_type)){
            //     $term = get_term_by('id', $home_type);
            //     if($term){
            //         $data->home_type = [
            //             'id' => $term->term_id,
            //             'link' => get_term_link($term->term_name),
            //             'name' => get_translate($term->term_title, $lang)
            //         ];
            //     }
            // }

	        return $this->sendJson(['data' => $data,'images'=>$galleries_temp]);
        }
	    return $this->sendJson([
		    'status' => false,
		    'message' => __('Can not get data')
	    ]);
    }

	public static function inst(){
		if(empty(self::$_inst)){
			self::$_inst = new self();
		}
		return self::$_inst;
	}
	
	public function coordinate(Request $request)
	{
    	$R = 6371;  // earth's mean radius, km
    
        // first-cut bounding box (in degrees)
        $maxLat = $request->lat + rad2deg($request->rad/$R);
        $minLat = $request->lat - rad2deg($request->rad/$R);
        $maxLng = $request->lng + rad2deg(asin($request->rad/$R) / cos(deg2rad($request->lat)));
        $minLng = $request->lng - rad2deg(asin($request->rad/$R) / cos(deg2rad($request->lat)));
        $home=Home::where('location_lat','>=',$minLat)
        ->where('location_lat','<=',$maxLat)
        ->where('location_lng','>=', $minLng)
        ->where('location_lng','<=', $maxLng)
         ->where('status','=','publish')
        ->get();
        foreach($home as $h)
        {   $type = get_term_by('id', $h->home_type);
            $type_name = $type ? get_translate($type->term_title,1) : '';
            $h->{"type_name"}=$type_name;
            $review_number = get_comment_number($h->post_id, 'home');
            $h->num_review=$review_number;
            $h->booking_type= get_home_unit($h)=="night"?"في الليلة":"ساعة" ;
            $h->location_city=get_short_address($h);
             $h->location_country=get_translate($h->location_country,1);
            $h->location_address=get_translate($h->location_address,1);
             $h->post_description=get_translate($h->post_description,1);
            $h->post_title=get_translate($h->post_title,1); 
            $h->thumbnail_id=get_attachment_url($h->thumbnail_id, [150, 180]);
            $sql2 =HomePrice::where('available', 'on')
            ->where('home_id','=',$h->post_id)
            ->where('end_time','>=',strtotime(date("Y-m-d H:i:s")))
            ->get();
            $sql3=LastMinute::where('home_id','=',$h->post_id)->where('last','=','1')->first();
             if($sql3!=null)
            {
                $h->{'last_minute'}="1";
                $h->{'offer_price'}=$sql3->price;
                $h->{'creattted_at'}=$sql3->creattted_at;
                $h->{'last_id'}=$sql3->id;
                 $avai_model = new HomeAvailability();
                 $avaiItems = $avai_model->getAvailabilityItems($h->post_id, strtotime(date('Y-m-d', strtotime($sql3->creattted_at . " +1 days"))),
                 strtotime(date('Y-m-d', strtotime($sql3->creattted_at . " +2 days"))));
                
               // $sql8 = DB::table('booking')->whereRaw("last = {$sql3->id} ")->first();
                if($avaiItems['total']!=0){
                    $h->{'minute'}="2";
                    
                }
                
            }
            else{
               $h->{'last_minute'}="0"; 
               $h->{'offer_price'}='';
               $h->{'creattted_at'}='';
               $h->{'last_id'}='';
               
            }
            if($sql2!=null && $sql2->count()>0)
            {
                $h->{'labayh_days'}="1";
                
            }
            else{
               $h->{'labayh_days'}="0"; 
            }
            if($h->is_featured=='on')
            {
                $h->is_featured="1";
            }
            else{
                 $h->is_featured=null;
                
            }
        }
          return $this->sendJson($home);
	}
	
	public function similar_ads(Request $request)
	{
        $home=Home::where('home_type','=',$request->id_category)
        ->where('post_id','!=',$request->id_ads)
        ->where('status','=','publish')
        ->get();
        foreach($home as $h)
        {    $type = get_term_by('id', $h->home_type);
            $type_name = $type ? get_translate($type->term_title,1) : '';
            $h->{"type_name"}=$type_name;
            $review_number = get_comment_number($h->post_id, 'home');
            $h->num_review=$review_number;
             $h->booking_type= get_home_unit($h)=="night"?"في الليلة":"ساعة";
            $h->location_city=get_short_address($h);
        $h->location_country=get_translate($h->location_country,1);
            $h->location_address=get_translate($h->location_address,1);
             $h->post_description=get_translate($h->post_description,1);
            $h->post_title=get_translate($h->post_title,1); 
            $h->thumbnail_id=get_attachment_url($h->thumbnail_id, [150, 180]);
             $sql2 =HomePrice::where('available', 'on')
            ->where('home_id','=',$h->post_id)
            ->where('end_time','>=',strtotime(date("Y-m-d H:i:s")))
            ->get();
            if($sql2!=null && $sql2->count()>0)
            {
                $h->{'labayh_days'}="1";
                
            }
            else{
               $h->{'labayh_days'}="0"; 
            }
              if($h->is_featured=='on')
            {
                $h->is_featured="1";
            }
            else{
                 $h->is_featured=null;
                
            }
        }
          return $this->sendJson($home);
	}
	
	public function getFilterAdsFunc(Request $request)
	{
      	$R = 6371;  // earth's mean radius, km
    
        // first-cut bounding box (in degrees)
        $maxLat = $request->lat + rad2deg($request->rad/$R);
        $minLat = $request->lat - rad2deg($request->rad/$R);
        $maxLng = $request->lng + rad2deg(asin($request->rad/$R) / cos(deg2rad($request->lat)));
        $minLng = $request->lng - rad2deg(asin($request->rad/$R) / cos(deg2rad($request->lat)));
        if($request->id_category=='0')
        {
        $home=Home::where('location_lat','>=',$minLat)
        ->where('location_lat','<=',$maxLat)
        ->where('location_lng','>=', $minLng)
        ->where('location_lng','<=', $maxLng)
         ->where('status','=','publish')
        ->get();
        }
        else{
               $home=Home::where('location_lat','>=',$minLat)
        ->where('location_lat','<=',$maxLat)
        ->where('location_lng','>=', $minLng)
        ->where('location_lng','<=', $maxLng)
         ->where('status','=','publish')
         ->where('home_type','=',$request->id_category)
        ->get();
            
            
        }
        foreach($home as $h)
        {    $h->location_city=get_translate($h->location_city,1);
            $h->location_address=get_translate($h->location_address,1);
             $h->post_description=get_translate($h->post_description,1);
            $h->post_title=get_translate($h->post_title,1); 
            $h->thumbnail_id=get_attachment_url($h->thumbnail_id, [150, 180]);
            if($h->is_featured=='on')
            {
                $h->is_featured="1";
            }
            else{
                 $h->is_featured=null;
                
            }
        }
          return $this->sendJson($home);
	}
	public function getFavAdsFunc(Request $request)
	{
      $fav=DB::table('favourite')
    ->join('home', 'favourite.id_ads', '=', 'home.post_id')
    ->where('favourite.phone_faved_user','=', $request->id)
    ->where('isFav','=', '1')
    ->get();
     foreach($fav as $h)
        {    $type = get_term_by('id', $h->home_type);
            $type_name = $type ? get_translate($type->term_title,1) : '';
            $h->{"type_name"}=$type_name;
            $review_number = get_comment_number($h->post_id, 'home');
            $h->num_review=$review_number;
             $h->booking_type= get_home_unit($h)=="night"?"في الليلة":"ساعة";
            
            $h->location_city=get_short_address($h);
            $h->location_address=get_translate($h->location_address,1);
             $h->post_description=get_translate($h->post_description,1);
            $h->post_title=get_translate($h->post_title,1); 
            $h->thumbnail_id=get_attachment_url($h->thumbnail_id, [150, 180]);
            if($h->is_featured=='on')
            {
                $h->is_featured="1";
            }
            else{
                 $h->is_featured=null;
                
            }
        }
      return $fav;
	}
	
public function getFavStatusFunc(Request $request)
	{
      $fav=Favourite::where('phone_faved_user','=',$request->phone)
      ->where('id_ads','=',$request->id_description)
      ->first();
      if($fav!=null&&$fav->isFav=='1')
      {
          
          echo json_encode(true);
      }
      else
      {
           echo json_encode(false);
          
      }
	}
	
	public function changeAdsFavStateFunc(Request $request)
	{
      $fav=Favourite::where('phone_faved_user','=',$request->phone_user)
      ->where('id_ads','=',$request->id_ads)
      ->count();
      
      if($fav != 0)
      {$favs=Favourite::where('phone_faved_user','=',$request->phone_user)
      ->where('id_ads','=',$request->id_ads)
      ->first();
          if($favs->isFav=='0')
          {$favs->isFav='1';}
          else{$favs->isFav='0';}
           $favs->save();
         
      }
      else
      {
           $favo=new Favourite;
          $favo->isFav='1';
          $favo->id_ads=$request->id_ads;
          $favo->phone_faved_user=$request->phone_user;
          $favo->save();
      }
	} 
	
	public function getAdvancedSearchFunc(Request $request)
	{
        $home=Home::where('home_type','=',$request->category)
        ->where('status','=','publish')
        ->where('base_price','>=',$request->min_price)
        ->where('base_price','<=',$request->max_price)
        ->get();
        foreach($home as $h)
        {    $type = get_term_by('id', $h->home_type);
            $type_name = $type ? get_translate($type->term_title,1) : '';
            $h->{"type_name"}=$type_name;
            $review_number = get_comment_number($h->post_id, 'home');
            $h->num_review=$review_number;
             $h->booking_type= get_home_unit($h)=="night"?"في الليلة":"ساعة";
            $h->location_city=get_short_address($h);
            $h->location_address=get_translate($h->location_address,1);
             $h->post_description=get_translate($h->post_description,1);
            $h->post_title=get_translate($h->post_title,1); 
            $h->thumbnail_id=get_attachment_url($h->thumbnail_id, [150, 180]);
              if($h->is_featured=='on')
            {
                $h->is_featured="1";
            }
            else{
                 $h->is_featured=null;
                
            }
        }
          return $this->sendJson($home);
	}
	public function getDmsDaysFunc($id)
	{
	     $home =HomePrice::where('available', 'on')
            ->where('home_id','=',$id)
            ->where('end_time','>=',strtotime(date("Y-m-d H:i:s")))
            ->get();
            foreach($home as $h)
            {
                $h->start_time= date('Y-m-d', $h->start_time);
                
                
            }
            return $this->sendJson($home);
	    
	}
	public function getLocationFunc($id)
	{
	     $locations =get_option('top_destination');
	    
	     foreach($locations as $key => $location){
            $locations[$key]['name']=get_translate( $location['name'],$id);
            $locations[$key]['image']=get_attachment_url($location['image']);
               }
               
            
	      return $this->sendJson($locations);
	    
	}
	
	
}
