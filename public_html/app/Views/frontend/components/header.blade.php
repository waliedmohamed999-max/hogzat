<?php do_action('frontend_init'); ?>
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <?php
    $favicon = get_option('favicon');
    $favicon_url = get_attachment_url($favicon);
    ?>
    <link rel="shortcut icon" type="image/png" href="{{ $favicon_url }}" />
    <title>{{ page_title() }}</title>
    {{ seo_output() }}
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,400&display=swap"
        rel="stylesheet">
        <link href="{{ asset('caching/h_home-page_m_frontend_rtl.css') }}" rel="stylesheet">

        <link href="{{ asset('caching/f_home-page_m_frontend_rtl.css') }}" rel="stylesheet">
        <link href="{{ asset('css/labayh-refresh.css') }}" rel="stylesheet">
       <?php do_action('header'); ?>
    <?php do_action('init_header'); ?>
    <?php do_action('init_frontend_header'); ?>
    <?php
    $body_class = isset($bodyClass) ? $bodyClass : '';
    if (is_user_logged_in() && (is_admin() || is_partner())) {
        $body_class .= ' has-admin-bar';
    }
    ?>
</head>
<style>
.modal-header h4{
   font-size: 20px;

}
input[type=text]:focus-visible {
  border: 2px solid #5700c5;
}
#hh-login-modal {
    margin-left: 0px;
}
.digit-group input {
    width: 60px;
    height: 55px;
    border-radius: 13px;
    background-color: #ffffff;
    line-height: 50px;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
    color: #3c3c3c;
    margin: 0 2px;
    border: 1px solid #e2e1e1;
    box-shadow: rgb(0 0 0 / 15%) 0px 1px 5px;
    /* border-radius: 0.65rem; */
}
    .d {
        border: 0px;
        background-color: #ffffff;
       box-shadow: rgb(0 0 0 / 15%) 0px 1px 5px;
        border-radius: 25px;
    }

    #submit {
        font-size: initial;
        color: #5a409b;
    }

    .resendcode {
        border-radius: 25px;
        background-color: #f7f7f7;
        color: #5a409b;

    }

    .code {

        width: 50%;
        margin-right: 25%;
        border-radius: 25px;
    }
    .awe-booking .form-control, .awe-booking .nice-select{
        border-radius: 30px;
    }

    .con {
         width: 25%;
        position: absolute;
        left: -3%;
        top: 48%;
            text-align: right;


        border-right: solid 1px gainsboro;
        }
        .closeBUton{
            position: absolute;
            left: 31px;
            top: 1%;
            font-size: xxx-large;
        }
.closeBUton1{
            position: absolute;
            left: 31px;
            top: 1%;
            font-size: xxx-large;
        }
    @media only screen and (max-width: 600px) {

        .con {
             margin-top: 8%;
               left: -3%;
               top: 9%;
        }
        .closeBUton{
            top: -138%;
        }
         .closeBUton1{
               top: -158%;

        }
        .imglogin{    border-bottom-right-radius: 25px;
}
    }
@media(max-width: 575px) {
     .test {    display: none;}

}
    .float {
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: 40px;
        right: 40px;
        background-color: #54c17d;
        color: #FFF;
        border-radius: 50px;
        text-align: center;
        font-size: 30px;
        box-shadow: 2px 2px 3px #999;
        z-index: 100;
        padding: 7px;
    }
    .modal-body{
        margin-bottom: 4%;
        box-shadow: -2px -3px 4px #fff;
        height: 65%;
        text-align: center;
    }
    .llabell{
        position: absolute;
        top: -13px;
        background: #ffffff;
        padding: 0px 7px;
        color: #bcbcbc;
        z-index: 1;
        right: 37px;
    }


    .float:hover {
        color: #e9e9e9;
    }
@media only screen and (min-width: 768px){
.test {
    position: absolute;
    right: -50%;
    bottom: 86%;
    color: #fff;
    border-bottom-right-radius: 18px;
    border-bottom-left-radius: 18px;
    background-color: #695697;
    font-weight: 500;
}}
</style>

<body class="awe-booking {{is_rtl()? 'rtl': ''}} {{ $body_class }} {{ current_screen() == 'home-page' ? 'screen-home-page' : '' }}">

    <?php do_action('after_body_frontend'); ?>
    <nav id="mobile-navigation" class="main-navigation mobile-natigation d-lg-none" aria-label="{{__('Top Menu')}}">
        <div class="menu-primary-container">
            <?php
        if (has_nav_primary()) {
            get_nav([
                'location' => 'primary',
                'walker' => 'main-mobile'
            ]);
        }
        ?>
        </div>
    </nav><!-- #site-navigation -->
    @include('common.loading', ['class' => 'page-loading'])
    @if(!is_user_logged_in())
    <div id="hh-login-modal" class="modal fade modal-no-footer" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="    border-radius: 25px;">
                <div class="row">
                    <div class="col-md-6" >
                        <div class="modal-header" style="justify-content: flex-start;">

                            <h4 class="modal-title text-uppercase" style=" font-size: 20px; ">{{__('Login')}}</h4>

                            <h4 style="margin: 0px;font-size: 20px;">/{{__('Sign Up')}}</h4>

                        </div>
                        <div class="modal-body" >

                            <form id="hh-login-form" class="form form-sm form-action" action="{{ url('auth/check') }}"
                                data-validation-id="form-login" data-reload-time="1500" method="post">
                                @include('common.loading')
                                <div class="form-group ">
                                    <h4 for="mobile-login-form" style="  color:#000;  font-size: 12px;">
                                        {{__('Enter the mobile number of the retail account or login')}}</h4>

                                    <div class="row">
                                        <div class="col-12 ">

                                            <label for="mobile-login-form llabell" >{{__('Enter the mobile number')}}</label>

                                            <input class="form-control has-validation d" data-validation="required"
                                                type="text" style="border-radius: 25px;" maxlength="10" minlength="9"
                                                id="email-login-form" name="mobileCheck" placeholder="0500000000">
  <div class="con">
                                                {{-- <label >966+</label> --}}
                                                <img src="{{asset('images/saudia.png')}}"
                                                    style="width:35%;    margin-right: 15%;">
                                            </div>
                                        </div>





                                    </div>

                                </div>


                                <div class="form-group mb-0 mt-4 text-center" style="padding: 0px 75px;">
                                    {!! referer_field(false) !!}
                                    <button style="border-radius: 25px;"
                                        class="btn btn-primary btn-block text-uppercase" type="submit">
                                        {{__('Log In')}}</button>
                                </div>
                                <div class="form-message"></div>
                                @if(has_social_login())
                                <div class="text-center">
                                    <p class="mt-3 text-muted">{{__('Log in with')}}</p>
                                    <ul class="social-list list-inline mt-3 mb-0">
                                        @if(social_enable('facebook'))
                                        <li class="list-inline-item">
                                            <a href="{{ FacebookLogin::get_inst()->getLoginUrl() }}"
                                                class="social-list-item border-primary text-primary"><i
                                                    class="mdi mdi-facebook"></i></a>
                                        </li>
                                        @endif
                                        @if(social_enable('google'))
                                        <li class="list-inline-item">
                                            <a href="{{ GoogleLogin::get_inst()->getLoginUrl() }}"
                                                class="social-list-item border-danger text-danger"><i
                                                    class="mdi mdi-google"></i></a>
                                        </li>
                                        @endif
                                    </ul>
                                </div>
                                @endif
                                {{-- <div class="mt-3 d-sm-flex align-items-center justify-content-between">
                              <p>{{__('Don\'t have an account?')}}
                                <a href="javascript: void(0)" data-toggle="modal" data-target="#hh-register-modal"
                                    class="font-weight-bold">{{__('Sign Up')}}</a>
                                </p>
                                <p>
                                    <a href="javascript: void(0)" data-toggle="modal"
                                        class="font-weight-bold">{{__('Reset Password')}}</a></p>
                        </div> --}}
                        </form>
                    </div>

                </div>
                <div class="col-md-6">
                    <button type="button" class="close closeBUton" data-dismiss="modal" aria-hidden="true"
                   >×
                    </button>
                    <img src="{{asset('images/Teamwork_Illustration.jpg')}}" style="     border-top-left-radius: 25px; border-bottom-left-radius: 25px;
    border-right: 1px solid #eee;"
                        height="100%" width="100%" alt="" class="imglogin">
                </div>
            </div>

        </div>
    </div>
    </div><!-- /.modal -->
    <div id="hh-register-modal" class="modal fade modal-no-footer" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content"  style="border-radius: 25px;">
                <div class="row">
                    <div class="col-md-6">
                        <div class="modal-header">
                            <h4 class="modal-title text-uppercase">{{__('Please fill in the information to complete the registration process')}}</h4>
                        </div>
                        <div class="modal-body" style="margin-bottom: 4%;box-shadow: -2px -3px 4px #fff; height: 65%;">
                            <form id="hh-sign-up-form" action="{{ url('dashboard/update-your-profile') }}" method="post" data-reload-time="1500"
                                data-validation-id="form-sign-up" class="form form-action">
                                @include('common.loading')
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="first-name-reg-form llabell">{{__('First Name')}}</label>
                                            <input class="form-control" type="text" id="first-name-reg-form" name="first_name"
                                                placeholder="{{__('First Name')}}">
                                                <input type="hidden" id="mobile_update"
                                                name="mobile">
                                                <input  type="hidden" id="id_user_update"
                                                name="user_id">

                                                <input type="hidden" name="user_encrypt"  id="user_encrypt" value="55">
                                            </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="last-name-reg-form llabell">{{__('Last Name')}}</label>
                                            <input class="form-control" type="text" id="last-name-reg-form" name="last_name"
                                                placeholder="{{__('Last Name')}}">
                                        </div>
                                    </div>
                                </div>


                                <div class="form-group">
                                    <label for="email-address-reg-form llabell">{{__('Email address')}}</label>
                                    <input class="form-control has-validation" data-validation="required|email" type="email"
                                        id="email-address-reg-form" name="email" placeholder="{{__('Email')}}">
                                </div>

                                <div class="form-group mb-0 text-center">
                                    <button style="border-radius: 25px;" class="btn btn-primary btn-block text-uppercase" type="submit">
                                        {{__('Continue recording')}}</button>
                                </div>
                                <div class="form-message"></div>

                            </form>


                        </div>
                    </div>
                    <div class="col-md-6">
                        <button type="button" class="close closeBUton" data-dismiss="modal" aria-hidden="true"
                      >×</button>
                            <img src="{{asset('images/Teamwork_Illustration.jpg')}}" style="    border-top-left-radius: 25px; border-bottom-left-radius: 25px;
    border-right: 1px solid #eee;"
                            height="100%" width="100%" alt="" class="imglogin">
                    </div>
                </div>

            </div>
        </div>
    </div><!-- /.modal -->
    <div id="hh-fogot-password-modal" class="modal fade modal-no-footer" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="border-radius: 25px;">
                <div class="row">
                    <div class="col-md-6">
                        <div class="modal-header">
                            <h4 class="modal-title text-uppercase" style="color: #5a409b;font-size: 20px;">{{__('Enter Code')}}</h4>
                        </div>

                        <div class="modal-body" style="margin-bottom: 4%;box-shadow: -2px -3px 4px #fff; height: 65%;">
                            <label for="email-address-reset-pass-form">{{__('sent a message to the number')}}<span
                                    id="SendMobile"> </span></label>
                            <form id="hh-reset-password-form" action="{{ url('auth/login') }}" method="post"
                                data-validation-id="form-reset-password" data-reload-time="1500" class="form form-action">
                                @include('common.loading')
                                <div class="form-group digit-group mt-3 mb-3">

                                    <input type="hidden" id="mobile_code"
                                        name="mobile">
                                        <input  type="hidden" id="showUpdateModal"
                                        name="showUpdateModal">

                                    <!--<input class="form-control h d code" type="text"-->
                                    <!--    style="letter-spacing: 28px;border-radius: 25px;padding-right: 0.9rem;" maxlength="4"-->
                                    <!--    name="password" placeholder="{{__('code')}}">-->
                                         <input type="text" id="digit-1" name="digit1" data-previous="digit-2" maxlength="1">
                                    <input type="text" id="digit-2" name="digit2" data-next="digit-1" data-previous="digit-3" maxlength="1" >
                                    <input type="text" id="digit-3" name="digit3" data-next="digit-2" data-previous="digit-4" maxlength="1">
                                    <input type="text" id="digit-4" name="digit4" data-next="digit-3" maxlength="1" >
                                </div>
                                <div class="form-group  mt-2 text-center">
                                    <button class="btn btn-primary btn-block text-uppercase code" type="submit">
                                        {{__('check')}}</button>
                                </div>
                                <div class="form-group mb-0 text-center mt-3">
                                    <div>{{__('If you check the verification code you can do')}}
                                        <span id="time" style="color: red;">02:00</span>
                                        <button class="btn btn-primary btn-block text-uppercase resendcode" id="submitCode"
                                            style="display: none; background: rgb(244 244 245 / 0%);
                                            ;border-color:  rgb(244 244 245 / 0%);color: #5a409b;">
                                            {{__('Resend Code')}}</button>
                                    </div>
                                </div>

                                <div class="form-message"></div>
                            </form>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <button type="button" class="close closeBUton1" data-dismiss="modal" aria-hidden="true"
                   >×</button>
                        <img src="{{asset('images/Teamwork_Illustration.jpg')}}" style="     border-top-left-radius: 25px; border-bottom-left-radius: 25px;
    border-right: 1px solid #eee;"
                        height="100%" width="100%" alt="" class="imglogin">
                    </div>
                </div>

            </div>
        </div>
    </div><!-- /.modal -->
    @endif
    <?php
$langs = get_languages(true);
$currencies = list_currencies();
$current_lang = get_current_language();
?>
    <div id="hh-modal-global" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header no-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="ti-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    @if(count($langs))
                    <h4 class="title mt-0">{{__('Select Language')}}</h4>
                    <ul class="list-unstyled list-languages row mt-3">
                        @foreach($langs as $key => $lang)
                        @if($current_lang == $lang['code'])
                        <li class="col-6 col-md-4 mb-3 item current">
                            <a href="javascript: void(0)">{{__($lang['name'])}}</a>
                        </li>
                        @else
                        <li class="col-6 col-md-4 mb-3 item">
                            <a href="{{add_query_arg('lang', $lang['code'], current_url())}}">{{$lang['name']}}</a>
                        </li>
                        @endif
                        @endforeach
                    </ul>
                    @endif
                    @if(count($currencies))
                    <h4 class="title mt-0">{{__('Select Currency')}}</h4>
                    <ul class="list-unstyled list-currencies row mt-3">
                        @foreach($currencies as $key => $currency)
                        @if($currency['unit'] == current_currency('unit'))
                        <li class="col-6 col-md-4 mb-3 item current">
                            <a href="javascript: void(0)">
                                <span class="symbol">{{$currency['unit']}} - {{$currency['symbol']}}</span>
                                <span class="name">{{get_translate($currency['name'])}}</span></a>
                        </li>
                        @else
                        <li class="col-6 col-md-4 mb-3 item">
                            <a href="{{add_query_arg('currency', $currency['unit'], current_url())}}">
                                <span class="symbol">{{$currency['unit']}} - {{$currency['symbol']}}</span>
                                <span class="name">{{get_translate($currency['name'])}}</span>
                            </a>
                        </li>
                        @endif
                        @endforeach
                    </ul>
                    @endif
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    <div class="body-wrapper">
        <?php
    $sticky = get_option('enable_sticky', 'off');
    $classSticky = '';
    if ($sticky == 'on') {
        enqueue_script('sticky-js');
        $classSticky = 'has-sticky';
    }
    ?>
        <header id="header" class="header {{$classSticky}}">
            <span class="d-block d-lg-none" id="toggle-mobile-menu"><span class="top"></span><span
                    class="center"></span><span class="bottom"></span></span>
            <a href="{{ url('/') }}" id="logo">
                <?php
            $logo = get_option('logo');
            $logo_url = get_attachment_url($logo);
            ?>
                <img src="{{ $logo_url }}" alt="img-logo" class="img-logo">
            </a>
            <nav id="site-navigation" class="main-navigation d-none d-lg-block" aria-label="Primary Menu">
                <div class="menu-prmary-container">
                    <?php
                if (has_nav_primary()) {
                    get_nav([
                        'location' => 'primary',
                        'walker' => 'main'
                    ]);
                }
                ?>
                </div>
            </nav><!-- #site-navigation -->
            <div id="right-navigation" class="right-navigation">
                <ul class="list-unstyled topnav-menu mb-0">
                    @if(count($langs) || count($currencies))
                    <li class="dropdown global-list">
                        <a class="nav-item nav-item--global" href="javascript: void(0)" data-toggle="modal"
                            data-target="#hh-modal-global">
                            <!--{!! balanceTags(get_icon('global', '#AAAAAA', '18px', '18px')) !!}-->
                            <i class="fas fa-globe" style="font-size:22px;color:#f7b84b;"></i>

                        </a>
                    </li>
                    <div class="test"><a href="javascript:void(0);" class="nav-link" style="color: white;"> نسخة تجريبية </a></div>
                    @endif
                    @if (is_user_logged_in())
                    <?php
                    $noti = Notifications::get_inst()->countNotificationByUser(get_current_user_id());
                    $user_id = get_current_user_id();
                    $args = [
                        'user_id' => $user_id,
                        'user_encrypt' => hh_encrypt($user_id)
                    ];
                    $userData = get_current_user_data();
                    ?>
                    <li id="hh-dropdown-notification" class="dropdown notification-list"
                        data-action="{{ url('get-notifications') }}"
                        data-params="{{ base64_encode(json_encode($args)) }}">
                        <a class="nav-item dropdown-toggle waves-effect waves-light" data-toggle="dropdown" href="#"
                            role="button" aria-haspopup="false" aria-expanded="false">
                            <i class="fe-bell noti-icon"></i>
                            @if($noti['total'])
                            <span class="badge badge-danger rounded-circle noti-icon-badge">{{ $noti['total'] }}</span>
                            @endif
                        </a>
                        <div class="dropdown-menu dropdown-menu-right dropdown-lg">
                            <!-- item-->
                            <div class="dropdown-item noti-title">
                                <h5 class="m-0">{{__('Notification')}}</h5>
                            </div>
                            <div class="slimscroll noti-scroll">
                                <div class="notification-render">
                                </div>
                            </div>
                            <!-- All-->
                            <a href="{{ dashboard_url('notifications') }}"
                                class="dropdown-item text-center text-primary notify-item notify-all">
                                {{__('View all')}}
                                <i class="fi-arrow-right"></i>
                            </a>
                        </div>
                    </li>
                    <li class="dropdown notification-list">
                        <a class="nav-item dropdown-toggle nav-user waves-effect waves-light" data-toggle="dropdown"
                            href="javascript:void(0);" role="button" aria-haspopup="false" aria-expanded="false">
                            <img src="{{ get_user_avatar($userData->getUserId(), [32,32]) }}" alt="user-image"
                                class="rounded-circle">
                            <span class="pro-user-name ml-1">
                                {{ get_username($userData->getUserId()) }} <i class="ti-angle-down"></i>
                            </span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right profile-dropdown ">
                            <!-- item-->
                            <div class="dropdown-header noti-title">
                                <h6 class="text-overflow">{{__('Welcome !')}}</h6>
                            </div>
                            <!-- item-->
                            <a href="{{ dashboard_url('profile') }}" class="dropdown-item notify-item">
                                <i class="fe-user"></i>
                                <span>{{__('Profile')}}</span>
                            </a>
                             <a href="{{ dashboard_url('favourite','home') }}" class="dropdown-item notify-item">
                                <i class="far fa-heart"></i>
                                <span>{{__('My Favourite home')}}</span>
                            </a>
                            <a href="{{ dashboard_url('favourite','experience') }}" class="dropdown-item notify-item">
                                <i class="far fa-heart"></i>
                                <span>{{__('My Favourite experience')}}</span>
                            </a>
                            @if(is_admin() || is_partner())
                            @if(is_enable_service('home'))
                            <!-- item-->
                            <a href="{{ dashboard_url('services/homes') }}" class="dropdown-item notify-item">
                                <i class="fe-book-open"></i>
                                <span>{{__('My Homes')}}</span>
                            </a>
                            @endif

                            <!--@if(is_enable_service('experience'))-->
                            <!-- item-->
                            <!--        <a href="{{ dashboard_url('services/experiences') }}" class="dropdown-item notify-item">-->
                            <!--            <i class="fe-book-open"></i>-->
                            <!--            <span>{{__('My Experiences')}}</span>-->
                            <!--        </a>-->
                            <!--@endif-->
                            <!--@if(is_enable_service('car'))-->
                            <!-- item-->
                            <!--        <a href="{{ dashboard_url() }}" class="dropdown-item notify-item">-->
                            <!--            <i class="fe-book-open"></i>-->
                            <!--            <span>{{__('My Cars')}}</span>-->
                            <!--        </a>-->
                            <!--@endif-->
                            @endif

                            @if(is_admin())
                            <!-- item-->
                            <a href="{{ dashboard_url('settings') }}" class="dropdown-item notify-item">
                                <i class="fe-settings "></i>
                                <span>{{__('Settings')}}</span>
                            </a>
                            @endif
                            <!-- item-->
                            <?php
                        $data = [
                            'user_id' => $userData->getUserId(),
                            'redirect_url' => current_url()
                        ];
                        ?>
                            <!-- item-->
                            <a href="{{ dashboard_url('/') }}" class="dropdown-item notify-item">
                                <i class="fe-stop-circle "></i>
                                <span>{{__('Dashboard')}}</span>
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="javascript:void(0)" data-action="{{ auth_url('logout') }}"
                                data-params="{{ base64_encode(json_encode($data)) }}"
                                class="dropdown-item notify-item hh-link-action">
                                <i class="fe-log-out"></i>
                                <span>{{__('Logout')}}</span>
                            </a>
                        </div>
                    </li>
                    @else
                    <li class="d-none d-lg-block li-login">
                        <a href="javascript: void(0);" class="nav-item " data-toggle="modal"
                            data-target="#hh-login-modal">{{__('Login')}}</a>
                    </li>
                    <li class="d-block d-lg-none li-login">
                        <a href="javascript: void(0);" class="nav-item " data-toggle="modal"
                            data-target="#hh-login-modal"><i class="fas fa-sign-in-alt font-22"></i></a>

                    </li>
                    @if(get_option('enable_partner_registration', 'on') == 'on')
                    <li class=" d-lg-block li-become">
                        <a href="{{url('become-a-host')}}" class="nav-item become-a-host">{{__('Become a Partner')}}</a>
                    </li>
                    @endif
                    @endif
                </ul>
            </div>

        </header>

        <div id="content-area">
            <a href="https://api.whatsapp.com/send?phone=00966581633837&text=Hola%21%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20Varela%202."
                class="float">
                <i class="mdi mdi-whatsapp my-float"></i>
            </a>
