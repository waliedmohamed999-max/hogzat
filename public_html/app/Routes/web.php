<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

  Route::post('sendDownloadLink', 'SendMessageController@SendDownloadLink')->name('sendDownloadLink');
//Experience Route

Route::group(['middleware' => ['locale', 'enable_experience', 'html_compress']], function () {
    $experience = Config::get('awebooking.post_types')['experience'];

    Route::get($experience['slug'] . '/{experience_id}/{experience_name?}', 'Services\ExperienceController@_getExperienceSingle')->name($experience['slug']);

    Route::get($experience['slug'] . '/ical/{experience_id}/ical.ics', 'Services\ExperienceController@_getIcalUrl');

    Route::post('get-experience-availability-single', 'Services\ExperienceController@_getExperienceAvailabilitySingle');

    Route::post('get-experience-date-time', 'Services\ExperienceController@_getExperienceDateTime');

    Route::post('get-experience-guest', 'Services\ExperienceController@_getExperienceGuest');

    Route::post('get-total-price-experience', 'Services\ExperienceController@_getTotalPriceExperience');

    Route::post('add-to-cart-experience', 'Services\ExperienceController@_addToCartExperience');

    Route::get($experience['search_slug'], 'Services\ExperienceController@_searchPage')->name($experience['search_slug']);
  
  //vote
    Route::get('vote/{id}', 'Services\ExperienceController@vote')->name('vote');
    Route::get('all-vote', 'Services\ExperienceController@allVote')->name('all-vote');
    Route::get('vote-count/{id}', 'Services\ExperienceController@_countVote')->name('vote-count');
 Route::get('get-sub/{id}', 'Services\ExperienceController@_getSub')->name('get-sub');
    Route::post($experience['search_slug'], 'Services\ExperienceController@_getSearchResult');
    Route::post('participants', 'Services\ExperienceController@participants');
  Route::post('participantsLink', 'Services\ExperienceController@participantsLink');
    Route::post('experience-send-enquiry-form', 'Services\ExperienceController@_sendEnquiryForm');

});


//Home Route


Route::group(['middleware' => ['locale', 'enable_home', 'html_compress']], function () {
    $home = Config::get('awebooking.post_types')['home'];

    Route::get($home['slug'] . '/{home_id}/{home_name?}/{last_Minute?}', 'Services\HomeController@_getHomeSingle')->name($home['slug']);

    Route::get($home['slug'] . '/ical/{home_id}/ical.ics', 'Services\HomeController@_getIcalUrl');

    Route::post('get-home-availability-single', 'Services\HomeController@_getHomeAvailabilitySingle');

    Route::post('get-home-availability-time-single', 'Services\HomeController@_getHomeAvailabilityTimeSingle');

    Route::post('get-home-price-realtime', 'Services\HomeController@_getHomePriceRealTime');

    Route::post('add-to-cart-home', 'Services\HomeController@_addToCartHome');

    Route::post('home-send-enquiry-form', 'Services\HomeController@_sendEnquiryForm');

    Route::post('get-home-near-you-ajax', 'Services\HomeController@_getHomeNearYouAjax');

    Route::post('get-latest-home-ajax', 'Services\HomeController@_getLatestHomeAjax');

    Route::get($home['search_slug'], 'Services\HomeController@_searchPage')->name($home['search_slug']);

    Route::post($home['search_slug'], 'Services\HomeController@_getSearchResult');

    Route::post('get-inventory-home', 'Services\HomeController@_getAvailabilityHome');
});

//Car Route

Route::group(['middleware' => ['locale', 'enable_car', 'html_compress']], function () {
    $car = Config::get('awebooking.post_types')['car'];

    Route::post('get-car-availability-single', 'Services\CarController@_getCarAvailabilitySingle');

    Route::post('get-car-availability-time-single', 'Services\CarController@_getCarAvailabilityTimeSingle');

    Route::post('get-car-price-realtime', 'Services\CarController@_getCarPriceRealTime');

    Route::post('add-to-cart-car', 'Services\CarController@_addToCartCar');

    Route::get($car['search_slug'], 'Services\CarController@_searchPage')->name($car['search_slug']);

    Route::post($car['search_slug'], 'Services\CarController@_getSearchResult');

    Route::get($car['slug'] . '/{car_id}/{car_name?}', 'Services\CarController@_getCarSingle')->name($car['slug']);

    Route::post('car-send-enquiry-form', 'Services\CarController@_sendEnquiryForm');
});


Route::group(['prefix' => Config::get('awebooking.prefix_auth'), 'middleware' => ['is_login', 'locale']], function () {
    
      Route::post('check', 'AuthController@checkMobileUser')->name('check');

    Route::get('login', 'AuthController@_getLogin')->name('login');

    Route::post('login', 'AuthController@_postLogin')->name('post.login');

});

Route::group(['prefix' => Config::get('awebooking.prefix_auth'), 'middleware' => 'locale'], function () {

    Route::post('logout', 'AuthController@_postLogout')->name('post.logout');
    Route::get('logout', 'AuthController@_getLogout')->name('get.logout');
});

Route::group(['prefix' => Config::get('awebooking.prefix_auth'), 'middleware' => 'locale'], function () {

    Route::get('reset-password', 'AuthController@_getResetPassword')->name('get.reset.password');

    Route::post('reset-password', 'AuthController@_postResetPassword')->name('post.reset.password');

    Route::get('sign-up', 'AuthController@_getSignUp')->name('get.sign.up');

    Route::post('sign-up', 'AuthController@_postSignUp')->name('post.sign.up');
});


Route::group(['middleware' => ['locale', 'html_compress']], function () {
// Notification
    Route::post('get-notifications', 'NotificationController@_getNotifications');

    Route::get('premium/{path?}', 'HomePageController@premiumFrontend')
        ->where('path', '.*')
        ->name('premium-entry');

    Route::get(Config::get('awebooking.checkout_slug'), 'CheckoutController@_checkoutPage')->name('check-out');

    Route::get(Config::get('awebooking.after_checkout_slug'), 'CheckoutController@_thankyouPage')->name('thank-you');

    Route::post(Config::get('awebooking.after_checkout_slug'), 'CheckoutController@_thankyouPage')->name('thank-you-post');

    Route::post('add-coupon', 'CouponController@_addCouponToCart');

    Route::post('remove-coupon', 'CouponController@_removeCouponFromCart');

    Route::post('checkout', 'CheckoutController@_checkoutAction');

    Route::get('page/{page_id}/{page_slug?}', 'PageController@viewPage')->name('view-page');

    Route::get('post/{post_id}/{post_slug?}', 'PostController@viewPost')->name('post');

    Route::get('blog/{page?}', 'PostController@viewBlog')->name('blog');

    Route::get('category/{term_slug}/{page?}', 'PostController@viewCategory')->name('category');

    Route::get('tag/{term_slug}/{page?}', 'PostController@viewTag')->name('tag');

    Route::post('add-post-comment', 'CommentController@addCommentAction');

    Route::get('/', 'HomePageController@index')->name('home-page');

    Route::get('home', 'HomePageController@_homePage')->name('home-demo');

    Route::get('experience', 'HomePageController@_experiencePage')->name('experience-demo');

    Route::get('car', 'HomePageController@_carPage')->name('car-demo');

    Route::post('subscribe-email', 'AuthController@subscribeEmail');
    
     Route::post('send-gift', 'CheckoutController@send_gift')->name('send-gift');

// Social login
    Route::get('social-login/{social?}', 'SocialController@_checkLogin');

// Contact page
    Route::get('contact-us', 'HomePageController@_contactPage')->name('contact-us');

    Route::post('contact-us-post', 'HomePageController@_contactUsPost');

    Route::get('become-a-host', 'UserController@_becomeAHost')->name('become-a-host');

    Route::post('become-a-host', 'UserController@_becomeAHostPost')->name('become-a-host-post');

    Route::get('welcome-user/{return}', 'UserController@_afterRegisterPartner')->name('welcome-user');

    Route::post('import-demo', 'ImportController@_runImport')->middleware(['authenticate']);
});


Route::group(['middleware' => ['html_compress']], function () {

    Route::get('coming-soon', 'HomePageController@_comingSoon')->name('coming-soon');
});

Route::group(['middleware' => ['authenticate', 'html_compress']], function () {
    Route::get('system-tools', 'UpdateController@_systemTools')->name('system-tools');
    Route::post('system-tools', 'UpdateController@_systemToolsPost');
    Route::post('set-icon', 'UpdateController@_setIconSVG');
    Route::post('get-icon', 'UpdateController@_getIconSVG');
    Route::post('import-data', 'ImportController@_adminImportData');
});

/*Sitemap*/

Route::get('sitemap_index.xml', 'SitemapController@_createSitemapIndex')->name('create-sitemap-index');

Route::get('post-{page}.xml', 'SitemapController@_createSitemapPost')->name('create-sitemap-post');
Route::get('post.xml', 'SitemapController@_createSitemapPost')->name('create-sitemap-post-index');

Route::get('home-{page}.xml', 'SitemapController@_createSitemapHome')->name('create-sitemap-home');
Route::get('home.xml', 'SitemapController@_createSitemapHome')->name('create-sitemap-home-index');

Route::get('car-{page?}.xml', 'SitemapController@_createSitemapCar')->name('create-sitemap-car');
Route::get('car.xml', 'SitemapController@_createSitemapCar')->name('create-sitemap-car-index');

Route::get('experience-{page?}.xml', 'SitemapController@_createSitemapExperience')->name('create-sitemap-experience');
Route::get('experience.xml', 'SitemapController@_createSitemapExperience')->name('create-sitemap-experience-index');

Route::get('page{page?}.xml', 'SitemapController@_createSitemapPage')->name('create-sitemap-page');
Route::get('page.xml', 'SitemapController@_createSitemapPage')->name('create-sitemap-page-index');

Route::get('cache/{name}/{redirect}', 'UpdateController@_clearCache')
    ->middleware(['authenticate'])
    ->name('clear-cache');

