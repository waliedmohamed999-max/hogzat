<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Booking;
use App\Models\User;
use App\Models\Participants;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;
use App\Models\Payout;

class CheckoutController extends Controller
{

    public function _checkoutAction(Request $request)
    {
    

        $create_user_checkout = get_option('create_user_checkout', 'off');
        if ($create_user_checkout == 'off' && !is_user_logged_in()) {
            if (!is_user_logged_in()) {
               
                // return $this->sendJson([
                //     'status' => 0,
                //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('You need to login before making payments')])->render(),
                //     'need_login' => true
                // ]);
                  return Redirect::back()->withErrors(['message' =>  __('You need to login before making payments')]);
            }
        }
        $paymentMethod = request()->get('payment');

        $validator = Validator::make($request->all(),
            [
                'firstName' => 'required',
                'lastName' => 'required',
                'email' => 'required|email',
                'mobile' => 'required',
                'address' => 'required',
                'payment' => 'required',
                'term_condition' => 'required'
            ],
            [
                'firstName.required' => __('First name is required'),
                'lastName.required' => __('Last name is required'),
                'email.required' => __('Email is required'),
                'email.email' => __('Email is invalid'),
                'mobile.required' => __('Phone is required'),
                'address.required' => __('Address is required'),
                'payment.required' => __('Payment gateway is required'),
                'term_condition.required' => __('Please agree with the Term and Condition')
            ]
        );
        if ($validator->fails()) {
            // return $this->sendJson([
            //     'status' => 0,
            //     'message' => view('common.alert', ['type' => 'danger', 'message' => $validator->errors()->first()])->render()
            // ]);
              return Redirect::back()->withErrors(['message' =>$validator->errors()->first()]);
        }

        if (get_option('use_google_captcha', 'off') == 'on') {
            $recaptcha = new \ReCaptcha\ReCaptcha(get_option('google_captcha_secret_key'));
            $gRecaptchaResponse = request()->get('g-recaptcha-response');
            $resp = $recaptcha->verify($gRecaptchaResponse, $request->ip());
            if (!$resp->isSuccess()) {
                // return $this->sendJson([
                //     'status' => 0,
                //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('Your request was denied')])->render()
                // ]);
                return Redirect::back()->withErrors(['message' => __('Your request was denied')]);
            }
        }

        $userdata = $this->saveUserCheckoutData();
     

        if ($userdata['status'] == 0) {
            // return $this->sendJson($userdata);
            return Redirect::back()->withErrors(['message' =>$userdata['message']]);
        } else {
            $user_id = $userdata['user_id'];
        }

        $payment = get_available_payments($paymentMethod);
        if (!$payment) {
            // return $this->sendJson([
            //     'status' => 0,
            //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('This payment gateway is not available')])->render()
            // ]);
             return Redirect::back()->withErrors(['message' =>__('This payment gateway is not available')]);
        }

        $cart = \Cart::get_inst()->getCart();
        if (!$cart) {
            // return $this->sendJson([
            //     'status' => 0,
            //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('Cart is empty')])->render()
            // ]);
             return Redirect::back()->withErrors(['message' => __('Cart is empty')]);
        }

        do_action('hh_before_create_booking');

        $new_booking_id = BookingController::get_inst()->createBooking($user_id);

        if (!$new_booking_id) {
            if (!$cart) {
                // return $this->sendJson([
                //     'status' => 0,
                //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('Can not create new booking. Please try again!')])->render()
                // ]);
                 return Redirect::back()->withErrors(['message' =>__('Can not create new booking. Please try again!')]);
            }
        }

        do_action('hh_after_create_booking', $new_booking_id);

        if ($request->name != null) {
            $participants = Participants::create($request->all());
            if($request->image!=null){
                 $id_media=app(\App\Controllers\MediaController::class)->_addMediaApi($request->image,$participants->id);
                 Participants::where('id', $participants->id)->update( ['image' => $id_media ]);
             }
           }

        if (method_exists($payment, 'purchase')) {
            $paymentObject = $payment::get_inst();
            $validation = $paymentObject->validation();
            if (is_array($validation) && $validation['status'] === false) {
                // return $this->sendJson([
                //     'status' => 0,
                //     'message' => view('common.alert', ['type' => 'danger', 'message' => $validation['message']])->render()
                // ]);
                return Redirect::back()->withErrors(['message' =>$validation['message']]);
            }
            $responsive = $paymentObject->purchase($new_booking_id);
          
            if ($responsive['status'] == 'pending') {
                BookingController::get_inst()->deleteBooking($new_booking_id);
                // return $this->sendJson([
                //     'status' => 0,
                //     'message' => view('common.alert', ['type' => 'danger', 'message' => $responsive['message']])->render()
                // ]);
                return Redirect::back()->withErrors(['message' =>$responsive['message']]);
            } else {
                //   $booking= BookingController::get_inst()->getBookingByID($new_booking_id);
                //  $payout_model = new Payout();
                //   $payout_item = $payout_model->insertPayout(['payout_id'=>$new_booking_id,'user_id'=>get_current_user_id(),'amount'=> $booking->total
                //       ,'status'=>$responsive['status'] ,'created'=> $booking->created_date
                      
                //       ]);
                \Cart::get_inst()->deleteCart();

                BookingController::get_inst()->updateBookingStatus($new_booking_id, $responsive['status'], true);

                 if (  $paymentMethod != 'urway') {
                    do_action('hh_after_created_booking', $new_booking_id, $responsive['status']);
                }
            
                $return = [
                    'status' => 1,
                    'message' => view('common.alert', ['type' => 'success', 'message' => $responsive['message']])->render()
                ];
                if (isset($responsive['redirectUrl'])) {
                    $return['redirect'] = $responsive['redirectUrl'];
                }
                if (isset($responsive['redirectForm'])) {
                    $return['redirect_form'] = $responsive['redirectForm'];
                }
                if (isset($responsive['formID'])) {
                    $return['form_id'] = $responsive['formID'];
                }
                // return $this->sendJson($return);
                 return Redirect::to($responsive['redirectUrl']);
            }


        } else {
            // return $this->sendJson([
            //     'status' => 0,
            //     'message' => view('common.alert', ['type' => 'danger', 'message' => __('This payment gateway is missing purchase() method')])->render()
            // ]);
             return Redirect::back()->withErrors(['message' => __('This payment gateway is missing purchase() method')]);
        }
    }
    

    public function completePurchase($request)
    {
        $orderID = request()->get('_orderID');
        $order_encrypt = request()->get('_orderEncrypt');
        $paymentMethod = request()->get('_payment');
        $status = request()->get('_status', '1');
        if ($this->checkIsResponsive()) {
              if($request->_payment == "urway"){
                if($request->ResponseCode == "000"){
                    BookingController::get_inst()->updateBookingStatus($orderID, 'completed', true);
                       do_action('hh_change_booking_status', 'completed', $orderID, false);
                }else{
                     $booking=Booking::where('ID','=',$orderID)->first();
                        BookingController::get_inst()->updateBookingStatus($orderID, 'canceled', true);
                }

            }else{
            if (hh_compare_encrypt($orderID, $order_encrypt)) {
                $orderObject = get_booking($orderID);
                $oldStatus = $orderObject->status;
                if ($oldStatus == 'incomplete') {
                    if ($status == 0) {
                        BookingController::get_inst()->updateBookingStatus($orderID, 'canceled', true);
                        do_action('hh_completed_booking', $orderObject);
                    } else {
                        $payment = get_available_payments($paymentMethod);
                        if ($payment && method_exists($payment, 'completePurchase')) {
                            $paymentObject = $payment::get_inst();
                            $responsive = $paymentObject->completePurchase($orderID);
                            do_action('hh_before_check_complete_booking', $orderObject);
                            if ($responsive['status'] == 'completed') {
                                BookingController::get_inst()->updateBookingStatus($orderID, 'completed', true);
                            } elseif ($responsive['status'] == 'canceled') {
                                BookingController::get_inst()->updateBookingStatus($orderID, 'canceled', true);
                            } elseif ($responsive['status'] == 'incomplete') {
                                BookingController::get_inst()->updateBookingStatus($orderID, 'incomplete', true);
                            }
                            if (!empty($responsive['message'])) {
                                Log::debug($responsive['message']);
                            }
                            do_action('hh_completed_booking', $orderObject);
                        }
                    }
                }
            }
            }
        }
    }

    public function checkIsResponsive()
    {
        $params = [
            '_payment' => request()->get('_payment'),
            '_orderID' => request()->get('_orderID'),
            '_tokenCode' => request()->get('_tokenCode', ''),
            '_status' => request()->get('_status', ''),
        ];
        $paymentID = request()->get('_transactionID');
        $hash_string = $params['_payment'] . '|' . $params['_orderID'] . '|' . $params['_status'];

        if (!empty($paymentID)) {
            $hash_string .= '|' . $paymentID;
        }
        $newHash = hash_hmac('sha256', $hash_string, $params['_tokenCode']);;
        $hash = request()->get('_hash');
        if (empty($hash) || $newHash !== $hash) {
            return false;
        }

        return true;
    }

    public function saveUserCheckoutData()
    {
        $fields = [
            'email' => request()->get('email'),
            'firstName' => request()->get('firstName'),
            'lastName' => request()->get('lastName'),
            'mobile' => request()->get('mobile'),
            'address' => request()->get('address'),
            'city' => request()->get('city'),
            'postCode' => request()->get('postCode'),
            'country' => request()->get('country'),
        ];

        $fields = apply_filters('hh_user_checkout_data', $fields);

        $create_user_checkout = get_option('create_user_checkout', 'off');

        if (!is_user_logged_in()) {
            if ($create_user_checkout == 'on' && isset($_POST['create_user_checkout'])) {
                $user = get_user_by_email($fields['email']);
                if (!$user) {

                    $credentials = [
                        'mobile' => $fields['mobile'],
                        'first_name' => $fields['firstName'],
                        'last_name' => $fields['lastName'],
                    ];

                    $new_user = create_new_user($credentials);
                    if ($new_user['status']) {
                        $user = $new_user['user'];

                        update_user_meta($user->getUserId(), 'user_checkout_information', $fields);

                        return [
                            'status' => 1,
                            'message' => __('Saved user data successfully'),
                            'user_id' => $user->getUserId()
                        ];
                    } else {
                        return [
                            'status' => 0,
                            'message' => $new_user['message']
                        ];
                    }
                } else {
                    return [
                        'status' => 0,
                        'message' => __('This email already exists. Please login and continue'),
                        'need_login' => true
                    ];
                }
            } else {
                return [
                    'status' => 0,
                    'message' => __('Please login and continue'),
                    'need_login' => true
                ];
            }
        } else {
            update_user_meta(get_current_user_id(), 'user_checkout_information', $fields);

            return [
                'status' => 1,
                'message' => __('Saved user data successfully'),
                'user_id' => get_current_user_id()
            ];
        }
    }

    public function _checkoutPage(Request $request)
    {
        $cart = \Cart::get_inst()->getCart();
        return view('frontend.checkout', ['cart' => $cart]);
    }
    
      public function send_gift(Request $request)
    {
        $this->validate($request,[
            'phone'=>'required',
            
            ]);
            $mobile=$request->phone;
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
            $x=   Http::post("https://www.msegat.com/gw/sendsms.php", [
                "userName"=> "Labayh",
                "numbers"=> $mobile,
                "userSender" => "Labayh",
                "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
                "msg"=> "$msg"
            ]);
//   dd($x['code']);
       if($x['code'] == "1" ){
            return redirect(url('/'))->with('success',__('gifted')); 
        //   return $this->sendJson([
        //             'status' => 1,
        //             'message' => view('common.alert', ['type' => 'success', 'message' => __('gifted')])->render()
        //         ]);
                
                
       }else{
         return redirect(url('/'))->with('danger', __('Cannot be gifted')); 
            //   return $this->sendJson([
            //         'status' => $x['code'],
            //         'message' => view('common.alert', ['type' => 'danger', 'message' => __('Cannot be gifted')])->render()
            //     ]);
       }
    }


    public function _thankyouPage(Request $request)
    {
   
        $orderID = request()->get('_orderID');
        $isResponsive = $this->checkIsResponsive();
        if (!$isResponsive) {
            return redirect(url('/'));
        }
        $this->completePurchase($request);
        reset_booking_data();
        $bookingObject = BookingController::get_inst()->getBookingByID($orderID);
         if($request->_payment == "urway" && $request->ResponseCode != "000"){
                     $booking=Booking::where('ID','=',$orderID)->first();
                        return redirect(url('home/'.$booking->service_id))->withErrors(['message' =>  __('There was a problem during the electronic payment process, please check the entered payment information')]); 
                }else{
                       return view('frontend.thank-you', ['bookingObject' => $bookingObject]);
                       }
    
    }
}

