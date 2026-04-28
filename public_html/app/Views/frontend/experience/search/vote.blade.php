@include('frontend.components.header')
<?php
enqueue_style('mapbox-gl-css');
enqueue_style('mapbox-gl-geocoder-css');
enqueue_script('mapbox-gl-js');
enqueue_script('mapbox-gl-geocoder-js');
enqueue_script('search-experience-js');

?>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/0.10.0/lodash.min.js"></script>
@php
$img = get_attachment_url($Vote->image);
$end = unserialize($Vote->end_date);
$experience = get_experience_by_id($Vote->experienceID);
$main = $experience->main_sponsors;
$co = $experience->co_sponsors;
if (!empty($main)) {
    $main = explode(',', $main);
}
if (!empty($co)) {
    $co = explode(',', $co);
}

@endphp

<div class="hh-search-result search-result-experience ">
    <div class="hh-search-form-wrapper">
        <div class="ots-slider-wrapper" data-style="full-screen" data-slider="ots-slider" style="display: block;">
            <div class="ots-slider">
                <div class="item ots-slider-fade ots-slider-fade-current is-showing">
                    <div class="outer has-background-image" data-src="{{ $img }}"
                        style="background-image: url({{ $img }});">
                    </div>
                    <div class="inner">

                    </div>
                </div>
            </div>
        </div>
        <div class="hh-search-form-section" style="padding-bottom: 0px;">
            <div class="container">
                <div class="row">
                    <div class="col-md-6   dd event-name">
                        <div class="event-name-inner">

                            <label for="f" class="event-label">{{ __('Event name') }}</label>
                            <h1 id="dd">
                                {{ get_translate($Vote->experience->post_title) }}

                            </h1>
                            <p class="presenter">{{ __('event presenter') }} :
                                <span class="presenter-name">
                                    لبية
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="col-md-6 begins">
                        <div class="begins-inner">


                            <h4 class="begins-title" style="color: white;">{{ __('Voting begins') }}</h4>
                            <div class="example">

                                <div class="main-example">
                                    <div class="countdown-container" data-timer="{{ $date }}"
                                        id="main-example">
                                    </div>
                                </div>
                                <script type="text/template" id="main-example-template"><div class="time <%= label %>">
                                  <span class="count curr top"><%= curr %></span>
                                  <span class="count next top"><%= next %></span>
                                  <span class="count next bottom"><%= next %></span>
                                  <span class="count curr bottom"><%= curr %></span>
                                  <span class="label"><%= label.length < 6 ? label : label.substr(0, 3)  %></span>
                                </div></script>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<a href="/all-vote" class="retur">
    << العودة للصفحة السابقة</a>
        <div class="hh-search-content-wrapper">
            @include('common.loading')
            <div class="outer-container1">
                <div class=" container" style="    max-width: 1140px;">

                    <div class="hh-search-content ">
                        <div class="row card1">
                            @foreach ($itemvote as $k => $item)
                                <div class="col-12 col-md-3 mt-3 text-center">
                                    <div class="btnn btnVote">
                                        <div class="btn-back">
                                            <div class="content ">
                                                <span class="yes">
                                                    <i class="ti-close"></i>
                                                </span>

                                            </div>
                                            <div style="margin-top: 15px;">
                                                <div id="vv">
                                                    <p>معلومات صاحب الحساب</p>
                                                    <hr>
                                                    <span>{{ __('name') }}:{{ $item->user->first_name }}{{ $item->user->last_name }}</span>
                                                    <span>{{ __('age') }}:{{ $item->age }} </span>
                                                    <span>{{ __('city') }}:{{ $item->user->address }}</span>
                                                    <p>معلومات المشترك</p>
                                                    <hr>
                                                    <span>{{ __('name') }}:{{ $item->name }}</span>
                                                    <span>{{ __('age') }}:{{ $item->age }} </span>
                                                    <span>{{ __('type') }}:{{ $item->type }}</span>
                                                </div>
                                                <div class="row mt-2">
                                                    <div class="col-md-8">
                                                        <p class="vote"><span
                                                                style="display: block;">{{ $item->count_vote }}
                                                            </span>{{ __('vote') }}</p>
                                                    </div>
                                                    <div class="col-md-3">

                                                        <img src="{{ asset('images/VOTE-Labayh.png') }}"
                                                            alt="" width="60px" height="100%">
                                                    </div>
                                                </div>

                                            @if ($startVote != 0)
                                                @if (is_user_logged_in())
                                                    @php
                                                        $check = checkVote($item->id);
                                                    @endphp
                                                    
                                                    @if ($check != null)
                                                        <button style="background-color: red"
                                                            data-id="{{ $item->id }}" id="votebutton">
                                                            تم التصويت للمشترك
                                                        </button>
                                                    @else
                                                        <button class="vote" data-id="{{ $item->id }}"
                                                            id="votebutton">صوت
                                                            للمشترك</button>
                                                    @endif
                                                @else
                                                    <button data-toggle="modal" data-target="#hh-login-modal"
                                                        data-id="{{ $item->id }}" id="votebutton">صوت
                                                        للمشترك</button>
                                                @endif
                                                  @endif
                                            </div>
                                        </div>
                                        <div class="btn-front">
                                            @php
                                                $thumbnail = get_attachment_url($item->image, [500, 750]);
                                            @endphp
                                            <img src="{{ $thumbnail }}"
                                                style="border-radius: 20px; width: 100%"height="100%">

                                            <div style="position: absolute;top: -25px;left: -1px;margin: 30px 5px;">

                                                <p id="userDitails">
                                                    {{ __('user number') }}
                                                    <span class="user-number"
                                                        style="position: relative;top: -10px; 
                                                        font-size: 35px;font-weight: 800;color: #e5ce2e;">{{ $k + 1 }}</span>
                                                </p>
                                            </div>

                                            @if ($item->link != null)
                                                <a id="play-video" class="video-play-button "
                                                    data-link="https://www.youtube.com/watch?v=HU-B9KCtrlA">
                                                    <span></span> </a>
                                            @endif
                                            <div id="divDitail">
                                                <p class="numVote"> {{ __('count vote') }} ( <span
                                                        style="display: contents;color:#c6a651">{{ $item->count_vote }}
                                                        {{ __('vote') }}</span> )</p>

                                                <button class="Ditails">
                                                    {{ __('Sub information') }}
                                                    <span style="font-weight: 900;">
                                                        << </span>
                                                </button>
                                                <!--<img src="{{ asset('images/icons8-forward-arrow-50.png') }}" width=" 20px">-->

                                            </div>

                                        </div>
                                    </div>

                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

            </div>

            <div class="hh-search-content-wrapper">

                <div class="outer-container">
                    <div class=" container" style="    max-width: 1140px;">
                        @if (!empty($main))
                            <hr style="    width: 100%;">

                            <small>الرعاة الرئيسيين</small>
                            <div class="mt-3 partner-1">
                                <div class="row">
                                    <?php
               foreach ( $main as $key => $val ) {
                $thumbnail = get_attachment_url($val, [250, 80]);
            ?>
                                    <div class="col-md-4 col-6 text-center">
                                        <img class="partner" src="{{ $thumbnail }}" />
                                    </div>
                                    <?php
               }
           ?>

                                </div>
                            </div>
                        @endif
                        @if (!empty($co))
                            <small>الرعاة المشاركين</small>
                            <div class="mt-3 partner-2">
                                <div class="row">
                                    <?php
               foreach ( $co as $key => $val ) {
                $thumbnail = get_attachment_url($val, [240, 80]);
            ?>
                                    <div class="col-md-3 col-6 text-center mt-4">
                                        <img class="partner" src="{{ $thumbnail }}" />
                                    </div>
                                    <?php
               }
           ?>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        </div>



        @include('frontend.components.footer')
