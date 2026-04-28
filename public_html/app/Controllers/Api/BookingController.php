<?php

namespace App\Controllers\Api;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Home;
use App\Models\Coupon;
use Illuminate\Support\Facades\Http;
class BookingController extends APIController
{
	public function __construct() {

	}

    public function getBookingDetail($token_code){
		if($token_code){
			$model = new Booking();
			$booking = $model->getBookingByToken($token_code);
			if($booking){
				return $this->sendJson([
					'status' => 1,
					'message' => __('Success'),
					'data' => $booking
				]);
			}
		}
		return $this->sendJson([
			'status' => 1,
			'message' => __('Data is invalid')
		]);
    }

    public function checkout(Request $request){
		$token = $request->bearerToken();
		$user = get_user_by_access_token($token);
		if($user){
			$rules = [
				'first_name' => 'required|string',
				'last_name' => 'required|string',
				'email' => 'required|email',
				'phone' => 'required|string',
				'address' => 'required|string',
				'payment' => 'required|string',
				'payment_status' => 'required|string'
			];

			$validator = Validator::make( $request->all(), $rules );
			if ( $validator->fails() ) {
				return $this->sendJson( [
					'status'  => 0,
					'message' => $validator->errors()
				] );
			}

			$paymentMethod = request()->get('payment');
			$paymentStatus = request()->get('payment_status');
			$payment = get_available_payments($paymentMethod);
			if (!$payment) {
				return $this->sendJson([
					'status' => 0,
					'message' => __('This payment gateway is not available')
				]);
			}

			if(!in_array($paymentStatus, ['completed', 'incomplete', 'pending', 'cancelled'])){
				return $this->sendJson([
					'status' => 0,
					'message' => __('Payment status is invalid')
				]);
			}

			$user_id = $user->id;

			$cart = get_user_meta($user_id, 'cart_data');
			if(!$cart){
				return $this->sendJson([
					'status' => 0,
					'message' => __('Cart is empty')
				]);
			}

			$cart = json_decode($cart, true);
			$new_booking_id = $this->createBooking($user_id, $cart);

			if (!$new_booking_id) {
				return $this->sendJson([
					'status' => 0,
					'message' => __('Can not create new booking. Please try again!')
				]);
			}

			do_action('hh_after_create_booking', $new_booking_id);

			if ($paymentStatus == 'pending') {
				\App\Controllers\BookingController::get_inst()->deleteBooking($new_booking_id);
				return $this->sendJson([
					'status' => 0,
					'message' => __('The booking has not been completed')
				]);
			} else {
				\App\Controllers\BookingController::get_inst()->updateBookingStatus($new_booking_id, $paymentStatus, true);

				do_action('hh_after_created_booking', $new_booking_id, $paymentStatus);

				$booking_object = get_booking($new_booking_id, $cart['serviceType']);

				remove_user_meta($user_id, 'cart_data');

				return $this->sendJson([
					'status' => 1,
					'message' => __('Successful booking'),
					'token_code' => $booking_object->token_code
				]);
			}
		}
		return $this->sendJson([
			'status' => 0,
			'message' => __('Data is invalid')
		]);
    }

    public function createBooking($user_id, $cart){
	    $paymentMethod = request()->post('payment');
	    $payment = get_available_payments($paymentMethod);
	    $serviceObject = unserialize($cart['serviceObject']);
	    $filename=null;
	    if(request()->image!=null){
        $filename = time().'.'.request()->image->getClientOriginalExtension();
        request()->image->move(public_path('images'), $filename);}
	    $user_data = [
		    'email' => request()->post('email'),
		    'firstName' => request()->post('first_name'),
		    'lastName' => request()->post('last_name'),
		    'phone' => request()->post('phone'),
		    'address' => request()->post('address'),
		    'city' => request()->post('city'),
		    'postCode' => request()->post('post_code'),
		    'country' => request()->post('country'),
	    ];

	    $cart['user_data'] = $user_data;
	    $total_minutes = 1440;
	    if (isset($serviceObject->booking_type) && $serviceObject->booking_type == 'per_hour') {
		    $total_minutes = hh_date_diff($cart['cartData']['startTime'], $cart['cartData']['endTime'], 'minute');
	    }

	    $created_at = time();
	    $data = [
	        'last' =>$cart['cartData']['last'],
		    'booking_id' => $cart['serviceID'] . $created_at,
		    'booking_description' => sprintf(__('Booking at %s'), $serviceObject->post_title),
		    'service_id' => $cart['serviceID'],
		    'service_type' => $cart['serviceType'],
		    'first_name' => request()->get('first_name', ''),
		    'last_name' => request()->get('last_name', ''),
		    'email' => request()->get('email', ''),
		    'phone' => request()->get('phone', ''),
		    'address' => request()->get('address', ''),
		    'note' => request()->get('note', ''),
		    'number_of_guest' => isset($cart['cartData']['numberGuest']) ? $cart['cartData']['numberGuest'] : 0,
		    'total' => $cart['amount'],
		    'token_code' => hh_encrypt($cart['serviceID'] . $created_at),
		    'currency' => serialize(\Currencies::get_inst()->currentCurrency()),
		    'buyer' => $user_id,
		    'owner' => $serviceObject->author,
		    'payment_type' => $payment::$paymentId,
		    'total_minutes' => $total_minutes,
		    'status' => 'pending',
		    'checkout_data' => base64_encode(serialize($cart)),
		    'number' => isset($cart['cartData']['number']) ? $cart['cartData']['number'] : 0,
		    'created_date' => $created_at,
		    'image'=>$filename,
	    ];

	    if ($cart['serviceType'] == 'car') {
		    $data['start_date'] = strtotime(date('Y-m-d', $cart['cartData']['startDate']));
		    $data['end_date'] = strtotime(date('Y-m-d', $cart['cartData']['endDate']));
		    $data['start_time'] = strtotime(date('Y-m-d h:i a', $cart['cartData']['startDateTime']));
		    $data['end_time'] = strtotime(date('Y-m-d h:i a', $cart['cartData']['endDateTime']));
	    } else {
		    $data['start_date'] = strtotime(date('Y-m-d', $cart['cartData']['startDate']));
		    $data['end_date'] = strtotime(date('Y-m-d', $cart['cartData']['endDate']));
		    $data['start_time'] = $cart['cartData']['startTime'];
		    $data['end_time'] = $cart['cartData']['endTime'];
	    }

	    $booking_model = new Booking();

	    $new_booking_id = $booking_model->createBooking($data);

	    do_action('awebooking_created_new_booking', $new_booking_id, $data);

	    return $new_booking_id;
    }

    public function getPaymentGateways(){
	    $allPayment = get_available_payments();
	    $data = [];
	    if (!empty($allPayment)){
		    foreach ($allPayment as $key => $paymentName){
			    $data[] = [
			    	'id' => $paymentName::getID(),
				    'name' => $paymentName::getName(),
				    'description' => $paymentName::getDescription(),
				    'logo' => $paymentName::getLogo()
			    ];
		    }
	    }
	    return $this->sendJson([
	    	'status' => 1,
		    'message' => __('Success'),
		    'data' => $data
	    ]);
    }

    public function getCart(Request $request){
		$token = $request->bearerToken();
		$user = get_user_by_access_token($token);
		if($user){
			$cart = get_user_meta($user->id, 'cart_data');
			if($cart){
				return $this->sendJson([
					'status' => true,
					'message' => __('Success'),
					'data' => json_decode($cart)
				]);
			}else{
				return $this->sendJson([
					'status' => true,
                    'message' => __('Success'),
                    'data' => []
				]);
			}
		}
		return $this->sendJson([
			'status' => false,
			'message' => __('Data is invalid')
		]);
    }

    public function addToCart(Request $request){
	    $post_type = $request->post('post_type');
	    if(!empty($post_type) && in_array($post_type, ['home', 'experience', 'car'])){
			switch ($post_type){
				case 'home':
					return HomeController::inst()->addToCart($request);
					break;
				case 'experience':
					return ExperienceController::inst()->addToCart($request);
					break;
				case 'car':
					return CarController::inst()->addToCart($request);
					break;
			}
	    }
	    return $this->sendJson([
	    	'status' => false,
		    'message' => __('Post type is invalid')
	    ]);
    }

	public function getBookingHistory(Request $request){
	    $token = $request->bearerToken();
	    $user = new User;
	   $user_id= $user->getUserIDByToken($token);
	   $booking=Booking::where('buyer','=',$user_id)->orderBy('ID', 'DESC')->get();
	   foreach($booking as $item)
	   { $home=Home::find($item->service_id);
	   $bookingData = get_booking_data($item->ID);
	   $item->{'base_price'}=$bookingData['basePrice'];
	   $item->{'lng'}=$home!=null?$home->location_lng:0;
	   $item->{'lat'}=$home!=null?$home->location_lat:0;
	   $owner=User::find($item->owner);
	   $item->{'username'}=$owner!=null?get_username($owner->id):'';
	   $item->{'image'}=$owner!=null?get_attachment_url($owner->avatar):'';
	   $item->{'mobile'}=$owner!=null?$owner->mobile:'';
	       $item->booking_description =get_translate($item->booking_description,1);
	       $item->start_date =balanceTags(date('Y-m-d', $item->start_date));
	       $item->end_date=balanceTags(date('Y-m-d', $item->end_date));
	       $item->start_time =balanceTags(date('h:i A', $item->start_time));
	       $item->end_time =balanceTags(date('h:i A',  $item->end_time));
	       $item->created_date =balanceTags(date('Y-m-d', $item->created_date));
	       
	   }
        return $this->sendJson([
            'status' => 1,
            'message' => $booking
        ]); 
    }
    
    public function getBookingBill(Request $request){
         $token = $request->bearerToken();
	    $user = new User;
	   $user_id= $user->getUserIDByToken($token);
	   $booking=Booking::where('buyer','=',$user_id)->orderBy('ID', 'DESC')->first();
        $booking->booking_description =get_translate($booking->booking_description,1);
	       $booking->start_date =balanceTags(date('Y-m-d', $booking->start_date));
	       $booking->end_date=balanceTags(date('Y-m-d', $booking->end_date));
	       $booking->start_time =balanceTags(date('h:i A', $booking->start_time));
	       $booking->end_time =balanceTags(date('h:i A',  $booking->end_time));
	       $booking->created_date =balanceTags(date('Y-m-d', $booking->created_date));
         return $this->sendJson([
            'status' => 1,
            'message' => $booking
        ]); 
    }
    public function SendGift(Request $request){
    $booking=Booking::where('booking_id','=',$request->booking_id)->first();
      $owner=User::find($booking->owner);
    $msg = "مرحباً بك في منصة لبية\r\n".
     "تم حجز: ".get_translate($booking->booking_description,1)."\r\n".
     "رقم الحجز: ".$booking->booking_id."\r\n".
     "اسم الحجز: ".get_translate($booking->booking_description,1)."\r\n".
     "تاريخ الحجز: ".balanceTags(date("Y-m-d", $booking->created_date))."\r\n".
     "تاريخ الدخول والخروج: ".balanceTags(date("Y-m-d", $booking->start_date))." - ".balanceTags(date("Y-m-d", $booking->end_date))."\r\n".
     "تم الحجز من قبل: ".$booking->first_name."  ".$booking->last_name."\r\n".
     "رقم الجوال: ".$booking->phone."\r\n".
     "-------------------------------------\r\n".
     "معلومات صاحب الإعلان\r\n".get_username($owner->id)."\r\n".
     "رقم الهاتف: ".$owner->mobile."\r\n".
     "للملاحظات أو الاستفسارات تواصل معنا عبر 0581633837 أو من خلال موقع لبية https://labayh.sa";
     $a=  Http::post("https://www.msegat.com/gw/sendsms.php", [
          "userName"=> "Labayh",
          "numbers"=> $request->phone,
          "userSender" => "Labayh",
          "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
          "msg"=> "$msg"
      ]);
        return $this->sendJson([
            'status' => 1,
            'message' => $a['code'],
    
        ]); 
        
    }
            public function checkCouponByCode($couponCode = '')
        {
            if (empty(trim($couponCode))) {
                return [
                    'status' => 0,
                    'message' => __('This coupon is invalid')
                ];
            }
            $coupon_model = new Coupon();
            $coupon = $coupon_model->getCouponItem($couponCode, 'code');

            if (!$coupon) {
                return [
                    'status' => 0,
                    'message' => __('This coupon is invalid')
                ];
            }
            if ($coupon->status == 'off') {
                return [
                    'status' => 0,
                    'message' => __('This coupon is not available')
                ];
            }

            if (!empty($coupon->start_time) && !empty($coupon->end_time)) {
                $startTime = $coupon->start_time;
                $endTime = $coupon->end_time;
                $today = time();
                if ($startTime <= $endTime && $today >= $startTime && $today <= $endTime) {
                    [
                        'status' => 1,
                        'message' => __('This coupon is available'),
                        'coupon' => $coupon
                    ];
                } else {
                    return [
                        'status' => 0,
                        'message' => __('This coupon is not available')
                    ];
                }
            } else {
                return
                    [
                        'status' => 1,
                        'message' => __('This coupon is available'),
                        'coupon' => $coupon
                    ];
            }
            return
                [
                    'status' => 1,
                    'message' => __('This coupon is available'),
                    'coupon' => $coupon
                ];
        }
    public function addCoupon(Request $request){
     $token = $request->bearerToken();
	    $user = new User;
	   $user_id= $user->getUserIDByToken($token);
	   $cart = get_user_meta($user_id, 'cart_data');
     $cart = json_decode($cart, true);
    
     $coupon = $this-> checkCouponByCode($request->coupon);
     
     if($coupon['status']==1){
        $c=$coupon['coupon'];
     if($c->price_type=="percent")
     {  
         $cart['amount']= $cart['amount']-(($cart['amount']*$c->coupon_price) / 100);
     }
     else{
       $cart['amount']= $cart['amount']-($c->coupon_price);
     }
        	update_user_meta($user_id, 'cart_data', json_encode($cart));
        return $this->sendJson([
            'status' => 1,
            'message' =>$cart['amount'],
    
        ]);  
     }
     else{
        return $this->sendJson([
            'status' => 0,
            'message' => $coupon['message'],
    
        ]);   
         
     }
     
 
    }

    public function quote(Request $request)
    {
        $rules = [
            'property_id' => 'required|integer',
            'from' => 'required|date',
            'to' => 'required|date',
            'guests' => 'required|integer|min:1',
            'coupon' => 'string',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }

        $property_id = (int)$request->get('property_id');
        $startDate = strtotime($request->get('from'));
        $endDate = strtotime($request->get('to'));
        $guests = (int)$request->get('guests');

        $home = \App\Controllers\Services\HomeController::get_inst()->getById($property_id);
        if (!$home) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $subtotal = 0;
        $nights = 0;
        if ($home->booking_type == 'per_night') {
            $nights = hh_date_diff($startDate, $endDate);
            $price = \App\Controllers\Services\HomeController::get_inst()->getRealPrice($home, $startDate, $endDate, $guests);
            $requiredExtra = \App\Controllers\Services\HomeController::get_inst()->getRequiredExtraPrice($home, $nights);
            $extra = \App\Controllers\Services\HomeController::get_inst()->getExtraPrice($home, [], $nights);
            $subtotal = $price + $requiredExtra + $extra;
        }

        $fees = 0;
        $tax = 0;
        $tax_percent = (float)get_option('home_tax', 0);
        $included_tax = get_option('included_home_tax', 'off') === 'on';
        if (!$included_tax && $tax_percent > 0) {
            $tax = ($subtotal * $tax_percent) / 100;
        }

        $discount = 0;
        $coupon_code = $request->get('coupon', '');
        if (!empty($coupon_code)) {
            $coupon = $this->checkCouponByCode($coupon_code);
            if ($coupon['status'] == 1) {
                $c = $coupon['coupon'];
                if ($c->price_type == 'percent') {
                    $discount = ($subtotal * $c->coupon_price) / 100;
                } else {
                    $discount = $c->coupon_price;
                }
            }
        }

        $total = max(0, $subtotal + $fees + $tax - $discount);

        return $this->sendJson([
            'status' => 1,
            'data' => [
                'nights' => $nights,
                'subtotal' => $subtotal,
                'fees' => $fees,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $token = $request->bearerToken();
        $user = get_user_by_access_token($token);
        if (!$user) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $rules = [
            'property_id' => 'required|integer',
            'from' => 'required|date',
            'to' => 'required|date',
            'guests' => 'required|integer|min:1',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'payment' => 'string',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }

        $property_id = (int)$request->get('property_id');
        $request->request->add([
            'homeID' => $property_id,
            'homeEncrypt' => hh_encrypt($property_id),
            'num_adults' => $request->get('guests'),
            'num_children' => 0,
            'num_infants' => 0,
            'checkIn' => $request->get('from'),
            'checkOut' => $request->get('to'),
            'startTime' => $request->get('start_time'),
            'endTime' => $request->get('end_time'),
            'extraServices' => [],
        ]);

        $result = \App\Controllers\Services\HomeController::get_inst()->_addToCartHome($request, true);
        if (!$result['status']) {
            return $this->sendJson([
                'status' => 0,
                'message' => $result['message'],
            ]);
        }

        update_user_meta($user->id, 'cart_data', json_encode($result['cart']));

        $payment = $request->get('payment', '');
        if (empty($payment)) {
            $all = get_available_payments();
            if (!empty($all)) {
                $first = array_values($all)[0];
                $payment = $first::getID();
            }
        }

        $request->request->add([
            'payment' => $payment,
        ]);

        $new_booking_id = $this->createBooking($user->id, $result['cart']);
        if (!$new_booking_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Can not create new booking. Please try again!'),
            ]);
        }

        return $this->sendJson([
            'status' => 1,
            'data' => [
                'booking_id' => $new_booking_id,
                'status' => 'pending_payment',
            ],
        ]);
    }

    public function my(Request $request)
    {
        return $this->getBookingHistory($request);
    }

    public function cancel($id, Request $request)
    {
        $token = $request->bearerToken();
        $user = get_user_by_access_token($token);
        if (!$user) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $booking_model = new Booking();
        $booking = $booking_model->getBooking($id);
        if (!$booking || $booking->buyer != $user->id) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('This booking is not available'),
            ]);
        }

        \App\Controllers\BookingController::get_inst()->updateBookingStatus($id, 'canceled');

        return $this->sendJson([
            'status' => 1,
            'message' => __('Booking canceled'),
        ]);
    }
    
}

