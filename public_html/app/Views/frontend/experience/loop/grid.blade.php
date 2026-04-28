<Style>
    .fav12{
    cursor: pointer;
    font-size: 30px;
    position: absolute;
    top: 4%;
    left: 20px;
    z-index: 1;
    color: white;
    
} 
@media (min-width: 1200px)
{
   
    
}
@media (min-width: 1600px){

   
}
</Style>

<div class="hh-service-item experience grid" data-plugin="matchHeight" data-lng="{{ $item->location_lng }}"
     data-lat="{{ $item->location_lat }}" data-id="{{ $item->post_id }}">
   
    @if(is_user_logged_in())
                        @if(!is_fav($item->post_id,'experience'))
                        <span   class="fav12 fav6"  data-status="off" data-id="{{$item->post_id}}" data-type="experience"><i class="far fa-heart" style="font-size: 30px;"></i></span>
                        @else
                        <span  class="fav12 fav6" data-status="on" data-id="{{$item->post_id}}" data-type="experience"> <i class="fas fa-heart" style="font-size: 30px; color:#f1556c"></i></span>
                        @endif
                        @else
                        <span  class="fav12 " data-toggle="modal"
                            data-target="#hh-login-modal" style="cursor: pointer;" ><i class="far fa-heart" style="font-size: 30px;padding-top: -21px;"></i></span>
                        @endif
    <a href="{{ get_the_permalink($item->post_id, $item->post_slug,'', 'experience') }}">
        <div class="thumbnail">
            <div class="thumbnail-outer">
                <div class="thumbnail-inner">
                    <img src="{{ get_attachment_url($item->thumbnail_id, [650, 550]) }}"
                         alt="{{ get_attachment_alt($item->thumbnail_id ) }}"
                         class="img-fluid">
                </div>
            </div>
        </div>
    </a>
    <div class="detail">
        <?php
        $short_address = get_short_address($item);
        ?>
        @if(!empty($short_address))
            <div class="address">
                <i class="ti-location-pin"></i>
                {{ $short_address }}
                @if(isset($show_distance) && $show_distance && isset($item->distance))
                    <?php
                    $distance = round($item->distance, 2);
                    ?>
                    <strong>({{ $distance }}{{__('km')}})</strong>
                @endif
            </div>
        @endif
        <a class="title mb-1" href="{{ get_experience_permalink($item->post_id, $item->post_slug) }}">
            @if($item->is_featured == 'on')
                <span class="is-featured featured-icon"
                      title="{{__('Featured')}}">{!! balanceTags(get_icon('001_diamond', '', '15px', '18px')) !!}</span>
            @endif
            {{ get_translate($item->post_title) }}</a>
        <?php
        $duration = $item->durations;
        ?>
        <div class="row">
            <div class="col-md-6">
                  @if(!empty($duration))
            <div class="duration d-flex align-items-center">
                <span class="mr-1"> {!! get_icon('001_clock', '#4a4a4a', '15px', '15px') !!}
                </span>
                {{ get_translate($duration) }}
            </div>
        @endif
            </div>
         
             <div class="col-md-6">
                     <div class="d-flex align-items-center justify-content-between">
            <?php
            $rate = $item->review_count;
            ?>
            @if(enable_review() && $rate)
                <div class="count-reviews">
                    {{ number_format(round((float)$item->rating, 1), 1) }} <i class="fas fa-star"></i>
                </div>
            @endif
            <div class="price-wrapper {{ (!$rate || !enable_review()) ? 'left' : '' }}" style=" padding: 0px;">
                <span class="unit">{{__('From')}}
                       @if($item->use_offer=='on')
                    

                        <div>
                                <span class="price">
                            {{ convert_price(($item->base_price-(($item->base_price*$item->offer)/100))) }}
                            </span>
                             <span class="price" style="text-decoration: line-through;color: red;font-size: 12px;">{{ convert_price($item->base_price) }}</span>
                        </div>
                        

                                 
            @else
             <span class="price">{{ convert_price($item->base_price) }}</span>
            @endif
                    <!--<span class="price">{{ convert_price($item->base_price) }}</span>-->
                </span>
            </div>
        </div>
             </div>
        </div>
        @if($item->voteable=='on')
        <div class="row" style="
    position: absolute;
    top: -56px;
">
               <div class="col-md-6">  <img src="{{asset('images/VOTE-Labayh.png')}}" alt="" width="60px"height="100%"></div>
        </div>
        @endif
        
      
        <div class="w-100 mt-1"></div>
      
    </div>
</div>
<script>
$('.fav6').on("click", function () {
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
