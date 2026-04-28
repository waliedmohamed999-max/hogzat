<?php

if (!isset($bookingObject)) {
    return;
}
$status = $bookingObject->status;
$status_info = booking_status_info($status);
?>
@include('frontend.components.header')
<style>
    .pp.gift{border: 1px solid #d7d6d7;border-radius: 15px;}
    .pp{   padding: 15px 6px 15px 0px;}
    .fnt{height: fit-content;    font-size: large;background-color: #8f17dd;color: white;}
</style>
<div class="hh-checkout-redirecting pb-5">
    <div class="container">
        <div class="row">
            <div class="col-12 col-md-12 offset-md-2">
                <div class="payment-item">
                    <div class="payment-status">
                         <?php
                            $logo = get_option('logo');
                            $logo_url = get_attachment_url($logo);
                            
                            $logo_footer = get_option('footer_logo');
                            if (empty($logo_footer)) {
                                $logo_footer = get_option('logo');
                                            }
$service_data = get_booking_data($bookingObject->ID, 'serviceObject');
                            ?>
           
                        <div class="row">
                            <div class="col-md-4">
                               <img src="{{ $logo_url }}" alt="img-logo" class="img-logo" style="width: 100%;">
                            </div>
                            <div class="col-md-4">
                                <h3>{{ __('Thank you for booking') }}</h3>
                                <span>Thank you for booking</span>
                            </div>
                            <div class="col-md-4">
                                 @if(!empty($logo_footer))
                                    <img src="{{ get_attachment_url($logo_footer) }}" alt="footer logo" class="footer-logo" style="max-width: 40%;"/>
                                @endif
                            </div>
                        </div>
                      <div class="row">
                            <div class="col-md-4">
                                  <p>{{__('Hello')}} <strong>{{$bookingObject->first_name}} {{$bookingObject->last_name}}</strong>,</p>
            <p>{{__('Thank you for using our service!')}}</p>
            <p>{{__('Here is your booking information:')}}</p>
                            </div>
                        </div>
                        <!--<i class="{{ $status_info['icon'] }} payment-icon payment-{{ $status }}"></i>-->
                    </div>
                    <!--<h4 class="payment-title">-->
                    <!--    {!! balanceTags(__($status_info['payment_text'])) !!}-->
                    <!--</h4>-->
                    <!--<div class="payment-desc">-->
                    <!--    {{ sprintf(__('Email booking details will be sent to the email address: %s'), $bookingObject->email) }}-->
                    <!--</div>-->
                    <!--<div class="payment-detail">-->
                    <!--    <div class="item d-flex align-items-center">-->
                    <!--        <span>{{__('Booking ID')}}</span>-->
                    <!--        <span class="ml-4">{{ $bookingObject->booking_id }}</span>-->
                    <!--    </div>-->
                    <!--    <div class="item d-flex align-items-center">-->
                    <!--        <span>{{__('Created Date')}}</span>-->
                    <!--        <span class="ml-4">{{ date(hh_date_format(), $bookingObject->created_date) }}</span>-->
                    <!--    </div>-->
                    <!--    <div class="item d-flex align-items-center">-->
                    <!--        <span>{{__('Payment Method')}}</span>-->
                    <!--        <span class="ml-4">-->
                                <?php
                                $paymentID = $bookingObject->payment_type;
                                $paymentObject = get_payments($paymentID);
                                ?>
                    <!--            {{ $paymentObject::getName() }}-->
                    <!--            </span>-->
                    <!--    </div>-->
                    <!--</div>-->
                    
                          
           

        
                    <h5 class="mt-5">{{__('Your Information')}}</h5>
                    <div class="payment-customer-info">
                        <div class="item">
                <span class="title">{{__('Booking ID:')}}</span>
                <span class="info">{{ $bookingObject->booking_id }}</span>
            </div>
            <div class="item">
                <span class="title">{{__('Name:')}}</span>
                <span class="info">{{ get_translate($service_data->post_title) }}</span>
            </div>
            <div class="item">
                <span class="title">{{__('Amount:')}}</span>
                <span class="info">{{$bookingObject->total}} {{__('Rial')}}</span>
            </div>
            <div class="item">
                <span class="title">{{__('Payment Method:')}}</span>
                <span class="info">
                     <?php
                    $paymentID = $bookingObject->payment_type;
                    $paymentObject = get_payments($paymentID);
                    ?>
                    {{ $paymentObject::getName() }}
                </span>
            </div>
            <div class="item">
                <span class="title">{{__('Status:')}}</span>
                <span class="info">
                    <?php
                    $status = $bookingObject->status;
                    $status_info = booking_status_info($status);
                    ?>
                    <span class="booking-status {{ $status }}">{{ get_translate(__($status_info['label'])) }}</span>
                </span>
            </div>
            <div class="item">
                <span class="title">{{__('Created At:')}}</span>
                <span class="info">{{ date(hh_date_format(), $bookingObject->created_date) }}</span>
            </div>
            <div class="item">
                <span class="title">{{__('Price Detail:')}}</span>
                <div class="info">
                    <?php
                    $cartData = get_booking_data($bookingObject->ID, 'cartData');
                    $checkout_data = get_booking_data($bookingObject->ID);
                    ?>
                    <ul class="cart-list">
                        <?php
                        $checkIn = $cartData['startTime'];
                        $checkOut = $cartData['endTime'];
                        $adults = $cartData['numberAdult'];
                        $children = $cartData['numberChild'];
                        $infant = $cartData['numberInfant'];
                        ?>
                        @if($service_data->booking_type == 'per_night')
                            <li>
                                <span>{{__('Check In/Out')}}</span>
                                <span>
                                {{ date(hh_date_format(), $checkIn) }} - {{ date(hh_date_format(), $checkOut) }}
                            </span>
                            </li>
                        @else
                            <li>
                                <span>{{__('Date')}}</span>
                                <span>
                                {{ date(hh_date_format(), $checkIn) }}
                                </span>
                            </li>
                            <li>
                                <span>{{__('Time')}}</span>
                                <span>
                                {{ date(hh_time_format(), $checkIn) }} - {{ date(hh_time_format(), $checkOut) }}
                            </span>
                            </li>
                        @endif
                        @if ($adults > 0)
                            <li>
                                <span>{{ _n("[0::Adults][1::Adult][2::Adults]", $adults) }}</span>
                                <span> {{ $adults }}  </span>
                            </li>
                        @endif
                        @if ($children > 0)
                            <li>
                                <span>{{ _n("[0::Children][1::Child][2::Children]", $children) }}</span>
                                <span>{{ $children }}</span>
                            </li>
                        @endif
                        @if ($infant > 0)
                            <li>
                                <span>{{ _n("[0::Infants][1::Infant][2::Infants]", $infant) }}</span>
                                <span>{{ $infant }}</span>
                            </li>
                        @endif
                    </ul>
                    <ul class="menu cart-list">
                        <?php
                        $numberNight = $cartData['numberNight'];
                        $basePrice = $checkout_data['basePrice'];
                        $extraPrice = $checkout_data['extraPrice'];
                        $tax = $checkout_data['tax'];
                        $coupon = isset($checkout_data['couponPrice']) ? $checkout_data['couponPrice'] : '';
                        ?>
                        <li>
                          <span>{{__('Base Price')}} </span>
                            <span>{{ $basePrice }} {{__('Rial')}}</span>
                        </li>
                        @if ($extraPrice > 0)
                            <li>
                                <span>{{__('Extra Service')}}</span>
                                <span>{{ convert_price($extraPrice) }}</span>
                            </li>
                        @endif
                        @if (!empty($coupon))
                            <li>
                                <span>{{__('Coupon')}}</span>
                                <span>-{{ $coupon }}</span>
                            </li>
                        @endif
                        <?php
                        $tax_value = (float)$checkout_data['tax']['tax'];
                          $Commission = (float)$checkout_data['commission']['Commission'];
                        if($tax_value > 0):
                        ?>
                   
                            <span>{{__('Labayh Commission') }}
                                
                            </span>
                            <span>{{$Commission }}% ({{($basePrice*$Commission)/100}} ريال)</span>
                        </li>
                        <li >
                            <span>{{__('Tax') }}
                                <span class="text-muted">
                                    @if ($checkout_data['tax']['included'] == 'on')
                                        {{__('(included)')}}
                                    @endif
                                </span>
                            </span>
                            <span>{{ $tax_value }}% ({{(($basePrice+($basePrice*$Commission)/100)*$tax_value)/100}} ريال )</span>
                        </li>
                        <?php endif; ?>
                        <li>
                            <span>{{__('Amount')}}</span>
                            <span>{{ $checkout_data['amount'] }} {{__('Rial')}}</span>
                        </li>
                    </ul>
                </div>
            </div>
            
               <div class="item client-info">
                    <span class="title">{{__('Your information:')}}</span>
                    <?php
                    $user_data = get_booking_data($bookingObject->ID, 'user_data');
                    ?>
                    <span class="info">
                    <p>{{ $user_data['firstName'] }} {{ $user_data['lastName'] }}</p>
                    <p>{{ $user_data['email'] }}</p>
                    <p>{{ $user_data['phone'] }}</p>
                    <p>{{ $user_data['address'] }} | {{ $user_data['city'] }} | {{ $user_data['postCode'] }}</p>
                    @if($bookingObject->note)
                            <p>{{__('Note:')}} {{ $bookingObject->note }}</p>
                        @endif
                </span>
                </div>
            
         
                    </div>
                    <div class="text-center mt-5">
                      <div class="row">
                            <div class="col-md-8">
                                <label for="">{{ __('To see invoice details and get') }}</label>
                                <span>{{ __('Booking site and advertiser information, please go to the site and application') }}</span>
                            </div>
                            <div class="col-md-4">
                                <a href="{{ dashboard_url('bookings') }}"
                           class="btn btn-primary m-auto">{{__('Go to Your Booking')}}</a>
                            </div>
                        </div>
                    </div>
                      <div class="text-center mt-3">
                          <form action="{{ route('send-gift') }}" method="post">
                              @csrf
                        <div class="row gift pp">

                            <div class="col-md-6 gift fnt pp">
                                <label for="">{{ __('Send this day to someone you love as a gift') }}</label>
                              <i class="fas fa-gift " style="font-size: xx-large;color: yellow;"></i>
                            </div>
                              <div class="col-md-3 pp ">
                                     <label for="" class="pp">{{__('Enter the mobile number')}}</label>
                                 </div>  
                            <div class="col-md-2  pp">
                              <input type="hidden" name="booking_id" value="{{$bookingObject->booking_id}}"  class="form-control gift ">
                                <input type="text" name="phone"  class="form-control gift ">
                            </div>
                            <div class="col-md-1 pp">
                                <button 
                           class="  btn m-auto gift fnt">{{__('send')}}</button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@include('frontend.components.footer')
