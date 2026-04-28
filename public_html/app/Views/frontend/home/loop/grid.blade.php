<div class="hh-service-item home grid labayh-stay-card" data-plugin="matchHeight">
    @if(is_user_logged_in())
        @if(!is_fav($item->post_id,'home'))
            <span class="fav fav1 labayh-card-fav" data-status="off" data-id="{{$item->post_id}}" data-type="home">
                <i class="far fa-heart"></i>
            </span>
        @else
            <span class="fav fav1 labayh-card-fav" data-status="on" data-id="{{$item->post_id}}" data-type="home">
                <i class="fas fa-heart"></i>
            </span>
        @endif
    @else
        <span class="fav fav1 labayh-card-fav" data-toggle="modal" data-target="#hh-login-modal">
            <i class="far fa-heart"></i>
        </span>
    @endif

    <a href="{{ get_the_permalink($item->post_id, $item->post_slug, isset($item->last) ? 'last' : '') }}">
        <div class="thumbnail">
            @if($item->is_featured == 'on')
                <div class="is-featured">{{ get_option('featured_text', __('Featured')) }}</div>
            @endif
            <div class="thumbnail-outer">
                <div class="thumbnail-inner">
                    <img
                        src="{{ get_attachment_url($item->thumbnail_id, [650, 550]) }}"
                        alt="{{ get_attachment_alt($item->thumbnail_id) }}"
                        class="img-fluid"
                    >
                </div>
            </div>
        </div>
    </a>

    <div class="detail labayh-card-detail">
        <h2 class="title text-overflow">
            <a href="{{ get_home_permalink($item->post_id, $item->post_slug, isset($item->last) ? 'last' : '') }}">
                {{ get_translate($item->post_title) }}
            </a>
        </h2>

        @if($item->location_address)
            <p class="text-muted text-overflow mb-1 labayh-card-location">
                <i class="fe-map-pin mr-1"></i>
                {{ get_short_address($item) }}
                @if(isset($show_distance) && $show_distance && isset($item->distance))
                    <?php $distance = round($item->distance, 2); ?>
                    <strong>({{ $distance }}{{__('km')}})</strong>
                @endif
            </p>
        @endif

        <div class="facilities labayh-card-facilities">
            <div class="item max-people">
                {{ _n("[0::%s guests][1::%s guest][2::%s guests]", (int)$item->number_of_guest) }}
            </div>
            <div class="item max-bedrooms">
                {{ _n("[0::%s bedrooms][1::%s bedroom][2::%s bedrooms]", (int)$item->number_of_bedrooms) }}
            </div>
            <div class="item max-baths">
                {{ _n("[0::%s bathrooms][1::%s bathroom][2::%s bathrooms]", (int)$item->number_of_bathrooms) }}
            </div>
        </div>

        @if(enable_review())
            <div class="labayh-card-rating">
                @include('frontend.components.star', ['rate' => $item->rating, 'show_text' => true])
            </div>
        @endif

        @if(isset($item->creattted_at))
            <?php
                $modelName = 'App\\Models\\LastMinute';
                $model = new $modelName();
                $book = $model->checkBookingLast($item->id);
            ?>
            <div class="row align-items-end">
                <div class="col-md-7">
                    <div class="price-wrapper labayh-card-price {{ (empty($item->rating) || !enable_review()) ? 'left' : '' }}">
                        <span class="price">{{ convert_price($item->price) }}</span>
                        <span class="unit">/{{ get_home_unit($item) }}</span>
                    </div>
                </div>
                <div class="col-md-5">
                    @if ($book != null)
                        <div class="lastdemo labayh-card-badge">{{__('booked')}}</div>
                    @else
                        <div class="demo lastdemo labayh-card-badge" data-startdate="{{ $item->creattted_at }}"></div>
                    @endif
                </div>
            </div>
        @else
            <div class="labayh-card-price-row">
                <div class="price-wrapper labayh-card-price {{ (empty($item->rating) || !enable_review()) ? 'left' : '' }}">
                    @if($item->use_offer == 'on')
                        <span class="price">
                            {{ convert_price(($item->base_price - (($item->base_price * $item->offer) / 100))) }}
                        </span>
                        <span class="price labayh-card-price-old">{{ convert_price($item->base_price) }}</span>
                    @else
                        <span class="price">{{ convert_price($item->base_price) }}</span>
                    @endif
                    <span class="unit">/{{ get_home_unit($item) }}</span>
                </div>

                @if($item->use_offer == 'on')
                    <div class="labayh-card-offer">
                        <img alt="" src="{{ asset('special-star.svg') }}">
                        <span>خصم %{{$item->offer}}</span>
                    </div>
                @endif
            </div>
        @endif
    </div>
</div>
