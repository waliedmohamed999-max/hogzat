@include('frontend.components.header')
<div class="hh-checkout-page pb-4">

    @include('frontend.components.breadcrumb', ['currentPage' => 'Checkout', 'inContainer' => true])

    <div class="container">
        @if ($cart)
            <?php
            $service_type = $cart['serviceType'];
          
            if (isset($cart['cartData']['voteable'])) {
              $voteable=  $cart['cartData']['voteable'];
            }

            ?>
            <div class="row">
                <div class="col-12 col-lg-4 order-lg-8">
                    <div class="checkout-sidebar mt-4">
                        @include('frontend.'. $service_type.'.cart-item', ['cart' => $cart])
                    </div>
                </div>
                <div class="col-12 col-lg-8 order-lg-0">
                    <div class="checkout-content mt-4">
                        <h3 class="heading">{{__('Checkout')}}</h3>
                        <div class="card-box card-border mt-3">
                            <ul class="nav nav-tabs nav-bordered">
                                <li class="nav-item">
                                    <a href="#co-customer-information" data-toggle="tab" aria-expanded="false"
                                       class="nav-link active">
                                        {{__('1. Customer Information')}}
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="#co-payment-selection" data-toggle="tab" aria-expanded="true"
                                       class="nav-link">
                                        {{__('2. Payment Selection')}}
                                    </a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane relative show active" id="co-customer-information">

                                    <form id="checkout-payment-info" action="{{ url('checkout') }}"
                                    data-google-captcha="yes"  method="POST"  enctype="multipart/form-data"
                                    class="form checkout-form  relative">
                                  @csrf
                                        @include('common.loading')
                                        <?php
                                        if (is_user_logged_in()) {
                                            $user_checkout = get_user_meta(get_current_user_id(), 'user_checkout_information', false);
                                        } else {
                                            $user_checkout = false;
                                        }

                                        ?>
                                        @if($user_checkout)
                                            <?php
                                            enqueue_script('switchery-js');
                                            enqueue_style('switchery-css');
                                            ?>
                                            <div class="use-last-user-checkout">
                                                <div class="form-group d-flex align-items-center">
                                                    <input type="checkbox" id="last-user-checkout"
                                                           name="use_last_checkout"
                                                           data-plugin="switchery" data-color="#1abc9c" value="on"
                                                           data-size="small"/>
                                                    <label class="mb-0 ml-1"
                                                           for="last-user-checkout">{{__('Use last your information')}}</label>
                                                </div>
                                                <div class="detail">
                                                    <p>
                                                        <strong>{{__('Email:')}} </strong><span>{{ $user_checkout['email'] }}</span>
                                                    </p>
                                                    <p>
                                                        <strong>{{__('Full Name:')}} </strong><span>{{ $user_checkout['firstName'] }} {{ $user_checkout['lastName'] }}</span>
                                                    </p>
                                                    <p>
                                                        <strong>{{__('Phone:')}} </strong><span>{{ $user_checkout['mobile'] }}</span>
                                                    </p>
                                                    <p>
                                                        <strong>{{__('Address:')}} </strong><span>{{ $user_checkout['address'] }} | {{ $user_checkout['city'] }} | {{ !empty($user_checkout['country'])? $user_checkout['country'] . ' | ': '' }} {{ $user_checkout['postCode'] }}</span>
                                                    </p>
                                                </div>
                                                <input type="hidden" name="last_user_checkout"
                                                       value="{{ base64_encode(json_encode($user_checkout)) }}">
                                            </div>
                                        @endif
                                        @if($errors->any())
                                        <div class="alert alert-danger text-center" role="alert">
                                        {{$errors->first()}}
                                          </div>

                                    @endif
                                        <div class="row">
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-firstname">{{__('First Name')}}</label>
                                                    <input type="text" name="firstName" id="co-firstname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('First name')}}" value="{{ old('firstName')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('Last Name')}}</label>
                                                    <input type="text" name="lastName" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('Last Name')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-email">{{__('Email')}}</label>
                                                    <input type="text" name="email" id="co-email"
                                                           class="form-control has-validation"
                                                           data-validation="required|email"
                                                           placeholder="{{__('Email')}}">
                                                </div>
                                            </div>
                                             <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('age')}}</label>
                                                    <input type="text" name="name" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('age')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-phone">{{__('Phone')}}</label>
                                                    <input type="text" name="mobile" id="co-phone"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('Phone')}}">
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="form-group mb-3">
                                                    <label for="co-address">{{__('Address')}}</label>
                                                    <input type="text" name="address" id="co-address"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('Address')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-city">{{__('City (Optional)')}}</label>
                                                    <input type="text" name="city" id="co-city" class="form-control"
                                                           placeholder="{{__('City')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-country">{{__('Country')}} (Optional)</label>
                                                    <?php
                                                    enqueue_script('nice-select-js');
                                                    enqueue_style('nice-select-css');

                                                    $countries = list_countries();
                                                    ?>
                                                    <select name="country" id="cc-country" class="form-control wide"
                                                            data-plugin="customselect">
                                                        <option value="">{{__('---- Select ----')}}</option>
                                                        @foreach($countries as $key => $value)
                                                            <option value="{{ $key }}"
                                                                    data-icon="{{ $value['flag24'] }}">{{ $value['name'] }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6" hidden>
                                                <div class="form-group mb-3">
                                                    <label for="co-postcode">{{__('Postcode')}} (Optional)</label>
                                                    <input type="text" name="postCode" id="co-postcode"
                                                           class="form-control"
                                                           placeholder="{{__('Postcode')}}">
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="form-group mb-3">
                                                    <label for="co-note">{{__('Note (Optional)')}}</label>
                                                    <textarea name="note" id="co-note"
                                                              class="form-control"></textarea>
                                                </div>
                                            </div>

                                         
                                            @if(!is_user_logged_in())
                                                <div class="col-12">
                                                    <div class="form-group mb-3">
                                                        <div class="checkbox checkbox-success">
                                                            <input type="checkbox" id="create-user-checkout"
                                                                   name="create_user_checkout"
                                                                   value="1">
                                                            <label
                                                                for="create-user-checkout">{{__('Create an account?')}}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                        
                                        <div class="row">
                                             <div class="col-12 ">
                                               <h3>{{__('Sub information')}}</h3>
                                             </div>

                                               @if (isset($voteable) && $voteable== 'on')
                                            <input type="hidden" name="userID" value="{{ get_current_user_id() }}">
                                            <input type="hidden" name="experienceID" value="{{$cart['cartData']['experienceID']}}">
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('Sub name')}}</label>
                                                    <input type="text" name="name" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('name cat')}}">
                                                </div>
                                            </div>

                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('Sub age')}}</label>
                                                    <input type="text" name="age" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('age cate')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('Sub type')}}</label>
                                                    <input type="text" name="type" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('Type cat')}}">
                                                </div>
                                            </div>
                                            <div class="col-12 col-sm-6">
                                                <div class="form-group mb-3">
                                                    <label for="co-lastname">{{__('Sub image')}}</label>
                                                    <input type="file" name="image" id="co-lastname"
                                                           class="form-control has-validation"
                                                           data-validation="required"
                                                           placeholder="{{__('image cat')}}">
                                                </div>
                                            </div>
                                            @endif
                                        </div>
                                        <div class="tab-footer d-flex align-items-center">
                                            <a href="{{ url('/') }}" class="c-black"><i
                                                    class="fe-arrow-left mr-2"></i>{{__('Return to Home')}}
                                            </a>
                                            <a href="javascript: void(0)"
                                               class="btn btn-primary text-uppercase float-right ml-auto waves-effect waves-light btn-next-payment">
                                                {{__('Continue to Payment')}}
                                            </a>
                                        </div>

                                </div>
                                <div class="tab-pane relative" id="co-payment-selection">

                                        <div class="payment-gateways">
                                            @include('common.loading')
                                            <?php
                                            $allPayment = get_available_payments();

                                            ?>
                                            @if (!empty($allPayment))
                                                @foreach ($allPayment as $key => $paymentName)
                                                    <div class="payment-item payment-{{ $paymentName::getID() }}">
                                                        <div
                                                            class="radio radio-success mb-1 mb-md-3  align-content-center">

                                                            <div class="row">
                                                         <div class="col-md-6">
                                                              <input id="payment-{{ $paymentName::getID() }}"
                                                                   class="payment-method"
                                                                   type="radio" name="payment"
                                                                   value="{{ $paymentName::getID() }}"
                                                                   @if($key == 0) checked @endif>
                                                            <label
                                                                for="payment-{{ $paymentName::getID() }}">{{ $paymentName::getName() }}</label>
                                                            </div>
                                                            <div class="col-md-6">
                                                                 <img src="{{ $paymentName::getLogo() }}" style="    position: initial;"
                                                                                         alt="{{ $paymentName::getName() }}"
                                                                                         class="payment-logo d-none d-md-inline-block">
                                                            </div>
                                                        </div>



                                                        </div>
                                                        <?php
                                                        $desc = $paymentName::getDescription();
                                                        ?>
                                                        @if (!empty($desc))
                                                            <div
                                                                class="payment-desc">{!! balanceTags(nl2br($desc)) !!}</div>
                                                        @endif

                                                        <?php
                                                        $html = $paymentName::getHtml();
                                                        ?>
                                                        @if (!empty($html))
                                                            <div class="payment-html">{!! balanceTags($html) !!}</div>
                                                        @endif

                                                             @if ( $paymentName::getID() == "bank_transfer")
                                                            <div class="payment-html">
                                                                  <label class="custom-upload__button btn" for="file" data-element="custom-upload-button">
                            رفع الإيصال
                        </label><i class="fa fa-file-image-o"></i>
                        <input name="nemo" class="custom-upload__input" id="file" type="file"
                            data-behaviour="custom-upload-input" value="multiple"  />


                                                                </div>
                                                        @endif

                                                    </div>
                                                @endforeach
                                            @endif
                                        </div>
                                        <div class="form-group mt-4">
                                            <div class="checkbox checkbox-success mb-2">
                                                <input type="checkbox" id="term-condition-checkout"
                                                       name="term_condition"
                                                       value="1">
                                                <label for="term-condition-checkout">
                                                    <?php
                                                    $term_page_id = get_option('term_condition_page');
                                                    $term_page = get_post($term_page_id, 'page');

                                                    $url = url('/');
                                                    if ($term_page) {
                                                        $url = get_the_permalink($term_page->post_id, $term_page->post_slug, '','page');
                                                    }
                                                    ?>

                                                    {!! sprintf(__('Agree with <a href="%s" target="_blank">The Terms and Conditions</a>'), $url) !!}
                                                </label>
                                            </div>
                                        </div>
                                        <div class="tab-footer d-flex align-items-center">
                                            <a href="javascript: void(0);"
                                               class="btn-prev-customer c-black"><i
                                                    class="fe-arrow-left mr-2"></i>{{__('Back to Customer Information')}}
                                            </a>
                                            <input type="submit" name="sm"
                                                   value="{{__('Complete Booking')}}"
                                                   class="btn btn-primary text-uppercase float-right ml-auto waves-effect waves-light btn-complete-payment">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @else
            <div class="mt-4">
                @include('common.alert', ['type' => 'danger', 'message' => __('The cart is empty')])
            </div>
        @endif
    </div>
</div>
@include('frontend.components.footer')


