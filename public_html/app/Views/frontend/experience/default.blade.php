@include('frontend.components.header1')
<?php
enqueue_script('scroll-magic-js');
global $post;
$booking_form = $post->booking_form;
$main = $post->main_sponsors;
$co = $post->co_sponsors;
if (!empty($main)) {
    $main = explode(',', $main);
}
if (!empty($co)) {
    $co = explode(',', $co);
}
?>
<style>
.partner-1 {
    border: 1px solid #ccc;
    border-radius: 25px;
    padding: 40px;
}
.partner {
    width: 75%;
}
.partner-2 {
    border: 1px solid #ccc;
    border-radius: 25px;
    padding: 10px 40px 40px;
}
small {
    position: relative;
    top: 35px;
    right: 30px;
    background-color: #fff;
    padding: 0 10px;
    font-size: 16px;
    color: #695697;
    font-weight: 500;
}
.tab {
   overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 2px;
    max-width: 750px;
    border-radius: 25px;
    background-color: #efefef;
}
.table-sub-header{font-family: 'Tajawal';
    font-size: 12px;}
.booking-now{
    
   background-color: #695697;border-radius: 13px;font-size: 25px;font-weight: 500;
}
.booking-now:hover{
    
   background-color: #816abd;border-radius: 13px;font-size: 25px;font-weight: 500;
   color:#eee;
}
hr{
    border-top: 1px solid #dadada;
}
.awe-booking h2{
    
    color:#695697;
}
.f-w,.w-100,.small-info ,.d-inline-block{
    font-weight: 500;
}
.tab button.active {
    border-radius: 18px;
    background-color: #695697;
    color: #fff;
    margin-top: 6px;
    padding: 7px 5px 7px 5px;
        font-weight: 500;

}
.tab button {
    background-color: inherit;
    float: right;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    width: 33%;
        font-weight: 500;

}
    .awe-booking .single-page .hh-grid-gallery .item {
    
    margin-right: 8px;
}
    .awe-booking .single-page .hh-grid-gallery .item.item-small .space {
    margin-top: 8px;
}
@media (min-width: 1200px)
{
    .awe-booking .single-page .hh-grid-gallery {
        
        max-width: 1140px;
    }
    
}
@media (min-width: 1600px){

    .awe-booking .single-page .hh-grid-gallery {
        
           max-width: 1275px;
    }
    .awe-booking .single-page .form-book .form-body {
        
        padding: 14px 5px;
    }
    p {
        font-size: 18px;
}
}
</style>
<div class="single-page single-experience pb-5">

    <div class="container text-left">
        <div class="row">
            <div class="col-12 col-sm-12 col-md-12 col-lg-12 "style="padding-right: 25px;padding-bottom: 20px;">
                @include('frontend.components.breadcrumb', ['currentPage' => get_translate($post->post_title)])
                <h1 class="title mt-3">
                    {{ get_translate($post->post_title) }}
                    @if($post->is_featured == 'on')
                    <span class="is-featured">{{ get_option('featured_text', __('Featured')) }}</span>
                    @endif
                </h1>
                 <div class="text-end" style="padding-right: 10px;">
                    <span class="text-end" style="color:#7f50ba;font-size: 20px;font-weight: 500;">{{__('Reference number')}}:</span>
                    <span class="text-end" style="color: rgb(87, 83, 77);font-size: 18px;padding-right: 5px;font-weight: 500;">{{$post->post_id}}</span>
                    <div class="row mt-3"><div class="col-md-8 col-sm-12"><span><i class="fas fa-star pr-2" style="color: rgb(91, 66, 157); font-size: 17px; padding-left: 10px;"></i>0 <span style="color: rgb(157, 157, 171);font-weight: 500;">(لايوجد تقييمات)</span>
                    </span>
                    <span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span><i class="fas fa-map-marker-alt" style="color:#7f50ba; font-size: 20px; margin-right: 20px;"></i>
                    <span style="margin-right: 6px;font-weight: 500;">{{ get_translate($post->location_address) }}</span><span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span>
                    <i class="far fa-clock project-header" style="padding-right: 15px;color: #7f50ba;font-size: 20px;"></i><span style="margin-right: 6px;font-weight: 500;">التاريخ : {{date(hh_date_format(), $post->created_at)}}</span>
                    <span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span><span style="margin-right: 20px;font-weight: 500;">{{$post->count}}</span><i class="far fa-eye" style="color: #7f50ba; font-size: 20px; margin-right: 10px;"></i></div>
                    <div class="col-md-4 col-sm-12 text-right fav-share">
                        @if(is_user_logged_in())
                        @if(!is_fav($post->post_id,'experience'))
                        <span id="do_fav" style="cursor: pointer;" data-status="off" data-id="{{$post->post_id}}" data-type="experience"><i class="far fa-heart" style="font-size: 20px;padding-top: -21px;"></i></span>
                        @else
                        <span id="do_fav" style="cursor: pointer;" data-status="on" data-id="{{$post->post_id}}" data-type="experience"> <i class="fas fa-heart" style="font-size: 20px;padding-top: -21px; color:#f1556c"></i></span>
                        @endif
                        @else
                        <span data-toggle="modal"
                            data-target="#hh-login-modal" style="cursor: pointer;" ><i class="far fa-heart" style="font-size: 20px;padding-top: -21px;"></i></span>
                        @endif
                    <span style="margin-right: 6px;margin-bottom: 2px;font-weight: 500;">المفضلة</span>
                    <svg data-toggle="modal" data-target="#exampleModal" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve" style="cursor: pointer;width: 20px; margin-right: 20px;"><g><polygon points="334.9,120.6 256,41.7 177.1,120.6 156.3,99.7 256,0 355.7,99.7 	"></polygon><rect x="241.1" y="20.8" width="29.8" height="312.6"></rect><path d="M404.8,512H107.2c-25.3,0-44.7-19.4-44.7-44.7V199.4c0-25.3,19.3-44.7,44.7-44.7h104.2v29.8H107.2c-8.9,0-14.9,6-14.9,14.9
                		v267.9c0,8.9,6,14.9,14.9,14.9h297.7c8.9,0,14.9-6,14.9-14.9V199.4c0-8.9-6-14.9-14.9-14.9H300.7v-29.8h104.2
                		c25.3,0,44.7,19.3,44.7,44.7v267.9C449.5,492.6,430.1,512,404.8,512z"></path></g></svg><span data-toggle="modal" data-target="#exampleModal" style="cursor: pointer;margin-right: 6px;margin-bottom: 2px;font-weight: 500;">المشاركة</span></div></div>
                		</div>

            </div>
        </div>
    </div>

    <div class="container">
        <!-- Gallery -->
        <?php
        $gallery = $post->gallery;
        $thumbnail_id = get_experience_thumbnail_id($post->post_id);
        $thumbnailUrl = get_attachment_url($thumbnail_id, 'full');
        ?>
        <div class="hh-gallery hh-grid-gallery" style="height: 483px;">
            <div class="controls">
                <a href="javascript: void(0);" class="view-gallery item-link"><span>{{__('View Photos')}}</span> <i
                        class="ti-gallery"></i> </a>
            </div>
            <?php
            if ( !empty($gallery) ) {
            enqueue_script('light-gallery-js');
            enqueue_style('light-gallery-css');

            $gallery = explode(',', $gallery);
            $data = [];
            $i = 0;
            foreach ( $gallery as $key => $val ) {
            $thumbnail = get_attachment_url($val, [500, 750]);
            if(in_array($i, [0])){
            ?>
            <div class="item">
                <div class="item-inner">
                    <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="height: 483px;border-top-right-radius: 18px;border-bottom-right-radius: 18px;">
                </div>
            </div>
            <?php
            }elseif($i == 1 || $i == 2){
            if($i == 1){
            ?>
            <div class="item item-small">
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}">
                    </div>
                </div>
                <div class="space"></div>
                <?php
                }elseif($i == 2){
                ?>
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}">
                    </div>
                </div>
            </div>
             <?php
                }}
            elseif($i == 3 || $i == 4){
            if($i == 3){
            ?>
            <div class="item item-small">
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="border-top-left-radius: 18px;">
                    </div>
                </div>
                <div class="space"></div>
                <?php
                }elseif($i == 4){
                ?>
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="border-bottom-left-radius: 18px;">
                    </div>
                </div>
            </div>
            <?php
            }
            }
            $url = get_attachment_url($val);
            if (!empty($url)) {
                $data[] = [
                    'src' => $url
                ];
            }

            $i++;
            }
            if (!empty($data)) {
                $data = base64_encode(json_encode($data));
                echo '<div class="data-gallery" data-gallery="' . esc_attr($data) . '"></div>';
            }
            }
            ?>
        </div>
     
        <div class="row text-left">
            <div class="col-12 col-sm-8 col-md-8 col-lg-9 col-content">
                <!--<div class="row">-->
                <!--<div class="col-12 col-xl-4">-->
                <!--    <h1 class="title">-->
                <!--        @if($post->is_featured == 'on')-->
                <!--            <span class="is-featured featured-icon"-->
                <!--                  title="{{__('Featured')}}">{!! balanceTags(get_icon('001_diamond')) !!}</span>-->
                <!--        @endif-->
                <!--        {{ get_translate($post->post_title) }}-->
                <!--    </h1>-->
                <!--    @if ($post->location_address)-->
                <!--        <p class="location mb-1">-->
                <!--            <i class="ti-location-pin"></i>-->
                <!--            {{ get_translate($post->location_address) }}-->
                <!--        </p>-->
                <!--    @endif-->
                <!--    <div class="review-summary">-->
                <?php
                            $rate = $post->review_count;
                            ?>
                <!--        <div class="count-reviews">-->
                <!--            {{ number_format(round((float)$post->rating, 1), 1) }} <i class="fas fa-star"></i> <span-->
                <!--                class="count">{{ _n("[0::(%s reviews)][1::(%s review)][2::(%s reviews)]", $rate) }}</span>-->
                <!--        </div>-->

                <!--    </div>-->
                <!--</div>-->
                <!--<div class="col-12 col-xl-8" >-->
                <div class="tour-featured" >
                    <div class="row" style="border-radius: 25px;padding-top: 15px;background-color: #f8f8f8;">
                        <div class="col-6 col-md-6 col-lg-6 col-xl-3">
                            <div class="item mb-2">
                                {!! get_icon('009_sunbed', '#4a4a4a') !!}
                                <span class="title">{{__('Duration')}}</span>
                                <span class="desc">{{ get_translate($post->durations) }}</span>
                            </div>
                        </div>
                        <div class="col-6 col-md-6 col-lg-6 col-xl-3">
                            <div class="item mb-2">
                                {!! get_icon('ico_child', '#4a4a4a') !!}
                                <span class="title">{{__('Group size')}}</span>
                                <?php
                                        $max_people = (float)$post->number_of_guest;
                                        ?>
                                @if($max_people == -1)
                                <span class="desc">{{ __('Unlimited')}}</span>
                                @else
                                <span
                                    class="desc">{{ _n("[0::%s people][1::%s person][2::%s people]", $max_people)}}</span>
                                @endif
                            </div>
                        </div>
                        @if($post->experience_type)
                        <?php
                                    $tour_type = get_term_by('id', $post->experience_type);
                                    ?>
                        @if(!is_null($tour_type))
                        <div class="col-6 col-md-6 col-lg-6 col-xl-3">
                            <div class="item mb-2">
                                {!! get_icon('001_tour', '#4a4a4a') !!}
                                <span class="title">{{__('Type')}}</span>
                                <span class="desc">{{ get_translate($tour_type->term_title) }}</span>
                            </div>
                        </div>
                        @endif
                        @endif
                        <div class="col-6 col-md-6 col-lg-6 col-xl-3">
                            <div class="item mb-2">
                                {!! get_icon('001_language', '#4a4a4a') !!}
                                <span class="title">{{__('Language')}}</span>
                                <?php

                                        $language = $post->languages;
                                        $language_return = '';
                                        ?>
                                @if(empty($language))
                                <span class="desc">{{ __('Not set') }}</span>
                                @else
                                <?php
                                            $language = explode(',', $language);
                                            foreach ($language as $lang) {
                                                $term = get_term_by('id', $lang);
                                                if (!is_null($term)) {
                                                    $language_return .= get_translate($term->term_title) . ', ';
                                                }
                                            }
                                            if (!empty($language_return)) {
                                                $language_return = substr($language_return, 0, -2);
                                            }
                                            ?>
                                @endif
                                <div class="desc">
                                    @if(!empty($language_return))
                                    {{$language_return}}
                                    @else
                                    {{ __('Not set') }}
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!--    </div>-->
                <!--</div>-->
                <!--<div class="row mt-4">-->
                <!--    <div class="col-12 col-md-4">-->

                <!--    </div>-->
                <!--    <div class="col-12 col-md-12">-->
                <h2 class="heading mt-0 mb-2">{{__('What you will do')}}</h2>
                {!! balanceTags(get_translate($post->post_content)) !!}
                <!--    </div>-->
                <!--</div>-->

                <?php
                $author = get_user_by_id($post->author);
                $description = $author->description;
                ?>
                <!--<div class="row mt-4">-->
                <!--    <div class="col-12 col-md-4">-->
               
                <!--    </div>-->
                <!--</div>-->
               

                <?php
                $inclusions = $post->inclusions;
                ?>
                <?php
                $exclusions = $post->exclusions;
                ?>
                 <?php
                $enableCancellation = $post->enable_cancellation;
                $cancelBeforeDay = (int)$post->cancel_before;
                $cancellationDetail = $post->cancellation_detail;
                ?>
                                 @if($post->use_offer=='on')
                <div color="#d01d20" class="rtl-1gu7ifq" style="margin-top: 32px;padding: 10px 40px;background-color: rgba(208, 29, 32, 0.15);border-radius: 20px;display: flex;-webkit-box-pack: justify;justify-content: space-between;-webkit-box-align: center;align-items: center;"><div><h4 style="
    color: rgb(208, 29, 32);
    font-size: 24px;
    margin-bottom: 7px;
">{{__('rival')}} %{{$post->offer}}</h4><p class="rtl-1g71zy2" style="
    font-size: 18px;
    line-height: 32px;
    color: rgb(5, 5, 54);
">{{__('The host offers a special discount for reservations')}}</p></div><div class="rtl-epvdos" style="
    position: relative;
    width: 36px;
    height: 36px;
"><span style="box-sizing: border-box; display: block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: absolute; inset: 0px;"><img alt="" src="{{ asset('special-star.svg') }}" decoding="async" data-nimg="fill" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; object-fit: contain;" sizes="100vw" srcset="{{ asset('special-star.svg') }} 640w, {{ asset('special-star.svg') }} 750w, {{ asset('special-star.svg') }} 828w, {{ asset('special-star.svg') }} 1080w, {{ asset('special-star.svg') }} 1200w, {{ asset('special-star.svg') }} 1920w, {{ asset('special-star.svg') }} 2048w, {{ asset('special-star.svg') }} 3840w"><noscript></noscript></span></div></div>
@endif
               <div class="tab mt-3"><button onclick="openCity(event, 'Inclusions')" id="buttonlinks" class="tablinks active">{{__('Inclusions')}}</button><button class="tablinks" onclick="openCity(event, 'Exclusions')">{{__('Exclusions')}} </button><button onclick="openCity(event, 'Policies')" class="tablinks">{{__('Policies')}}</button></div>
               <div id="Inclusions" class="tabcontent" style="display: block;padding-right: 30px;">
                   <h3 style="color:#000000; display: block;">{{__('Inclusions')}}</h3>
                    
                        <?php
                        if ($inclusions) {
                        $inclusions = explode(',', $inclusions);
                        ?>
                        <div class="inclusions mt-2">
                            
                                <?php
                                foreach ($inclusions as $item) {
                                $term = get_term_by('id', $item);
                                ?>
                                @if(!is_null($term ))
                                <li class="f-w">
                                    
                               
                                    
                                       {{ get_translate($term->term_title) }}
                                        @if($term->term_description)
                                        <div class="desc">{!! balanceTags(get_translate($term->term_description)) !!}
                                        </div>
                                        @endif
                                   
                                 </li>
                                @endif
                                <?php
                                }
                                ?>
                          
                        </div>
                        <?php
                        } else {
                        ?>
                        <p>{{__('Not set')}}</p>
                        <?php
                        }
                        ?>
                    </div>
  
               <div id="Exclusions" class="tabcontent" style="display: none;padding-right: 30px;">
                   <h3 style="color:#000000; display: block;">{{__('Exclusions')}}</h3>
                    <div class="row mt-2" >
                   
                    <div class="col-12 col-md-8">
                        <?php
                        if ($exclusions) {
                        $exclusions = explode(',', $exclusions);
                        ?>
                        <div class="inclusions">
                            
                                <?php
                                foreach ($exclusions as $item) {
                                $term = get_term_by('id', $item);
                                ?>
                                @if(!is_null($term))
                                <li class="f-w">
                                    
                               
                                {{ get_translate($term->term_title) }}
                                        @if($term->term_description)
                                        <div class="desc">{!! balanceTags(get_translate($term->term_description)) !!}
                                        </div>
                                        @endif
                                 
                                 </li>
                                @endif
                                <?php
                                }
                                ?>
                           
                        </div>
                        <?php
                        } else {
                        ?>
                        <p>{{__('Not set')}}</p>
                        <?php
                        }
                        ?>
                    </div>
                </div>
               </div>
               <div id="Policies" class="tabcontent" style="display: none;padding-right: 30px;">
                   <h3 style="color:#000000; display: block;">{{__('Policies')}}</h3>
                     @if ($enableCancellation == 'on')
                <div class="row mt-2">
                   
                    <div class="col-12 col-md-8">
                        <div class="item">
                            <span class="font-weight-bold">{{__('Cancellation:')}}</span>
                            <span class="ml-2 small-info bg-success">{{__('enable')}}</span>
                            <span
                                class="d-inline-block ml-1">{{ sprintf(__('before %s day(s)'), $cancelBeforeDay) }}</span>
                        </div>
                        @if (get_translate($cancellationDetail))
                        <div class="w-100 mt-1">{!! balanceTags(get_translate($cancellationDetail)) !!}</div>
                        @endif
                    </div>
                </div>
                @endif
               </div>
                
              
                @if($post->video)
                <div class="row mt-4">
                    <div class="col-12 col-md-12">
                        <h2 class="heading mt-0 mb-2">{{__('Video')}}</h2>
                    </div>
                    <div class="col-12 col-md-10">
                        <div class="video-wrapper">
                            {!! balanceTags(get_video_embed_url(get_translate($post->video))) !!}
                        </div>
                    </div>
                </div>
                @endif
                <hr>
                 <h2 class="heading mt-3 mb-2">{{__('Your host')}}</h2>
                <!--</div>-->
                <!--<div class="col-12 col-md-8">-->
                <div class="hosted-author">
                    <img src="{{ get_user_avatar($post->author, [64, 64]) }}" alt="{{ __('User Avatar') }}"
                        class="avatar rounded-circle">
                    <h2 class="h4"> {{get_username($author->getUserId())}}</h2>
                    @if(!empty($description))
                    <div class="hr mt-0"></div>
                    <div class="clearfix">
                        {!! balanceTags(nl2br($description)) !!}
                    </div>
                    @endif
                    <?php do_action('hh_owner_information') ?>
                </div>
                <hr>
                 @if($post->itinerary)
                <!--<div class="row mt-4">-->
                <!--    <div class="col-12 col-md-4">-->
                <h2 class="heading mt-3 mb-2">{{__('Your Itinerary')}}</h2>
                <!--</div>-->
                <!--<div class="col-12 col-md-8">-->
                <div class="itinerary-tour">
                    @foreach($post->itinerary as $item)
                    <div class="item">
                        <div class="d-block d-sm-flex align-items-center">
                            <div class="sub-title">{{ get_translate($item['sub_title']) }}</div>
                            <h2 class=" title">{{ get_translate($item['title']) }}</h2>
                        </div>
                        <div class="desc">
                            @if($item['image'])
                            <?php
                                                $image_url = get_attachment_url($item['image']);
                                                $image_alt = get_attachment_alt($item['image']);
                                                ?>
                            <img src="{{$image_url}}" class="img-fluid" alt="{{$image_alt}}">
                            @endif
                            {!! balanceTags(get_translate($item['description'])) !!}
                        </div>
                    </div>
                    @endforeach
                </div>
                <hr>
                <!--    </div>-->
                <!--</div>-->
                @endif
                
                  <div class=" container" style="    max-width: 1140px;">
                        @if (!empty($main))
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
                        <hr style="    width: 100%;">
                    </div>
                    
                <div class="row mt-4">

                    <h2 class="heading mt-0 mb-2">{{__('On Map')}}</h2>

                    <?php
                        $lat = $post->location_lat;
                        $lng = $post->location_lng;
                        $zoom = $post->location_zoom;

                        enqueue_style('mapbox-gl-css');
                        enqueue_style('mapbox-gl-geocoder-css');
                        enqueue_script('mapbox-gl-js');
                        enqueue_script('mapbox-gl-geocoder-js');
                        ?>
                    <div class="hh-mapbox-single" data-lat="{{ $lat }}" data-type="experience" data-lng="{{ $lng }}"
                        data-zoom="{{ $zoom }}"></div>

                </div>
                
            </div>
            <div class="col-12 col-sm-4 col-md-4 col-lg-3 col-sidebar">
                <?php
                enqueue_style('daterangepicker-css');
                enqueue_script('daterangepicker-js');
                enqueue_script('daterangepicker-lang-js');
                ?>
                <?php
                $booking_form = $post->booking_form;
                ?>
                <div id="form-book-experience" class="form-book"
                    data-real-price="{{ url('get-experience-price-realtime') }}">
                    <div class="popup-booking-form-close">{!! get_icon('001_close', '#FFFFFF', '28px', '28px') !!}</div>
                    <div class="form-head">
                        <div class="price-wrapper">
                            <span class="prefix">{{__('From')}} / </span>
                             @if($post->use_offer=='on')
                            
                            <span class="price">{{ (($post->base_price-(($post->base_price*$post->offer)/100))) }} {{__('Rial')}}</span>
                              <span class="price" style="position: absolute;top: 15px;text-decoration: line-through;color: red;font-size: 18px;right: 100px;">{{ convert_price($post->base_price) }}</span>
                       @else
                            
                             <span class="price" >{{ convert_price($post->base_price) }}</span>
                            @endif
                        </div>
                    </div>
                    <div class="form-body relative">
                        @include('common.loading', ['class' => 'booking-loading'])
                        @if($booking_form == 'instant_enquiry')
                        <ul class="nav nav-tabs nav-bordered row">
                            <li class="nav-item nav-item-booking-form-instant col">
                                <a href="#booking-form-instant" data-toggle="tab" aria-expanded="false"
                                    class="nav-link @if($booking_form == 'instant_enquiry' ||$booking_form == 'instant') active @endif">
                                    @if($post->booking_type == 'external_link')
                                    {{ __('External') }}
                                    @else
                                    {{ __('Instant') }}
                                    @endif
                                </a>
                            </li>
                            <li class="nav-item nav-item-booking-form-instant col">
                                <a href="#booking-form-enquiry" data-toggle="tab" aria-expanded="false"
                                    class="nav-link @if($booking_form == 'enquiry') active @endif">
                                    {{ __('Enquiry') }}
                                </a>
                            </li>
                        </ul>
                        @endif
                        @if($booking_form == 'instant_enquiry')
                        <div class="tab-content">
                            @endif
                            @if($booking_form == 'instant_enquiry' || $booking_form == 'instant')
                            <div class="tab-pane @if($booking_form == 'instant_enquiry' ||$booking_form == 'instant') active @endif"
                                id="booking-form-instant">
                                @if($post->booking_type == 'external_link')
                                @include('frontend.experience.external-form')
                                @else
                                @include('frontend.experience.booking-form')
                                @endif
                            </div>
                            @endif
                            @if($booking_form == 'instant_enquiry' || $booking_form == 'enquiry')
                            <div class="tab-pane @if($booking_form == 'enquiry') active @endif"
                                id="booking-form-enquiry">
                                <form action="{{ url('experience-send-enquiry-form') }}" data-google-captcha="yes"
                                    data-validation-id="form-enquiry" class="form-action form-sm has-reset"
                                    data-loading-from=".form-body">
                                    <div class="form-group">
                                        <label for="full-name-enquiry-form">{{ __('Full Name') }} <span
                                                class="text-danger">*</span></label>
                                        <input id="full-name-enquiry-form" type="text" name="name"
                                            class="form-control has-validation" data-validation="required">
                                    </div>
                                    <div class="form-group">
                                        <label for="email-enquiry-form">{{ __('Email') }} <span
                                                class="text-danger">*</span></label>
                                        <input id="email-enquiry-form" type="email" name="email"
                                            class="form-control has-validation" data-validation="required|email">
                                    </div>
                                    <div class="form-group">
                                        <label for="message-enquiry-form">{{ __('Message') }} <span
                                                class="text-danger">*</span></label>
                                        <textarea id="message-enquiry-form" class="form-control has-validation"
                                            name="message" data-validation="required"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <input type="submit" class="btn btn-primary btn-block text-uppercase" name="sm"
                                            value="{{ __('Send a Request') }}">
                                    </div>
                                    <input type="hidden" name="post_id" value="{{ $post->post_id }}">
                                    <input type="hidden" name="post_encrypt" value="{{ hh_encrypt($post->post_id) }}">
                                    <div class="form-message"></div>
                                </form>
                            </div>
                            @endif
                            @if($booking_form == 'instant_enquiry')
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        <?php
        $lat = $post->location_lat;
        $lng = $post->location_lng;
        $list_services = \App\Controllers\Services\ExperienceController::get_inst()->listOfExperiences([
            'number' => 4,
            'location' => [
                'lat' => $lat,
                'lng' => $lng,
                'radius' => 25
            ],
            'orderby' => 'distance',
            'order' => 'asc',
            'not_in' => [$post->post_id]
        ]);
        ?>
        @if(count($list_services['results']))
        <h2 class="heading mt-4 mb-3">{{__('Experiences Near By')}}</h2>
        <div class="hh-list-of-services list-experience">
            <div class="row">
                @foreach($list_services['results'] as $item)
                <?php $item = setup_post_data($item, 'experience'); ?>
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    @include('frontend.experience.loop.grid', ['item' => $item, 'show_distance' => true])
                </div>
                @endforeach
            </div>
        </div>
        @endif
        @if(enable_review())
        <div class="row mt-3">
            <div class="col-12 col-sm-8 col-md-8 col-lg-9 col-content">
                @include('frontend.experience.review')
            </div>
        </div>
        @endif
    </div>
    <div class="mobile-book-action">
        <div class="container">
            <div class="action-inner">
                <div class="action-price-wrapper">
                     @if($post->use_offer=='on')
                    <span class="price">{{ (($post->base_price-(($post->base_price*$post->offer)/100))) }} {{__('Rial')}}</span>
                    <span class="price" style="position: absolute;    top: 5px;right: 14px;text-decoration: line-through;color: red;font-size: 13px;">{{ convert_price($post->base_price) }}</span>
                    @else
                            
                             <span class="price" >{{ convert_price($post->base_price) }}</span>
                            @endif
                    <span class="unit">/{{$post->unit}}</span>
                </div>
                <a class="btn btn-primary action-button" id="mobile-check-availability">{{__('Check Availability')}}</a>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ __('share') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body flexBox-container">
            {!! $shareComponent !!}
        </div>

      </div>
    </div>
  </div>


  
<script>
    
      function openCity(evt, cityName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(cityName).style.display = "block";

            evt.currentTarget.className += " active";
        }
</script>

@include('frontend.components.footer')
