@include('frontend.components.header')
<?php
enqueue_style('mapbox-gl-css');
enqueue_style('mapbox-gl-geocoder-css');
enqueue_script('mapbox-gl-js');
enqueue_script('mapbox-gl-geocoder-js');
enqueue_script('search-experience-js');

$showmap = request()->get('showmap', 'yes');
?>
<div class="hh-search-result search-result-experience" data-url="{{ get_experience_search_page()}}">
    @include('frontend.experience.search.search-bar')
    <div class="hh-search-content-wrapper @if($showmap == 'no') no-map @endif">
        @include('common.loading')
        <div class="hh-search-results-render" data-url="{{ get_experience_search_page() }}">
            <div class="render">
                <div class="hh-search-results-string">
                    <span class="item-found">{{__('Searching experience...')}}</span>
                </div>
                <div class="hh-search-content">
                    <div class="service-item list">

                    </div>
                </div>
                <div class="hh-search-pagination">

                </div>
            </div>
        </div>
      
    </div>
</div>
@include('frontend.components.footer')
