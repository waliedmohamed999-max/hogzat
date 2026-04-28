<style>
    .font {
    font-weight: 600;
    font-size: 16px;
}

@media only screen and (max-width: 767px)
{
.btnViewUnitSearch {
  
    margin: 1% 0px 0px 10%;
    width: 30%;
}
}
.fav12{
    cursor: pointer;
    font-size: 30px;
    position: absolute;
    top: 4%;
    left: 20px;
    z-index: 1;
    color: white;
    
}    
   
</style>
<div class="hh-service-item home list" data-lng="{{ $item->location_lng }}"
     data-lat="{{ $item->location_lat }}" data-id="{{ $item->post_id }}">
     
    <div class="item-inner">
        <div class="thumbnail-wrapper">
             @if(is_user_logged_in())
                        @if(!is_fav($item->post_id,'home'))
                        <span   class="fav12 fav5"  data-status="off" data-id="{{$item->post_id}}" data-type="home"><i class="far fa-heart" style="font-size: 30px;"></i></span>
                        @else
                        <span  class="fav12 fav5" data-status="on" data-id="{{$item->post_id}}" data-type="home"> <i class="fas fa-heart" style="font-size: 30px; color:#f1556c"></i></span>
                        @endif
                        @else
                        <span  class="fav12 " data-toggle="modal"
                            data-target="#hh-login-modal" style="cursor: pointer;" ><i class="far fa-heart" style="font-size: 30px;padding-top: -21px;"></i></span>
                        @endif
            @if($item->is_featured == 'on')
                <div class="is-featured">{{ get_option('featured_text', __('Featured')) }}</div>
            @endif
            @if(!empty($item->gallery))
                <?php
                $galleries = explode(',', $item->gallery);
                $featured_image = $item->thumbnail_id;
                if(!empty($featured_image)){
                    array_unshift($galleries, $featured_image);
                }
                ?>
                <div id="hh-item-carousel-{{ $item->post_id }}" class="hh-item-carousel carousel slide"
                     data-ride="carousel">
                    <div class="carousel-inner" role="listbox">
                        @foreach ($galleries as $key => $imageID)
                            <div class="carousel-item @if($key == 0) active @endif">
                                <a href="{{ get_the_permalink($item->post_id, $item->post_slug,isset($item->last) ? 'last' : '') }}"
                                   class="carousel-cell">
                                    <img src="{{ get_attachment_url($imageID, [400, 300]) }}"
                                         alt="{{ get_translate($item->post_title) }}"/>
                                </a>
                            </div>
                      
                        @endforeach
                    </div>
                    <a class="carousel-control-prev" href="#hh-item-carousel-{{ $item->post_id }}" role="button"
                       data-slide="prev">
                        <i class="ti-angle-left"></i>
                        <span class="sr-only">{{__('Previous')}}</span>
                    </a>
                    <a class="carousel-control-next" href="#hh-item-carousel-{{ $item->post_id }}" role="button"
                       data-slide="next">
                        <i class="ti-angle-right"></i>
                        <span class="sr-only">{{__('Next')}}</span>
                    </a>
                </div>
                      
                            <div class="countShow">
                <i class="" data-fa-i2svg=""><svg style="width: 1.125em;" class="svg-inline--fa fa-eye fa-w-18" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg=""><path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg></i>
           {{ $item->count }}           </div>
            @else
                <a href="{{ get_the_permalink($item->post_id, $item->post_slug,isset($item->last) ? 'last' : '') }}" class="no-gallery">
                    <img src="{{ placeholder_image([400, 300]) }}" alt="{{ get_translate($item->post_title)  }}"
                         class="img-fluid"/>
                </a>
            @endif
        </div>
        <div class="content mt-3 mb-2">
            <div class="d-flex justify-content-between align-items-center">
                  @if($item->use_offer=="on")
              <span class="rtl-9tif1f" style="position: absolute;background-color: rgb(255, 255, 255);border: 1px solid rgb(230, 230, 230);border-radius: 12px;font-size: 14px;font-weight: 500;height: 28px;padding: 0px 8px;display: inline-flex;-webkit-box-align: center;align-items: center;left: 155px;"><span style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"><span style="box-sizing: border-box; display: block; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; max-width: 100%;"><img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2718%27%20height=%2718%27/%3e" style="display: block; max-width: 100%; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px;"></span><img alt="خصم %16" src="{{ asset('special-star.svg') }}" decoding="async" data-nimg="intrinsic" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; object-fit: contain;" srcset="{{ asset('special-star.svg') }} 1x, {{ asset('special-star.svg') }} 2x"></span><span class="rtl-2dse8b" style=" margin-right: 5px;">خصم %{{$item->offer}}</span></span>
                @endif
                <div class="home-type">
                    <?php
                    $type = get_term_by('id', $item->home_type);
                    $type_name = $type ? get_translate($type->term_title) : '';
                    ?>
                    {{ $type_name }}
                </div>
                @if(enable_review())
                    <div class="rating">
                        <?php
                        $offer=request()->get('offer');
                        $sm=request()->get('sm');
                        $review_number = get_comment_number($item->post_id, 'home');
                        if ($review_number > 0) {
                            echo '<i class="fe-star-on"></i> ';
                            echo '<b>' . esc_attr($item->rating) . '</b> ';
                        }
                        echo '<span>(';
                        echo _n("[0::No reviews][1::%s review][2::%s reviews]", $review_number);
                        echo ')</span>';
                        ?>
                    </div>
                @endif
            </div>
            <h3 class="title">
                <a  class="font" href="{{ get_the_permalink($item->post_id, $item->post_slug,isset($item->last) ? 'last' : '') }}">{{ get_translate($item->post_title) }}</a>
                @if($offer!=null||$sm!=null)
                  <img  style="    height: 37px;float: left;"
                    src="{{asset('/images/star-labayh.png')}}" >
                    
                <!--<span style="font-size: 13px;position:absolute;text-align:center;width:26px;padding-top:6px;padding-left:4px; color:white;">B</span>-->
                <!-- <i style="color: yellow;" class="fas fa-star"></i>-->
                @endif
            </h3>
              @if(isset($item->creattted_at) )
               <div class="row">
               <div class="col-md-8">   <p class="address text-overflow"><i class="fe-map-pin mr-1"></i>{{ get_short_address($item) }}</p></div>
               <div class="col-md-4">
                   <div style="border: solid 1px #ff0000a6;color: #ff0000a6;font-weight: bold;text-align: center;" class="demo" data-startdate="{{ $item->creattted_at }}"></div>
               </div>
           </div>
          @endif
            <div class="facilities">
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
             <div class="text-center">
                <div class="row mt-2">
      <div class="col-md-5" style="    width: auto;">
            <div class="meta-footer">
                
                 @if(isset($item->creattted_at) )
                <div class="price-wrapper">
                 
                    <span style="  margin-top: 10px;font-size: 0.8em;text-decoration: line-through;color: #db0a0a;">
                        {{ convert_price($item->base_price) }}</span>
                        
                          <span class="price">{{ convert_price($item->price) }}</span><span
                        class="unit">/{{get_home_unit($item)}}</span>
                </div>
                @else
                   <div class="price-wrapper">
                       
                       
                           @if($item->use_offer=='on')
                        
            <span class="price">
                            {{ convert_price(($item->base_price-(($item->base_price*$item->offer)/100))) }}
                            </span>
                             <span class="price" style="position: absolute;top: 7px;text-decoration: line-through;color: red;font-size: 12px;">{{ convert_price($item->base_price) }}</span>
            @else
             <span class="price">{{ convert_price($item->base_price) }}</span>
            @endif
                    
                    <span
                        class="unit">/{{get_home_unit($item)}}</span>
                </div>
                @endif
               
            </div>
            </div>
            <div class="col-md-7"  style="      padding-right: 20px;
  text-align: -webkit-right;    width: auto;">
            
                            @if ($item->location_address)
                    <span class="location font-12" style="font-size:12px;">
                        <i class="ti-location-pin"></i>
                        {{ get_translate($item->location_address) }}
                    </span>
                @endif
                  
                       
                             <div class="item"  style="font-size:12px;">
                        <p style="margin: 0px;">{{__('Reference number')}}  <span> {{ $item->post_id }} </span></p>
                       
                    </div>
                      
                
          
  <!--<a href="{{ get_the_permalink($item->post_id, $item->post_slug,isset($item->last) ? 'last' : '') }}" target="_blank" class="btn btnViewUnitSearch">{{__('ditails')}}</a>-->
  </div>
  </div>
            </div>
        </div>
    </div>
</div>
<script>
$('.fav5').on("click", function () {
   var id=$(this).data('id');
   var type=$(this).data('type');
    if($(this).data('status')=='off'){
        
         $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: "/dashboard/favourite/add/"+type+"/"+id,
        cache: false,
        contentType: false,
        processData: false,
        success: (data) => {
            $(this).html('<i class="fas fa-heart" style="font-size: 30px; color:#f1556c"></i>');
            $(this).data('status','on');
           
        },
        error: function (data) {
            console.log(data);
        }
    });
        
        
    }
   else{
      
       
        
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: "/dashboard/favourite/remove/"+type+"/"+id,
        cache: false,
        contentType: false,
        processData: false,
        success: (data) => {
             $(this).html('<i class="far fa-heart" style="font-size: 30px;"></i>');
             $(this).data('status','off');
           
        },
        error: function (data) {
            console.log(data);
        }
    });
   }
    
    
});</script>
