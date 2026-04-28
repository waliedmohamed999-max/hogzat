@include('frontend.components.header')
<?php
enqueue_style('home-slider');
enqueue_script('home-slider');

enqueue_style('mapbox-gl-css');
enqueue_style('mapbox-gl-geocoder-css');
enqueue_script('mapbox-gl-js');
enqueue_script('mapbox-gl-geocoder-js');

enqueue_style('daterangepicker-css');
enqueue_script('daterangepicker-js');
enqueue_script('daterangepicker-lang-js');

enqueue_style('iconrange-slider');
enqueue_script('iconrange-slider');

enqueue_script('owl-carousel');
enqueue_style('owl-carousel');
enqueue_style('owl-carousel-theme');



$tab_services = get_option('sort_search_form', convert_tab_service_to_list_item());

 $video_link = get_option('call_to_video_blagat');
?>

@if($errors->any())
<div class="alert alert-danger text-center" role="alert">
    {{$errors->first()}}
</div>

@endif
<div class="home-page labayh-homepage-refresh">
    @if(!empty($tab_services))
    <div class="hh-search-form-wrapper hero-shell">
        <div class="ots-slider-wrapper" data-style="full-screen" data-slider="ots-slider">
            <div class="ots-slider">
                <?php
                    $sliders = get_option('home_slider');
                     $slider_title = get_option('home_slider_title');
                      $slider_desc = get_option('home_slider_desc');
                         $slider_url = get_option('home_slider_link');
                    $sliders = explode(',', $sliders);
                    ?>
                @if(!empty($sliders) && is_array($sliders))
                @foreach($sliders as $id)
                <?php
                            $url = get_attachment_url($id);
                            ?>
                <div class="item">
                    <div class="outer has-background-image" data-src="{{ $url }}"
                        style="background-image: url('{{ $url }}')">

                    </div>
                    <div class="inner">
                        <div class="img has-background-image" data-src="{{ $url }}"
                            style="background-image: url('{{ $url }}');"></div>
                    </div>


                </div>
                @endforeach
                @endif
            </div>
        </div>
        <div class="hh-search-form-section hero-copy-wrap" style="padding-bottom: 0px;">
            <div class="container">
                <div class="row">

                    <div class="col-md-6">
                        <div id="sliderTitle" class="hero-copy-panel">
                            <h1 style="    font-weight: 600;
                                font-size: 35px;
                                color: #ec9b1e;">{{ $slider_title }}</h1>
                            <p>{{ $slider_desc }}</p>
                            <div id="sliderbutton">
                                <a href="{{ $slider_url }}" class="h3 mt-4 buttontitt">
                                    {{__('Subscribe')}}
                                </a>
                            </div>
                        </div>

                    </div>
                    <div class="col-md-6">


                    </div>
                </div>


            </div>
        </div>
        <a id="play-video" class="video-play-button " data-link="{{ $video_link }}">
            <span></span>

        </a>
    </div>

    <section class="labayh-hero-search-shell">
        <div class="container">
            <div class="labayh-hero-search-card">
                @if(!empty($tab_services))
                <div class="tab-content @if(count($tab_services) == 1) pt-0 @endif">
                    @foreach($tab_services as $key => $item)
                    <div class="tab-pane {{$key == 0 ? 'active' : ''}}" id="labayh-tab-search-{{$item['id']}}">
                        <?php
                            start_get_view();
                            if(View::exists('frontend.' . $item['id'] . '.search.search-form')){
                            ?>
                        @include('frontend.'. $item['id'] .'.search.search-form')
                        <?php }
                            $content = end_get_view();
                            echo apply_filters('hh_tab_services_html', $content, $item);
                            ?>
                    </div>
                    @endforeach
                </div>
                @endif
            </div>
        </div>
    </section>

    <section class="labayh-vote-shell">
        <div class="container">
            <div class="labayh-vote-card">
                <div class="row align-items-center">
                    <div class="col-lg-5">
                        <div class="labayh-vote-copy">
                            <span class="labayh-kicker">{{__('Vote')}}</span>
                            <h2>{{__('Labayh voting center')}}</h2>
                            <div class="bar"></div>
                            <p>{{__('It is the first technical voting center in the Kingdom of Saudi Arabia that was made a special currency for the Labayh program')}}</p>
                            <div class="votebuttonAll">
                                <a href="{{route('all-vote')}}" class="btn-liquid">
                                    <span class="inner">{{ __('Vote now') }}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <ul class="labayh-vote-points">
                            <li><span><i class="flaticon-check-mark"></i>{{__('It works technically without the intervention of individuals')}}</span></li>
                            <li><span><i class="flaticon-check-mark"></i>{{__('A voter has the right to vote for more than one person')}}</span></li>
                            <li><span><i class="flaticon-check-mark"></i>{{__('In each stage there is a period associated with the voters')}}</span></li>
                            <li><span><i class="flaticon-check-mark"></i>{{__('Subscriber marketing via a direct link to the voting center')}}</span></li>
                            <li><span><i class="flaticon-check-mark"></i>{{__('Voting is done in 4 stages or more or less')}}</span></li>
                            <li><span><i class="flaticon-check-mark"></i>{{__('Intelligent filtering of contestants from within the system')}}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="hh-search-form-wrapper mm search-panel-shell">

        <div class="hh-search-form-section" style="padding-bottom: 0px;">
            <div class="container">
                <div class="row rowH">

                    <div class="col-md-6">
                        <div class="app-image">
                            <div class="main-image">
                                <!--<img data-src="{{asset('/images/23548.png')}}" style="  width:228px" alt="�&ت��فر ع��0 ا�٬ app store �� ا�٬ andriod" loading="lazy" class="loaded" src="{{asset('/images/23548.png')}}" data-was-processed="true">-->
                                <div class="overview-content">
                                    <div class="content left-content">
                                        <h2>{{__('Labayh voting center')}}
                                        </h2>
                                        <div class="bar"></div>
                                        <p>{{__('It is the first technical voting center in the Kingdom of Saudi Arabia that was made a special currency for the Labayh program')}} </p>
                                        <ul class="services-list">
                                            <li><span><i class="flaticon-check-mark"></i>{{__('It works technically without the intervention of individuals')}}</span>
                                            </li>
                                            <li><span><i class="flaticon-check-mark"></i>{{__('A voter has the right to vote for more than one person')}}</span>
                                            </li>
                                            <li><span><i class="flaticon-check-mark"></i>{{__('In each stage there is a period associated with the voters')}}
                                                  </span></li>
                                            <li><span><i class="flaticon-check-mark"></i>{{__('Subscriber marketing via a direct link to the voting center')}}
                                                </span></li>
                                            <li><span><i class="flaticon-check-mark"></i> {{__('Voting is done in 4 stages or more or less')}}
                                                    </span></li>
                                            <li><span><i class="flaticon-check-mark"></i>{{__('Intelligent filtering of contestants from within the system')}}  
                                                    </span></li>
                                        </ul>
                                    </div>
                                </div>
                                <!--<img src="{{asset('/images/businesses-1.png')}}" alt="image"-->
                                <!--style="    width: 85%;">-->
                               

                            </div>
                               
                            <!--<div class="main-mobile-image">-->
                            <!--    <img src="{{asset('/images/main-mobile.png')}}" alt="image">-->
                            <!--</div>-->

                            <div class="circle-img">
                                <img src="{{asset('/images/circle.png')}}" alt="image">
                            </div>
                            
                        </div>
                        <div class="votebuttonAll">
                                    <a href="{{route('all-vote')}}" class="btn-liquid">
                                        <span class="inner">ص���ت - vote</span>
                                    </a>
                                </div>
                    </div>

                    <div class="col-md-6">
                        <div class="hh-search-form">
                            @if(!empty($tab_services))
                            <!--<div class="nav-wrapper relative" data-tabs-calculation>-->
                            <!--    <ul class="nav nav-tabs" data-tabs>-->
                            <!--        @foreach($tab_services as $key => $item)-->
                            <!--            <li class="nav-item">-->
                            <!--                <a href="#tab-search-{{$item['id']}}" data-toggle="tab"-->
                            <!--                   aria-expanded="false" data-tabs-item-->
                            <!--                   class="nav-link {{$key == 0 ? 'active' : ''}}">-->
                            <!--                    {{ get_translate($item['label']) }}-->
                            <!--                </a>-->
                            <!--            </li>-->
                            <!--        @endforeach-->
                            <!--    </ul>-->
                            <!--</div>-->
                            <div class="tab-content  @if(count($tab_services) == 1) pt-0 @endif">
                                @foreach($tab_services as $key => $item)
                                <div class="tab-pane {{$key == 0 ? 'active' : ''}}" id="tab-search-{{$item['id']}}">
                                    <?php
                                        start_get_view();
                                        if(View::exists('frontend.' . $item['id'] . '.search.search-form')){
                                        ?>
                                    @include('frontend.'. $item['id'] .'.search.search-form')
                                    <?php }
                                        $content = end_get_view();
                                        echo apply_filters('hh_tab_services_html', $content, $item);
                                        ?>
                                </div>
                                @endforeach
                            </div>
                            @endif
                        </div>
                    </div>

                </div>


            </div>
        </div>

    </div>
    @endif
    <div class="container labayh-home-sections">

        <!-- Home in New York -->
        @if(is_enable_service('home'))
        <?php
            $list_services = \App\Controllers\Services\HomeController::get_inst()->listOfHomes([
                'number' => 4,
                'location' => [
                    'lat' => '40.72939317669241',
                    'lng' => '-73.99034249572969',
                    'radius' => 50
                ]
            ]);
            ?>
        @if(count($list_services['results']))
        <h2 class="h3 mt-4">{{__('Homes in New York')}}</h2>
        <div class="bar"></div>
        <p>{{__('Browse beautiful places to stay with all the comforts of home, plus more')}}</p>
        <div class="hh-list-of-services">
            <div class="row">
                @foreach($list_services['results'] as $item)
                <div class="col-12 col-md-6 col-lg-3">
                    @include('frontend.home.loop.grid', ['item' => $item])
                </div>
                @endforeach
            </div>
        </div>
        @endif
        @endif
        <!-- Destination -->
        <?php
        $locations = get_option('top_destination');
        ?>
        @if(!empty($locations))
        <div class="labayh-section-heading">
            <span class="labayh-kicker">{{__('Destinations')}}</span>
            <h2 class="h3 mt-4">{{__('Top destinations')}}</h2>
            <div class="bar"></div>
            <p>{{__('Browse beautiful places to stay with all the comforts of home, plus more')}}</p>
        </div>
        <div class="hh-list-destinations">
            <?php
                $responsive = [
                    0 => [
                        'items' => 1
                    ],
                    768 => [
                        'items' => 2
                    ],
                    992 => [
                        'items' => 3
                    ],
                ];
                ?>
            <div class="hh-carousel carousel-padding nav-style2"
                data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="15" data-loop="0">
                <div class="owl-carousel">
                    @foreach($locations as $location)
                    <?php
                            $lat = $location['lat'];
                            $lng = $location['lng'];
                            $address = get_translate($location['name']);
                            if (isset($location['service']) && !empty($location['service'])) {
                                $services = explode(',', $location['service']);
                            } else {
                                $services = [];
                            }

                            $location_query = [
                                'lat' => $lat,
                                'lng' => $lng,
                                'address' => urlencode($address),
                            ];
                            $location_url = url('/');
                            if (count($services) == 0) {
                                $enable_services = get_enabled_service_keys();
                                if (count($enable_services)) {
                                    $location_url = get_search_page($enable_services[0]);
                                } else {
                                    $location_url = '';
                                }
                            } elseif (count($services) == 1 && is_enable_service($services[0])) {
                                $location_url = get_search_page($services[0]);
                            } elseif (count($services) > 1) {
                                $enable_services = [];
                                foreach ($services as $service) {
                                    if (is_enable_service($service)) {
                                        $enable_services[] = $service;
                                    }
                                }
                                if (count($enable_services)) {
                                    $location_url = get_search_page($enable_services[0]);
                                } else {
                                    $location_url = '';
                                }
                            }
                            if (!empty($location_url)) {
                                $location_url = add_query_arg($location_query, $location_url);
                            } else {
                                $location_url = 'javascript: void(0)';
                            }

                            $rand = rand(1, 6);
                            ?>
                    <div class="item">
                        <div class="hh-destination-item">
                            <a href="{{ $location_url }}">
                                <div class="thumbnail has-matchHeight">
                                    <div class="thumbnail-outer">
                                        <div class="thumbnail-inner">
                                            <img src="{{ get_attachment_url($location['image']) }}"
                                                alt="{{ get_attachment_alt($location['image'] ) }}" class="img-fluid">
                                        </div>
                                    </div>
                                    <div class="detail">
                                        <h2 class="text-center des-paterm-{{$rand}}">{{ $address }}</h2>
                                        <!--<div class="bar"></div>-->
                                        @if(count($services) > 1)
                                        <div
                                            class="count-services d-flex align-items-center justify-content-center mt-3">
                                            <?php
                                                        foreach($services as $service){
                                                        if (!is_enable_service($service)) {
                                                            continue;
                                                        }
                                                        if ($service == 'home') {
                                                            $location_query['bookingType'] = 'per_night';
                                                        }
                                                        $location_url = get_search_page($service);
                                                        $location_url = add_query_arg($location_query, $location_url);
                                                        $radius = get_option($service . '_search_radius', 25);
                                                        $controller = '\\App\\Controllers\\Services\\' . ucfirst($service) . 'Controller';
                                                        $method = 'listOf' . ucfirst($service) . 's';
                                                        $list_services = $controller::get_inst()->$method([
                                                            'location' => [
                                                                'lat' => $lat,
                                                                'lng' => $lng,
                                                                'radius' => $radius
                                                            ],
                                                        ]);
                                                        $service_info = post_type_info($service);
                                                        ?>

                                            <div class="item item-{{$service}}">
                                                <a href="{{$location_url}}">
                                                    <span class="count">{{$list_services['total']}}</span>
                                                    <span class="service">{{__($service_info['names'])}}</span>
                                                </a>
                                            </div>
                                            <?php
                                                        }
                                                        ?>
                                        </div>
                                        @endif
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    @endforeach
                </div>
                <div class="owl-nav">
                    <a href="javascript:void(0)" class="prev"><i class="ti-angle-left"></i></a>
                    <a href="javascript:void(0)" class="next"><i class="ti-angle-right"></i></a>
                </div>
            </div>
        </div>
        @endif
        <!-- Experience Types -->
        <?php
        $experience_types = get_terms('experience-type', true);
        ?>
        @if(count($experience_types) > 0)
        <div class="labayh-section-heading">
            <span class="labayh-kicker">{{__('Experiences')}}</span>
            <h2 class="h3 mt-4">{{__('Find a Experience type')}}</h2>
            <div class="bar"></div>
        </div>
        <div class="hh-list-terms mt-3 labayh-experience-circles">
            @if(count($experience_types))
            <?php
                    $responsive = [
                        0 => [
                            'items' => 1
                        ],
                        768 => [
                            'items' => 2
                        ],
                        992 => [
                            'items' => 3
                        ],
                        1200 => [
                            'items' => 4
                        ]
                    ];
                    ?>
            <div class="hh-carousel carousel-padding nav-style2"
                data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="15" data-loop="0">
                <div class="owl-carousel">
                    @foreach($experience_types as $item)
                    <?php
                                $url = get_attachment_url($item->term_image, [350, 300]);
                                ?>
                    <div class="item">
                        <div class="hh-term-item">
                            <a href="{{ get_experience_search_page('?experience-type=' . $item->term_id) }}">
                                <div class="row">
                                    <div class="col-6">
                                        <div class="thumbnail has-matchHeight">
                                            <div class="thumbnail-outer">
                                                <div class="thumbnail-inner">
                                                    <img src="{{ $url }}"
                                                        alt="{{ get_attachment_alt($item->term_image ) }}"
                                                        class="img-fluid">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 d-flex align-items-center">
                                        <div class="clearfix">
                                            <h4 style="font-size:20px">{{ get_translate($item->term_title) }}</h4>
                                            <?php
                                                        $home_count = count_experience_in_experience_type($item->term_id);
                                                        ?>
                                            <p class="text-muted">{{ sprintf(__('%s Experiences'), $home_count) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    @endforeach
                </div>
                <div class="owl-nav">
                    <a href="javascript:void(0)" class="prev"><i class="ti-angle-left"></i></a>
                    <a href="javascript:void(0)" class="next"><i class="ti-angle-right"></i></a>
                </div>
            </div>
            @endif
        </div>
        @endif
        <!-- Experience in Ha Noi -->
        @if(is_enable_service('experience'))
        <?php
            $list_services = \App\Controllers\Services\ExperienceController::get_inst()->listOfExperiences([
                'number' => 4,
                'location' => [
                    'lat' => '21',
                    'lng' => '105.75',
                    'radius' => 50
                ],
                'order' => 'rand'
            ]);
            ?>
        @if(count($list_services['results']))
        <h2 class="h3 mt-4">{{__('Popular experiences in Ha Noi')}}</h2>
        <div class="bar"></div>
        <p>{{__('Book activities led by local hosts on your next trip')}}</p>
        <div class="hh-list-of-services">
            <div class="row">
                @foreach($list_services['results'] as $item)
                <?php $item = setup_post_data($item, 'experience'); ?>
                <div class="col-12 col-md-6">
                    @include('frontend.experience.loop.list', ['item' => $item])
                </div>
                @endforeach
            </div>
        </div>
        @endif
        @endif
    </div>

    <!-- Call to action -->
    <?php
    $page_id = get_option('call_to_action_page');
    $cta_background_id = get_option('call_to_action_background', '');
    ?>
    @if(!empty($page_id))
    <?php
        $link = get_permalink_by_id($page_id, 'page');
        $cta_background_url = '';
        $cta_background_url = get_attachment_url($cta_background_id, 'full');
        ?>
    <!--<div class="container mt-4">-->
    <!--    <div class="call-to-action pl-4 pr-4 has-background-image" data-src="{{ $cta_background_url }}"-->
    <!--         style="background-image: url('{{$cta_background_url}}')">-->
    <!--        <div class="row">-->
    <!--            <div class="col-lg-8">-->
    <!--                <h5 class="main-text">{{__('The most exciting trip this summer')}}</h5>-->
    <!--                <p class="sub-text">{{__('Enjoy moments at the beach Maldives with friends')}}</p>-->
    <!--            </div>-->
    <!--            <div class="col-lg-4">-->
    <!--                <a href="{{ $link }}" class="btn btn-primary right">{{__('Watch now')}}</a>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <!--</div>-->
    @endif


    <!-- Call to action -->
    <?php
    $page_id = get_option('call_to_jaliat_page');
    $page_title = get_option('call_to_jaliat_title');
    $page_desc = get_option('call_to_jaliat_desc');
    $cta_background_id = get_option('call_to_jaliat_background', '');
    ?>
    @if(!empty($page_id))
    <?php
     
        $cta_background_url = '';
        $cta_background_url = get_attachment_url($cta_background_id, 'full');
        ?>
    <!--<div class="container mt-4">-->
    <!--    <div class="call-to-action pl-4 pr-4 has-background-image" data-src="{{ $cta_background_url }}"-->
    <!--         style="background-image: url('{{$cta_background_url}}')">-->
    <!--        <div class="row">-->
    <!--            <div class="col-lg-8">-->
    <!--                <h5 class="main-text">{{ get_translate($page_title) }}</h5>-->
    <!--                <p class="sub-text">{{ get_translate($page_desc) }}</p>-->
    <!--            </div>-->
    <!--            <div class="col-lg-4">-->
    <!--                <a href="{{ $page_id }}" class="btn btn-primary right" target="_blank">{{__('Watch now')}}</a>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <!--</div>-->
    @endif


    <div class="container">
        <!-- Home Types -->
        <?php
        $home_types = get_terms('home-type', true);
        ?>
        <!--@if(count($home_types) > 0)-->
        <!--    <h2 class="h3 mt-4">{{__('Find a Home type')}}</h2>-->
        <!--    <div class="bar"></div>-->
        <!--    <div class="hh-list-terms mt-3">-->
        <!--        @if(count($home_types))-->
        <?php
                    $responsive = [
                        0 => [
                            'items' => 1
                        ],
                        768 => [
                            'items' => 2
                        ],
                        992 => [
                            'items' => 3
                        ],
                        1200 => [
                            'items' => 4
                        ]
                    ];
                    ?>
        <!--            <div class="hh-carousel carousel-padding nav-style2"-->
        <!--                 data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="15" data-loop="0">-->
        <!--                <div class="owl-carousel">-->
        <!--                    @foreach($home_types as $item)-->
        <?php
                                $url = get_attachment_url($item->term_image, [350, 300]);
                                ?>
        <!--                        <div class="item">-->
        <!--                            <div class="hh-term-item">-->
        <!--                                <a href="{{ get_home_search_page('?home-type=' . $item->term_id) }}">-->
        <!--                                    <div class="row">-->
        <!--                                        <div class="col-6">-->
        <!--                                            <div class="thumbnail has-matchHeight">-->
        <!--                                                <div class="thumbnail-outer">-->
        <!--                                                    <div class="thumbnail-inner">-->
        <!--                                                        <img src="{{ $url }}"-->
        <!--                                                             alt="{{ get_attachment_alt($item->term_image ) }}"-->
        <!--                                                             class="img-fluid">-->
        <!--                                                    </div>-->
        <!--                                                </div>-->
        <!--                                            </div>-->
        <!--                                        </div>-->
        <!--                                        <div class="col-6 d-flex align-items-center">-->
        <!--                                            <div class="clearfix">-->
        <!--                                                <h4>{{ get_translate($item->term_title) }}</h4>-->
        <?php
                                                        $home_count = count_home_in_home_type($item->term_id);
                                                        ?>
        <!--                                                <p class="text-muted">{{ _n("[0::%s Homes][1::%s Home][2::%s Homes]", $home_count) }}</p>-->
        <!--                                            </div>-->
        <!--                                        </div>-->
        <!--                                    </div>-->
        <!--                                </a>-->
        <!--                            </div>-->
        <!--                        </div>-->
        <!--                    @endforeach-->
        <!--                </div>-->
        <!--                <div class="owl-nav">-->
        <!--                    <a href="javascript:void(0)"-->
        <!--                       class="prev"><i class="ti-angle-left"></i></a>-->
        <!--                    <a href="javascript:void(0)"-->
        <!--                       class="next"><i class="ti-angle-right"></i></a>-->
        <!--                </div>-->
        <!--            </div>-->
        <!--        @endif-->
        <!--    </div>-->
        <!--@endif-->
        <!--Featured Homes -->
        @if(is_enable_service('home'))
        <?php
            $list_services = \App\Controllers\Services\HomeController::get_inst()->listOfHomes([
                'number' => 8,
                'is_featured' => 'on'
            ]);
            ?>
        @if(count($list_services['results']))
        <div class="labayh-section-heading">
            <span class="labayh-kicker">{{__('Featured')}}</span>
            <p class="h3 mt-4 titt">{{__('Featured Homes')}}</p>
            <div class="bar"></div>
            <p>{{__('Browse beautiful places to stay with all the comforts of home, plus more')}}</p>
        </div>

        <div class="hh-list-of-services">
            <?php
                    $responsive = [
                        0 => [
                            'items' => 1
                        ],
                        768 => [
                            'items' => 2
                        ],
                        992 => [
                            'items' => 3
                        ],
                        1200 => [
                            'items' => 4
                        ],
                    ];
                    ?>
            <div class="hh-carousel carousel-padding nav-style2"
                data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="15" data-loop="0">
                <div class="owl-carousel">
                    @foreach($list_services['results'] as $item)
                    <div class="item">
                        @include('frontend.home.loop.grid', ['item' => $item])
                    </div>
                    @endforeach
                </div>
                <div class="owl-nav">
                    <a href="javascript:void(0)" class="prev"><i class="ti-angle-left"></i></a>
                    <a href="javascript:void(0)" class="next"><i class="ti-angle-right"></i></a>
                </div>
            </div>
        </div>
        @endif
        @endif



        <!--Featured Homes -->
        @if(is_enable_service('home'))
        <?php
            $list_services = \App\Controllers\Services\HomeController::get_inst()->listOfHomes([
                'number' => 8,
                  'last-minute' => 'on'
            ]);
        
            ?>
        @if(count($list_services['results']))
        <div class="labayh-section-heading">
            <span class="labayh-kicker">{{__('Urgent Deals')}}</span>
            <p class="h3 mt-4 titt">{{__('last Minute home')}}</p>
            <div class="bar"></div>
            <p>{{__('Hurry up for the days that have not yet been booked, with suitable prices and discounts')}}</p>
        </div>
        <div class="hh-list-of-services">
            <?php
                    $responsive = [
                        0 => [
                            'items' => 1
                        ],
                        768 => [
                            'items' => 2
                        ],
                        992 => [
                            'items' => 3
                        ],
                        1200 => [
                            'items' => 4
                        ],
                    ];
                  
                    ?>
            <div class="hh-carousel carousel-padding nav-style2"
                data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="15" data-loop="0">
                <div class="owl-carousel">
                    @foreach($list_services['results'] as $item)
                    <div class="item">
                        @include('frontend.home.loop.grid', ['item' => $item])
                    </div>
                    @endforeach
                </div>
                <div class="owl-nav">
                    <a href="javascript:void(0)" class="prev"><i class="ti-angle-left"></i></a>
                    <a href="javascript:void(0)" class="next"><i class="ti-angle-right"></i></a>
                </div>
            </div>
        </div>
        @endif
        @endif
    </div>


    <!-- Testimonial -->
    <?php
    $testimonials = get_option('testimonial', []);
    $responsive = [
        0 => [
            'items' => 1
        ],
        768 => [
            'items' => 2
        ],
        992 => [
            'items' => 2
        ],
        1200 => [
            'items' => 3
        ],
    ];

    $testimonial_bgr = get_option('testimonial_background', '#dd556a');
    ?>


    <!--    @if(count($testimonials))-->
    <!--        <div class="section section-background pt-5 pb-5 mt-4" style="background-color: {{$testimonial_bgr}};">-->
    <!--            <div class="container">-->
    <!--                <h2 class="h3 mt-0 c-white">{{__('Say about Us')}}</h2>-->
    <!--                <p class="c-white">{{__('Browse beautiful places to stay with all the comforts of home, plus more')}}</p>-->
    <!--                <div class="hh-testimonials">-->
    <!--                    <div class="hh-carousel carousel-padding nav-style2"-->
    <!--                         data-responsive="{{ base64_encode(json_encode($responsive)) }}" data-margin="30" data-loop="0">-->
    <!--                        <div class="owl-carousel">-->
    <!--                            @foreach($testimonials as $testimonial)-->
    <!--                                <div class="item">-->
    <!--                                    <div class="testimonial-item">-->
    <!--                                        <div class="testimonial-inner">-->
    <!--                                            <div class="author-avatar">-->
    <!--                                                <img-->
    <!--                                                    src="{{ get_attachment_url($testimonial['author_avatar'], [80, 80]) }}"-->
    <!--                                                    alt="{{get_translate( $testimonial['author_name']) }}"-->
    <!--                                                    class="img-fluid">-->
    <!--                                                <i class="mdi mdi-format-quote-open hh-icon"></i>-->
    <!--                                            </div>-->
    <!--                                            <div class="author-rate">-->
    <!--                                                @include('frontend.components.star', ['rate' => (int) $testimonial['author_rate']])-->
    <!--                                            </div>-->
    <!--                                            <div class="author-comment">-->
    <!--                                                {{ get_translate($testimonial['author_comment']) }}-->
    <!--                                            </div>-->
    <!--                                            <h2 class="author-name">-->
    <!--                                                {{ get_translate($testimonial['author_name']) }}-->
    <!--                                            </h2>-->
    <!--                                            @if($testimonial['date'])-->
    <!--                                                <div-->
    <!--                                                    class="author-date">{{sprintf(__('on %s'), date(hh_date_format(), strtotime($testimonial['date'])))}}</div>-->
    <!--                                            @endif-->
    <!--                                        </div>-->
    <!--                                    </div>-->
    <!--                                </div>-->
    <!--                            @endforeach-->
    <!--                        </div>-->
    <!--                        <div class="owl-nav">-->
    <!--                            <a href="javascript:void(0)"-->
    <!--                               class="prev"><i class="ti-angle-left"></i></a>-->
    <!--                            <a href="javascript:void(0)"-->
    <!--                               class="next"><i class="ti-angle-right"></i></a>-->
    <!--                        </div>-->
    <!--                    </div>-->
    <!--                </div>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--@endif-->


    <!-- List of Blog -->
    <div class="panar">
        <div class="container">
            <?php
        $list_services = \App\Controllers\PostController::get_inst()->listOfPosts([
            'number' => 2
        ]);
        $responsive = [
            0 => [
                'items' => 1
            ]
        ];
        
       
    $page_id = get_option('call_to_jaliat_page');
    $page_title = get_option('call_to_jaliat_title');
    $page_desc = get_option('call_to_jaliat_desc');
    $cta_background_id = get_option('call_to_jaliat_background', '');
 
  
        
        ?>


            <!--<h2 class="h3 mt-4 mb-3">{{__('The latest from Blog')}}</h2>-->
            <div class="bar"></div>
            <div class="hh-list-of-blog" style="text-align: -webkit-center;">
                <div class="row">
                    @if(!empty($page_id))
                    <?php
     
        $cta_background_url = '';
        $cta_background_url = get_attachment_url($cta_background_id, 'full');
       
        ?>

                    <div class="col-12 col-md-6">
                        <div class="hh-blog-item style-2">
                            <a href="{{$page_id}}">
                                <div class="thumbnail">
                                    <div class="thumbnail-outer">
                                        <div class="thumbnail-inner">
                                            <img src="{{ $cta_background_url }}" class="img-fluid">
                                            <a href="{{ url('home/178/mkhym') }}" target="_blank"
                                                class="btn postDms">{{ get_translate($page_title) }}</a>

                                        </div>
                                    </div>
                                </div>
                            </a>

                            <div class="w-100 mt-2"></div>
                            <div class="d-flex justify-content-between">
                            </div>
                        </div>
                    </div>
                    @endif


                    <?php
                 
    $page_id = get_option('call_to_action_page');
    $cta_background_id = get_option('call_to_action_background', '');
    $page_title = get_option('call_to_action_title');
    ?>
                    @if(!empty($page_id))
                    <?php
        $link = get_permalink_by_id($page_id, 'page');
        $cta_background_url = '';
        $cta_background_url = get_attachment_url($cta_background_id, 'full');
        ?>
                    <div class="col-12 col-md-6">
                        <div class="hh-blog-item style-2">
                            <a href="{{ $link }}">
                                <div class="thumbnail">
                                    <div class="thumbnail-outer">
                                        <div class="thumbnail-inner">
                                            <img src="{{ $cta_background_url }}" class="img-fluid">
                                            <a href="{{ url('home/178/mkhym') }}" target="_blank"
                                                class="btn postDms">{{ get_translate($page_title) }}</a>

                                        </div>
                                    </div>
                                </div>
                            </a>

                            <div class="w-100 mt-2"></div>
                            <div class="d-flex justify-content-between">
                            </div>
                        </div>
                    </div>
                    @endif



                </div>
            </div>



        </div>

    </div>
</div>

<div class="gnservitems labayh-benefits-band">
    <div class="container">
        <div class="row">
            <div class="col-12 col-md-4 col-lg-4 labayh-benefits-map">
                <img data-src="img/360-degrees.png" loading="lazy" class="loaded"
                    src="{{asset('/images/1121212.png')}}"
                    data-was-processed="true">

            </div>

            <div class="col-12 col-md-8 col-lg-8 labayh-benefits-content">
                <div class="row labayh-benefits-grid">
                    <div class="col-12 col-md-12 col-lg-12">
                        <h3 class="Title">{{__('What do you provide Labayh?')}}</h3>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="{{asset('/images/boo.png')}}" alt="حجز �&ؤْد ���&ض�&��� " loading="lazy"
                                class="loaded" src="{{asset('/images/boo.png')}}" data-was-processed="true">
                        </div>
                        <strong>{{__('Confirmed and guaranteed reservation')}}</strong>
                        <p>{{__('Your reservation is 100% guaranteed.')}}</p>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="img/paymentico.png" alt="طر� دفع آ�&� ة" loading="lazy" class="loaded"
                                src="{{asset('/images/payicon.png')}}" data-was-processed="true">
                        </div>
                        <strong>{{__('Safe Payment Methods')}}</strong>
                        <p>{{__('Multiple and secure payment methods')}}</p>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="img/customerservice-3@2x.png" alt="خد�&ة ع�&�اء" loading="lazy" class="loaded"
                                src="{{asset('/images/supp.png')}}" data-was-processed="true">
                        </div>
                        <strong>{{__('customer service')}}</strong>
                        <p>{{__('We support you throughout the week')}}</p>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="img/037GoodReview.png" alt="ت��`�`�&ات �&��ث���ة" loading="lazy" class="loaded"
                                src="{{asset('/images/mr.png')}}" data-was-processed="true">
                        </div>
                        <strong>{{__('Trusted Reviews')}}</strong>
                        <p> {{__('Certified reviews and comments')}}</p>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="img/search-2.png" alt="بحث �&ت�د�& ��ذْ�0" loading="lazy"
                                src="{{asset('/images/se.png')}}" class="loaded" data-was-processed="true">
                        </div>
                        <strong>{{__('Advanced and intelligent search')}} </strong>
                        <p> {{__('All kinds of search at your fingertips')}}</p>
                    </div>
                    <div class="col-6 col-md-2 col-lg-2 gnservitem">
                        <div class="iconn">
                            <img data-src="img/360-degrees.png" alt="ص��ر با� ��را�&�`ة" loading="lazy" class="loaded"
                                src="{{asset('/images/poh.png')}}" data-was-processed="true">
                        </div>
                        <strong>{{__('panoramic photos')}} </strong>
                        <p>{{__('See photos that mimic reality from your place')}}</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>



<div class="container pb15 labayh-app-download-shell"
    style="direction: rtl;text-align: right;background-color: #ffffff;max-width: 100%;color: black;padding-right: 10%; height: 39%;">
    <div class="row mt-5">
        <div class="col-12 col-md-12 col-lg-12">

            <div class="row">

                <div class="col-lg-6 col-md-12 " style="margin-top: 7%;">
                    <div class="app-download-content">
                        <h1 style="color:#4b4b4b; font-size:36px">{{__('Download the app now')}}</h1>
                        <div class="bar"></div>
                        <p>{{__('Available on the app store and andriod')}}</p>

                        <div class="btn-box">
                            <a href="https://apps.apple.com/"
                                target="_blank" class="app-store-btn">
                                <i class="flaticon-apple"></i>
                                Download on
                                <span>App Store</span>
                            </a>

                            <a href="https://play.google.com/"
                                target="_blank" class="play-store-btn">
                                <i class="flaticon-play-store"></i>
                                Download on
                                <span>Google play</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6 col-lg-6 downappmob" style=" padding-left: 5%;   text-align-last: center;">
                    <div class="app-image">
                        <div class="main-image">
                            <!--<img data-src="{{asset('/images/23548.png')}}" style="  width:228px" alt="�&ت��فر ع��0 ا�٬ app store �� ا�٬ andriod" loading="lazy" class="loaded" src="{{asset('/images/23548.png')}}" data-was-processed="true">-->

                            <img src="{{asset('/images/mobile-app1.png')}}" alt="image">
                            <img src="{{asset('/images/mobile-app2.png')}}" alt="image">
                        </div>

                        <div class="main-mobile-image">
                            <img style="width: 100%;" src="{{asset('/images/main-mobile.png')}}" alt="image">
                        </div>

                        <div class="circle-img">
                            <img src="{{asset('/images/circle.png')}}" alt="image">
                        </div>
                    </div>
                </div>

                <!--<div class="col-12 col-md-6 col-lg-6 downlodandios" style="text-align: center">-->

                <!--     <h2 class="Title" style="display: block;">{{__('Download the app now')}}</h2>-->
                <!--      <div class="bar"></div>-->
                <!--    <p style="color: #fafafb;">{{__('Available on the app store and andriod')}}</p>-->
                <!--    <p>-->
                <!--        <a href="https://play.google.com/store/apps/details?id=com.labayh.app" target="_blank" rel="noopener">-->
                <!--            <img data-src="{{asset('/images/google-play.png')}}" style="max-width:25%" alt="ب�اجات Android" loading="lazy" class="loaded" src="{{asset('/images/google-play.png')}}" data-was-processed="true"></a>-->

                <!--        <a href="https://labayh.sa/download" target="_blank" rel="noopener">-->
                <!--            <img data-src="{{asset('/images/apple-store.png')}}" style="max-width:25%" alt="ب�اجات IOS" loading="lazy" class="loaded" src="{{asset('/images/ios-store.png')}}" data-was-processed="true"></a>-->
                <!--    </p>-->
                <!--</div>-->

            </div>
        </div>
    </div>
</div>
@section('js')
<script src="{{asset('js/buttonvote.js')}}"></script>
@endsection
@include('frontend.components.footer')


