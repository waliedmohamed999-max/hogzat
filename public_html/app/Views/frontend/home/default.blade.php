@include('frontend.components.header1')
<?php
enqueue_script('scroll-magic-js');
global $post;


?>
<style>
.action-button{
    width: 198px;
    height: 44px;
    border-radius: 12px;
    background: #695697;
    border-color: #695697;
    
}
 @media only screen and (max-width: 600px) {
        footer .container {
          max-width: 380px;
         
     }
     .single-page {
         
           max-width: 380px;
     }
 .tab {
   overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 2px;
    max-width: 800px;
    border-radius: 25px;
    background-color: #efefef;
}
.one-img{
    
    border-top-left-radius: 18px;
    border-bottom-left-radius: 18px;
}
.tab button.active {
      border-radius: 25px;
    background-color: #695697;
    color: #fff;
    margin-top: 2px;
    padding: 10px 0px 10px 0px;
    font-weight: 500;
    font-size: 11px;

}
.tab button {
    background-color: inherit;
    float: right;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 12px;
    width: 33%;
    font-weight: 500;
    font-size: 11px;

}
     
     
 }
 @media only screen and (min-width: 768px){
  
    .tab {
   overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 2px;
    max-width: 800px;
    border-radius: 25px;
    background-color: #efefef;
}
.tab button.active {
      border-radius: 25px;
    background-color: #695697;
    color: #fff;
    margin-top: 2px;
    padding: 10px 0px 10px 0px;
    font-weight: 500;
    font-size: 14px;

}
.tab button {
    background-color: inherit;
    float: right;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 12px;
    width: 33%;
    font-weight: 500;
    font-size: 14px;

} 
     
 }


    .awe-booking .single-page .hh-grid-gallery .item {
    
    margin-right: 8px;
}
p{    font-size: 16px;}
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
}
</style>
<div class="single-page single-home pb-5">
      <div class="container text-left">
        <div class="row">
            <div class="col-12 col-sm-12 col-md-12 col-lg-12 " style="padding-right: 25px;padding-bottom: 20px;">
                @include('frontend.components.breadcrumb', ['currentPage' => get_translate($post->post_title)])
                <h1 class="title mt-3">
                    {{ get_translate($post->post_title) }}
                    @if($post->is_featured == 'on')
                        <span class="is-featured">{{ get_option('featured_text', __('Featured')) }}</span>
                    @endif
                </h1>
                <div class="text-end" style="padding-right: 10px;">
                    <span class="text-end" style="color:#7f50ba;font-size: 14px;font-weight: 500;">{{__('unitNumber:')}}:</span>
                    <span class="text-end" style="color: rgb(87, 83, 77);font-size: 14px;padding-right: 5px;font-weight: 500;">{{$post->location_postcode}}</span>
                    <div class="row mt-3"><div class="col-md-8 col-sm-12"><span><i class="fas fa-star pr-2" style="color: rgb(91, 66, 157); font-size: 17px; padding-left: 10px;"></i>0 <span style="color: rgb(157, 157, 171);font-weight: 500;">(لايوجد تقييمات)</span>
                    </span>
                    <span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span><i class="fas fa-map-marker-alt" style="color:#7f50ba; font-size: 20px; margin-right: 20px;"></i>
                    <span style="margin-right: 6px;font-weight: 500;">{{ get_translate($post->location_address) }}</span><span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span>
                    <i class="far fa-clock project-header" style="padding-right: 15px;color: #7f50ba;font-size: 20px;"></i><span style="margin-right: 6px;font-weight: 500;">التاريخ : {{date(hh_date_format(), $post->created_at)}}</span>
                    <span style="margin-bottom: 2px; margin-right: 12px; height: 5px; width: 5px; background-color: rgb(187, 187, 187); border-radius: 50%; display: inline-block;"></span><span style="margin-right: 20px;font-weight: 500;">{{$post->count}}</span><i class="far fa-eye" style="color: #7f50ba; font-size: 20px; margin-right: 10px;"></i></div>
                    <div class="col-md-4 col-sm-12 text-right fav-share">
                        @if(is_user_logged_in())
                        @if(!is_fav($post->post_id,'home'))
                        <span id="do_fav" style="cursor: pointer;" data-status="off" data-id="{{$post->post_id}}" data-type="home"><i class="far fa-heart" style="font-size: 20px;padding-top: -21px;"></i></span>
                        @else
                        <span id="do_fav" style="cursor: pointer;" data-status="on" data-id="{{$post->post_id}}" data-type="home"> <i class="fas fa-heart" style="font-size: 20px;padding-top: -21px; color:#f1556c"></i></span>
                        @endif
                        @else
                        <span  style="cursor: pointer;" data-toggle="modal"
                            data-target="#hh-login-modal" ><i class="far fa-heart" style="font-size: 20px;padding-top: -21px;"></i></span>
                        @endif
                    <span style="margin-right: 6px;margin-bottom: 2px;font-weight: 500;">المفضلة</span>
                    <svg data-toggle="modal" data-target="#exampleModal" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve" style="cursor: pointer;width: 20px; margin-right: 20px;"><g><polygon points="334.9,120.6 256,41.7 177.1,120.6 156.3,99.7 256,0 355.7,99.7 	"></polygon><rect x="241.1" y="20.8" width="29.8" height="312.6"></rect><path d="M404.8,512H107.2c-25.3,0-44.7-19.4-44.7-44.7V199.4c0-25.3,19.3-44.7,44.7-44.7h104.2v29.8H107.2c-8.9,0-14.9,6-14.9,14.9
                		v267.9c0,8.9,6,14.9,14.9,14.9h297.7c8.9,0,14.9-6,14.9-14.9V199.4c0-8.9-6-14.9-14.9-14.9H300.7v-29.8h104.2
                		c25.3,0,44.7,19.3,44.7,44.7v267.9C449.5,492.6,430.1,512,404.8,512z"></path></g></svg><span data-toggle="modal" data-target="#exampleModal" style="cursor: pointer;margin-right: 6px;margin-bottom: 2px;font-weight: 500;">المشاركة</span></div></div>
                		</div>
             
                  
            </div>
            </div>
            </div>
   
    
    
    

    
                                    @if($errors->any())
                                        <div class="alert alert-danger text-center" role="alert">
                                        {{$errors->first()}}
                                          </div>

                                    @endif
      <div class="container">
        <!-- Gallery -->
        <?php
        $gallery = $post->gallery;
        $thumbnail_id = get_home_thumbnail_id($post->post_id);
        $thumbnailUrl = get_attachment_url($thumbnail_id, 'full');
        
            $modelName = 'App\\Models\\Home';
        $model = new $modelName();
       $model->countHome($post->post_id);

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
            if(count($gallery)==2){
                  $url = get_attachment_url($gallery[0]);
            $url1 = get_attachment_url($gallery[1]);
                $data[] = [
                    'src' => $url
                ];
                 $data[] = [
                    'src' => $url1
                ];
            
           ?>
            <div class="item">
                <div class="item-inner">
                    <img src="{{get_attachment_url($gallery[0], [500, 750])}}" alt="{{ get_attachment_alt($gallery[0]) }}" style="height: 483px;border-top-right-radius: 18px;border-bottom-right-radius: 18px;">
                </div>
            </div>
             <div class="item">
                <div class="item-inner">
                    <img src="{{get_attachment_url($gallery[1], [500, 750])}}" alt="{{ get_attachment_alt($gallery[1]) }}" style="height: 483px;border-top-left-radius: 18px;border-bottom-left-radius: 18px;">
                </div>
            </div>
           <?php }
            elseif(count($gallery)==4){
                
                  foreach ( $gallery as $key => $val ) {
            $thumbnail = get_attachment_url($val, [500, 750]);
            if(in_array($i, [0,3])){
            ?>
            <div class="item">
                <div class="item-inner">
                    <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="height: 487px;{{$i==3?'border-top-left-radius: 18px;border-bottom-left-radius: 18px;':'border-top-right-radius: 18px;border-bottom-right-radius: 18px;'}}">
                </div>
            </div>
            <?php
            }elseif($i == 1 || $i == 2){
            if($i == 1){
            ?>
            <div class="item item-small ">
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
            elseif( $i == 4){
         
                ?>
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="border-bottom-left-radius: 18px;">
                    </div>
                </div>
            </div>
            <?php
            
            }
            $url = get_attachment_url($val);
            if (!empty($url)) {
                $data[] = [
                    'src' => $url
                ];
            }

            $i++;
            }
                 
                
           }
            else{
                 foreach ( $gallery as $key => $val ) {
            $thumbnail = get_attachment_url($val, [500, 750]);
            if(in_array($i, [0])){
            ?>
            <div class="item">
                <div class="item-inner">
                    <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="{{count($gallery)==1?'border-bottom-left-radius: 18px;border-top-left-radius: 18px;':''}}height: 487px;border-top-right-radius: 18px;border-bottom-right-radius: 18px;">
                </div>
            </div>
            <?php
            }elseif($i == 1 || $i == 2){
            if($i == 1){
            ?>
            <div class="item item-small d-none d-lg-block ">
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="{{count($gallery)==3?'border-top-left-radius: 18px;':''}}">
                    </div>
                </div>
                <div class="space"></div>
                <?php
                }elseif($i == 2){
                ?>
                <div class="item-outer">
                    <div class="item-inner">
                        <img src="{{$thumbnail}}" alt="{{ get_attachment_alt($val) }}" style="{{count($gallery)==3?'border-bottom-left-radius: 18px;':''}}">
                    </div>
                </div>
            </div>
             <?php
                }}
            elseif($i == 3 || $i == 4){
            if($i == 3){
            ?>
            <div class="item item-small d-none d-lg-block ">
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
                
            }
            if (!empty($data)) {
                $data = base64_encode(json_encode($data));
                echo '<div class="data-gallery" data-gallery="' . esc_attr($data) . '"></div>';
            }
            }
            ?>
        </div>
   
    <div class="container text-left" >
        <div class="row">
            <div class="col-12 col-sm-8 col-md-8 col-lg-9 col-content" style="margin-top: 30px;padding-right: 25px;">
                <!--@include('frontend.components.breadcrumb', ['currentPage' => get_translate($post->post_title)])-->
                <!--<h1 class="title mt-3">-->
                <!--    {{ get_translate($post->post_title) }}-->
                <!--    @if($post->is_featured == 'on')-->
                <!--        <span class="is-featured">{{ get_option('featured_text', __('Featured')) }}</span>-->
                <!--    @endif-->
                <!--</h1>-->
             
               
                
                <?php
                $rate = $post->review_count;
                ?>
                @if ($rate)
                    <div class="count-reviews">
                        <span class="count">{{ _n("[0::%s reviews][1::%s review][2::%s reviews]", $rate) }}</span>
                        {!! star_rating_render($post->rating) !!}
                    </div>
                @endif
                <div class="featured-amenities mt-2 mb-2" style="border-radius: 25px; background-color: #f8f8f8;max-width: 800px;">
                    <div class="item">
                        <h4 class="font">{{__('Guests:')}}</h4>
                        <span> {{ $post->number_of_guest }} </span>
                    </div>
                    <div class="item">
                        <h4 class="font">{{__('Bedrooms:')}}</h4>
                        <span>{{ $post->number_of_bedrooms }}</span>
                    </div>
                    <div class="item">
                        <h4 class="font">{{__('Bathrooms:')}}</h4>
                        <span>{{ $post->number_of_bathrooms }}</span>
                    </div>
                      <div class="item">
                        <h4 class="font">{{__('Reference number')}}</h4>
                        <span>{{$post->post_id  }}</span>
                    </div>
                    <div class="item">
                        <h4 class="font">{{__('Footage:')}}</h4>
                        <span>{{ $post->size }} {{ get_option('unit_of_measure', 'm2') }}</span>
                    </div>
                    <?php
                    $type = get_term_by('id', $post->home_type);
                    $type_name = $type ? get_translate($type->term_title) : '';
                    ?>
                    @if(!empty($type_name))
                        <div class="item">
                            <h4 class="font">{{__('Type:')}}</h4>
                            <span>{{ $type_name }}</span>
                        </div>
                    @endif
                </div>
                <h2 class="heading mt-3 mb-2">{{__('Detail')}}</h2>
               <div style="max-width: 800px;"> {!! balanceTags(get_translate($post->post_content)) !!}</div>
                <?php
                $amenities = $post->tax_home_amenity;
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
  <div class="tab mt-3"><button onclick="openCity(event, 'Amenities')" id="buttonlinks" class="tablinks active">{{__('Amenities')}}</button><button class="tablinks" onclick="openCity(event, 'Weekend Price')">{{__('Weekend Price')}} </button><button onclick="openCity(event, 'Policies')" class="tablinks">{{__('Policies')}}</button></div>
    <div id="Amenities" class="tabcontent" style="display: block;padding-right: 18px;    padding-left: 18px;">
     <h3 style="color:#000000; display: block;">{{__('Amenities')}}</h3>
     
                @if (!empty($amenities) && is_object($amenities))
                    
                    <div class="amenities row" style="border: #d1d1d1 1px solid;
    border-radius: 25px;padding-top: 10px;max-width: 735px;">
                        @foreach ($amenities as $amenity)
                            <div class="col-6 col-sm-4 col-lg-3">
                                <div class="amenity-item" data-toggle="ots-tooltip"
                                     data-title="{{ get_translate($amenity->term_description) }}">
                                    @if (!$amenity->term_icon)
                                        <i class="fe-check"></i>
                                    @else
                                        {!! get_icon($amenity->term_icon, '#2a2a2a', '30px', '')  !!}
                                    @endif
                                    <span class="title">{{ get_translate($amenity->term_title) }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
    </div>
     <div id="Weekend Price" class="tabcontent" style="display: none;padding-right: 30px;">
     <h3 style="color:#000000; display: block;">{{__('Weekend Price')}}</h3>
        <?php
                        $weekend_to_apply = $post->weekend_to_apply;
                        $weekend_price = $post->weekend_price;
                        ?>
                        @if($weekend_to_apply)
                            <div class="item d-inline-block mr-4 mb-3">
                                <span class="font-weight-bold">{{ __($weekend_to_apply)}}</span>
                                <span class="ml-2">{{ $weekend_price }}{{__('Rial')}}</span>
                            </div>
                        @endif
     
    </div>
     <div id="Policies" class="tabcontent" style="display: none;padding-right: 30px;">
     <h3 style="color:#000000; display: block;">{{__('Policies')}}</h3>
      <?php
                        $checkIn = $post->checkin_time;
                        $checkOut = $post->checkout_time;
                        $enableCancellation = $post->enable_cancellation;
                        $cancelBeforeDay = (int)$post->cancel_before;
                        $cancellationDetail = $post->cancellation_detail;
                        ?>
                 
                       
                           @if ($enableCancellation == 'on')
                    <div class="item d-inline-block mr-4 mb-3">
                        <span class="font-weight-bold">{{__('Cancellation:')}}</span>
                        <span class="ml-2 small-info bg-success">{{__('enable')}}</span>
                        <span class="d-inline-block ml-1">{{ sprintf(__('before %s day(s)'), $cancelBeforeDay) }}</span>
                    </div>
                    @if (get_translate($cancellationDetail))
                        <div class="w-100">{!! balanceTags(get_translate($cancellationDetail)) !!}</div>
                    @endif
                @endif
    </div>
  
                   <div class="row">
                    <div class="col-md-6">
                       
                       
                    </div>
                    <div class="col-md-6">
                      
                     
                    </div>
                    </div>
                <div class="w-100"></div>
             
                <h2 class="heading mt-3 mb-2">{{__('Availability')}}</h2>
                @if (isset($post->last))
                 <div class="row">
                     <div class="col-md-6">
                         <h5>start date</h5>
                         <span>{{ date(hh_date_format(),$post->start_time_last) }}</span>
                     </div>
                     <div class="col-md-6">
                         <h5>end date</h5>
                         <span>{{  date(hh_date_format(),strtotime('+1 day',$post->start_time_last)) }}</span>
                     </div>
                 </div>
                @else
                <p style="font-size: large;background-color: #e5cc488f;  max-width: 450px; padding: 5px 15px 5px 0px;">{{__('gold day')}}</p>
                <div class="hh-availability-wrapper">
                    <div class="hh-availability">
                        <input type="hidden" class="calendar_input"
                               data-id="{{$post->post_id}}"
                               data-encrypt="{{hh_encrypt($post->post_id)}}"
                               data-action="{{ url('get-inventory-home') }}"
                               data-date-format="{{hh_date_format_moment()}}">
                    </div>
                </div>
                 @endif
                @if($post->video)
                    <h2 class="heading mt-3 mb-2">{{__('Video')}}</h2>
                    <div class="video-wrapper">
                        {!! balanceTags(get_video_embed_url(get_translate($post->video))) !!}
                    </div>
                @endif
                <h2 class="heading mt-3 mb-2">{{__('On Map')}}</h2>
                <?php
                $lat = $post->location_lat;
                $lng = $post->location_lng;
                $zoom = $post->location_zoom;
           

                enqueue_style('mapbox-gl-css');
                enqueue_style('mapbox-gl-geocoder-css');
                enqueue_script('mapbox-gl-js');
                enqueue_script('mapbox-gl-geocoder-js');
                ?>
                <div class="hh-mapbox-single" data-lat="{{ $lat }}"
                     data-lng="{{ $lng }}" data-zoom="{{ $zoom }}"></div>
                <?php
                $author = get_user_by_id($post->author);
                $address = $author->address;
                $location = $author->location;
                $country = get_country_by_code($location);
                $description = $author->description;
                ?>
                <div class="w-100 mt-3"></div>
                <div class="hosted-author">
                    <div class="media">
                        <img src="{{ get_user_avatar($post->author, [64, 64]) }}" alt="{{ __('User Avatar') }}"
                             class="avatar rounded-circle mr-3">
                        <div class="media-body">
                            <h2 class="heading mt-0 mb-1">{{sprintf(__('Hosted by %s'), get_username($author->getUserId()) )}}</h2>
                            @if(!empty($address) || !empty($location))
                                <p class="location-author d-flex align-items-center">
                                    @if(!empty($address)) {{$address}} @endif
                                    @if(!empty($location)), {{ $country['name'] }} <span
                                        class="ml-1">{!! $country['flag24'] !!}</span> @endif
                                    <span class="d-none d-sm-inline-block"><span class="dot"></span>{{ sprintf(__('Joined in %s'), date(hh_date_format(), strtotime($author->created_at))) }}</span>
                                </p>
                            @endif
                        </div>
                    </div>
                    @if(!empty($description))
                        <div class="clearfix mt-2" >
                            {!! balanceTags(nl2br($description)) !!}
                        </div>
                        <hr style="border-bottom: 2px solid #d8d8d8;">
                    @endif
                    <?php do_action('hh_owner_information'); ?>
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
                $text_external_link = $post->text_external_link;
                $external_link = $post->use_external_link;
                ?>
                <div id="form-book-home" class="form-book"
                     data-real-price="{{ url('get-home-price-realtime') }}">
                    <div class="popup-booking-form-close">{!! get_icon('001_close', '#FFFFFF', '28px', '28px') !!}</div>
                  @if(isset($post->last))
                    <div class="form-head">
                        <div class="price-wrapper">
                            <span class="price">{{ convert_price($post->price) }}</span>
    
                            @if($post->booking_type != 'external_link')
                                <span class="unit" >/{{$post->unit}}</span>
                            @endif
                        </div>
                    </div>
                    @else
                    <div class="form-head">
                        <div class="price-wrapper">
                            @if($post->use_offer=='on')
                             <span class="price">
                            {{ convert_price(($post->base_price-(($post->base_price*$post->offer)/100))) }}
                            </span>
                             <span class="price" style="position: absolute;top: 18px;text-decoration: line-through;color: red;font-size: 13px;">{{ convert_price($post->base_price) }}</span>
                            @else
                            
                             <span class="price" >{{ convert_price($post->base_price) }}</span>
                            @endif
                           
                            @if($post->booking_type != 'external_link')
                                <span class="unit" style="color:#ec9b01">/{{$post->unit}}</span>
                            @endif
                        </div>
                    </div>
                    @endif
                    <div class="form-body relative">
                        @include('common.loading', ['class' => 'booking-loading'])
                        @if($booking_form == 'instant_enquiry')
                            <ul class="nav nav-tabs nav-bordered row">
                                <li class="nav-item nav-item-booking-form-instant col">
                                    <a href="#booking-form-instant"
                                       data-toggle="tab"
                                       aria-expanded="false"
                                       class="nav-link @if($booking_form == 'instant_enquiry' ||$booking_form == 'instant') active @endif">
                                        @if($post->booking_type == 'external_link')
                                            {{ __('External') }}
                                        @else
                                            {{ __('Instant') }}
                                        @endif
                                    </a>
                                </li>
                                <li class="nav-item nav-item-booking-form-instant col">
                                    <a href="#booking-form-enquiry"
                                       data-toggle="tab"
                                       aria-expanded="false"
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
                                    <div
                                        class="tab-pane @if($booking_form == 'instant_enquiry' ||$booking_form == 'instant') active @endif"
                                        id="booking-form-instant">
                                        @if($post->booking_type == 'external_link')
                                            @include('frontend.home.external-form')
                                        @else
                                            @include('frontend.home.booking-form')
                                        @endif
                                    </div>
                                @endif
                                @if($booking_form == 'instant_enquiry' || $booking_form == 'enquiry')
                                    <div class="tab-pane @if($booking_form == 'enquiry') active @endif"
                                         id="booking-form-enquiry">
                                        <form action="{{ url('home-send-enquiry-form') }}" data-google-captcha="yes"
                                              data-validation-id="form-send-enquiry"
                                              class="form-action form-sm has-reset" data-loading-from=".form-body">
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
                                                       class="form-control has-validation"
                                                       data-validation="required|email">
                                            </div>
                                            <div class="form-group">
                                                <label for="message-enquiry-form">{{ __('Message') }} <span
                                                        class="text-danger">*</span></label>
                                                <textarea id="message-enquiry-form" class="form-control has-validation"
                                                          name="message" data-validation="required"></textarea>
                                            </div>
                                            <div class="form-group">
                                                <input type="submit" class="btn btn-primary btn-block text-uppercase"
                                                       name="sm"
                                                       value="{{ __('Send a Request') }}">
                                            </div>
                                            <input type="hidden" name="post_id" value="{{ $post->post_id }}">
                                            <input type="hidden" name="post_encrypt"
                                                   value="{{ hh_encrypt($post->post_id) }}">
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
        $list_services = \App\Controllers\Services\HomeController::get_inst()->listOfHomes([
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
            <h2 class="heading mt-3 mb-2">{{__('Homes Near By')}}</h2>
            <div class="hh-list-of-services">
                <div class="row">
                    @foreach($list_services['results'] as $item)
                        <div class="col-12 col-md-6 col-lg-3">
                            @include('frontend.home.loop.grid', ['item' => $item, 'show_distance' => true])
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
        @if(enable_review())
            <div class="row">
                <div class="col-12 col-sm-8 col-md-8 col-lg-9 col-content">
                    @include('frontend.home.review')
                </div>
            </div>
        @endif
    </div>
    <div class="mobile-book-action">
        <div class="container" style=" max-width: 380px;">
            <div class="action-inner">
                <div class="action-price-wrapper">
                     @if($post->use_offer=='on')
                             <span class="price">
                            {{ convert_price(($post->base_price-(($post->base_price*$post->offer)/100))) }}
                            </span>
                             <span class="price" style="position: absolute;    top: 5px;right: 5px;text-decoration: line-through;color: red;font-size: 13px;">{{ convert_price($post->base_price) }}</span>
                            @else
                            
                             <span class="price" >{{ convert_price($post->base_price) }}</span>
                            @endif
                    <span class="unit">/{{$post->unit}}</span>
                </div>
                <a class="btn action-button " id="mobile-check-availability">{{__('Check Availability')}}</a>
            </div>
        </div>
    </div>
</div>
  <!-- Modal -->
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
