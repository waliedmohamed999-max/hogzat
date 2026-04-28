<?php
if (!isset($cart)) {
    return;
}
$experienceID = $cart['serviceID'];
$experienceObject = unserialize($cart['serviceObject']);
?>
<h3 class="heading">{{__('Your Item')}}</h3>
<div class="card-box mt-3 cart-information cart-experience-item">
    <div class="media service-detail d-flex align-items-start">
        <?php
        $thumbnail = get_attachment_url($experienceObject->thumbnail_id, [400, 400])
        ?>
        <img src="{{ $thumbnail }}" class="mr-3"
             alt="{{ get_attachment_alt($experienceObject->thumbnail_id) }}">
        <div class="media-body">
            <a target="_blank"
               href="{{ get_the_permalink($experienceID, '', 'experience') }}">{{ get_translate($experienceObject->post_title) }}</a>
            @if ($address = get_translate($experienceObject->location_address))
                <div class="desc mt-2">
                    <i class="fe-map-pin mr-1"></i> {{ $address }}
                </div>
            @endif
        </div>
    </div>
    <h5 class="title">{{__('Detail')}}</h5>
    <ul class="menu cart-list">
        <?php if ($experienceObject->booking_type == 'package') { ?>
        <li>
            <span>{{ __('Package') }}</span>
            <span>{{ get_translate($cart['cartData']['package']['title']) }}</span>
        </li>
        <?php } ?>
        <?php
        $checkIn = $cart['cartData']['startDate'];
        ?>
        <li>
            <span>{{__('Date')}}</span>
            <span>
            {{ date(hh_date_format(), $checkIn) }}
            </span>
        </li>
        <?php if ($experienceObject->booking_type == 'date_time') {
        $startTime = $cart['cartData']['startTime'];
        ?>
        <li>
            <span>{{__('Time')}}</span>
            <span>
                {{ date(hh_time_format(), $startTime) }}
                </span>
        </li>
        <?php
        } ?>
        <?php
        if($experienceObject->durations && $experienceObject->booking_type != 'just_price'){
        ?>
        <li>
            <span>{{__('Duration')}}</span>
            <span>
                {!! balanceTags(get_translate($experienceObject->durations)) !!}
            </span>
        </li>
        <?php if ($experienceObject->booking_type != 'package') { ?>
        <li>
            <span>{{ __('No. Pax') }}</span>
            <span>{{ $cart['cartData']['numberGuest'] }}</span>
        </li>
        <?php } ?>
        <?php
        }
        ?>
    </ul>
    <?php
    $coupon = isset($cart['cartData']['coupon']) ? $cart['cartData']['coupon'] : [];
    $couponCode = isset($coupon->coupon_code) ? $coupon->coupon_code : '';
    ?>
    <form action="{{ url('add-coupon') }}" class="form-sm form-action form-add-coupon"
          data-validation-id="form-add-coupon"
          method="post"
          data-reload-time="1000">
        @include('common.loading')
        <div class="form-group">
            <label for="coupon">{{__('Coupon Code')}}</label>
            <input id="coupon" type="text" class="form-control" name="coupon"
                   value="{{ $couponCode }}"
                   placeholder="{{__('Have a coupon?')}}">
            <input type="hidden" name="service_id"
                   value="{{ $experienceID }}">
            <input type="hidden" name="service_type"
                   value="experience">
            <button class="btn" type="submit" name="sm"><i class="fe-arrow-right "></i>
            </button>
        </div>
        <div class="form-message"></div>
    </form>
 
    <h5 class="title">{{__('Summary')}}</h5>
    <ul class="menu cart-list">
        <?php
        $extraPrice = $cart['extraPrice'];
        $tax = $cart['tax'];
        ?>
           <?php 
    if ($experienceObject->booking_type != 'just_price'){
        
    ?>
        <?php
        if ($experienceObject->booking_type == 'package'){
        ?>
        <li>
            <span>{{ __('Price') }}</span>
            <span>{{ convert_price($cart['cartData']['package_price']) }}</span>
        </li>
        <?php
        }else{
        $price_categories = $experienceObject->price_categories;
        if(in_array('enable_adults', $price_categories) && $cart['cartData']['groupPrices']['adult'] > 0){
        ?>
        <li>
            <span>{{ __('Adults') }}</span>
            <!--<span>{{ convert_price($cart['cartData']['groupPrices']['adult']) }}</span>-->
        </li>
        <?php
        }
        ?>
        <?php
        if(in_array('enable_children', $price_categories) && $cart['cartData']['groupPrices']['child'] > 0){
        ?>
        <li>
            <span>{{ __('Children') }}</span>
            <span>{{ convert_price($cart['cartData']['groupPrices']['child']) }}</span>
        </li>
        <?php
        }
        ?>
        <?php
        if(in_array('enable_infants', $price_categories) && $cart['cartData']['groupPrices']['infant'] > 0){
        ?>
        <li>
            <span>{{ __('Infants') }}</span>
            <span>{{ convert_price($cart['cartData']['groupPrices']['infant']) }}</span>
        </li>
        <?php
        }
        }
        ?>
        @if ($extraPrice > 0)
            <li>
                <span>{{__('Extra Service')}}</span>
                <span>{{ convert_price($extraPrice) }}</span>
            </li>
        @endif
       
       
        <?php
        }
        $tax_value = (float)$cart['tax']['tax'];
        $Commission = (float)$cart['commission']['Commission'];
        $basePrice = $cart['basePrice'];
        if($tax_value > 0){
        ?>
         <li class="divider">
            <span>{{__('Labayh Commission')}}</span>
            <span>{{$Commission }}% ({{ number_format(($basePrice*$Commission)/100,2,",",".")
            
            }} ريال)</span>
        </li>
        <li class="divider">
            <span>{{__('Tax')}}
                <span class="text-muted">
                    @if ($cart['tax']['included'] == 'on')
                        {{__('(included)')}}
                    @endif
                </span>
            </span>
           <span>{{ $tax_value }}% ({{
            number_format((($basePrice+($basePrice*$Commission)/100)*$tax_value)/100,2,",",".") }} ريال )</span>
        </li>
        <?php
        }
        ?>
         @if (!empty($coupon))
            <li>
                <form action="{{ url('remove-coupon') }}" class="form-action" method="post"
                      data-validation-id="form-remove-coupon"
                      data-reload-time="1500">
                    @include('common.loading')
                    <input type="hidden" name="experienceID"
                           value="{{ $experienceID }}">
                    <div class="d-flex align-items-center">
                        <span>
                            {{__('Coupon')}}
                            <button class="btn ml-2" type="submit" name="sm">({{__('Remove')}})</button>
                        </span>
                        <span>- {{ $coupon->couponPriceHtml }}</span>
                    </div>
                    <div class="form-message"></div>
                </form>
            </li>
        @endif
        <li class="amount">
            <span>{{__('Amount')}}</span>
            <span>{{ number_format($cart['amount'],2,",",".") }} ريال</span>
        </li>
    </ul>
</div>
