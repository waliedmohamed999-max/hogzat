@include('frontend.components.header')
<?php
enqueue_style('mapbox-gl-css');
enqueue_style('mapbox-gl-geocoder-css');
enqueue_script('mapbox-gl-js');
enqueue_script('mapbox-gl-geocoder-js');
enqueue_script('search-experience-js');

?>

<div class="hh-search-result search-result-experience">

    <div class="hh-search-content-wrapper">
        @include('common.loading')
        <div class="hh-search-results-render container">
            <div class="">
                <div class="hh-search-content row">
                    @foreach ($ExperienceVote as $item)
                        <div class="col-md-3 mt-5">
                            <div class="hh-service-item experience grid" style="border-radius: 20px;   background-color: #f7fbff;"
                                data-lng="{{ $item->experience->location_lng }}"
                                data-lat="{{ $item->experience->location_lat }}"
                                data-id="{{ $item->experience->post_id }}">
                                <a href="{{ route('vote', $item->experience->post_id) }}">
                                    <div class="thumbnail">
                                        <div class="thumbnail-outer">
                                            <div class="thumbnail-inner">
                                                <img src="{{ get_attachment_url($item->experience->thumbnail_id, [650, 550]) }}"
                                                    alt="{{ get_attachment_alt($item->experience->thumbnail_id) }}"
                                                    class="img-fluid">
                                            </div>
                                        </div>
                                    </div>
                                </a>
                                <div class="detail">
                                    <?php
                                    $short_address = get_short_address($item->experience);
                                    ?>
                                    <a class="title mb-1" href="{{ route('vote', $item->experience->post_id) }}">
                                        @if ($item->experience->is_featured == 'on')
                                            <span class="is-featured featured-icon"
                                                title="{{ __('Featured') }}">{!! balanceTags(get_icon('001_diamond', '', '15px', '18px')) !!}</span>
                                        @endif
                                        {{ get_translate($item->experience->post_title) }}
                                    </a>
                                    @if (!empty($short_address))
                                        <div class="address mb-1">
                                            <i class="ti-location-pin"></i>
                                            {{ $short_address }}
                                            @if (isset($show_distance) && $show_distance && isset($item->experience->distance))
                                                <?php
                                                $distance = round($item->experience->distance, 2);
                                                ?>
                                                <strong>({{ $distance }}{{ __('km') }})</strong>
                                            @endif
                                        </div>
                                    @else
                                        <div class="address mb-1"> <i class="ti-location-pin"></i> </div>
                                    @endif
                                    <?php
                                    $duration = $item->experience->durations;
                                    ?>
                                    <div class="row">
                                        <div class="col-md-6 col-6">
                                            @if (!empty($duration))
                                                <div class="duration d-flex align-items-center">
                                                    <span class="mr-1"> {!! get_icon('001_clock', '#4a4a4a', '15px', '15px') !!}
                                                    </span>
                                                    {{ get_translate($duration) }}
                                                </div>
                                            @endif
                                        </div>
                                        <div class="col-md-6 col-6">
                                            <div class="duration  text-center align-items-center">
                                                {{ __('count sub') }}
                                                <span style="color:#f2bf11;font-size: 16px;font-weight: 700;">
                                                    ({{ count_sub($item->experience->post_id) }})
                                                </span>
                                            </div>
                                        </div>
                                    </div>




                                    <div class="row mt-2">
                                        <div class="col-md-8 col-8">

                                            <a href="{{ route('vote', $item->experience->post_id) }}"
                                                class="animated-button1">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                {{ __('show posts') }}
                                            </a>

                                        </div>
                                        <div class="col-md-4 col-4" style="padding-right: 0px;">
                                            <div class="price-wrapper left" style="padding: 10px 5px 0px 5px;text-align: center;">
                                                <span class="unit">{{ __('From') }}
                                                    <span
                                                        class="price">{{ convert_price($item->experience->base_price) }}</span>
                                                </span>
                                            </div>
                                        </div>

                                    </div>




                                    <div class="w-100 mt-1"></div>

                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
            <div class="hh-search-pagination">

            </div>
        </div>
    </div>

</div>



@include('frontend.components.footer')
