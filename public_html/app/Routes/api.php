<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'v1', 'middleware' => 'api_token'], function () {
    Route::post('post', 'Api\PostController@store')->middleware('user_can_manage_post');

    //Authentication
    Route::post('logout', 'Api\UserController@logout');
    Route::post('reset-password', 'Api\UserController@resetPassword');
    Route::post('change-password', 'Api\UserController@changePassword');
    Route::get('current-user', 'Api\UserController@getCurrentUser');
    Route::post('update-profile', 'Api\UserController@updateProfile');

    //Review
	Route::post('add-review', 'Api\CommentController@addReview');

	//Add Cart
	Route::post('add-cart', 'Api\BookingController@addToCart');
	Route::get('get-cart', 'Api\BookingController@getCart');
   
	//Checkout
	Route::post('checkout', 'Api\BookingController@checkout');
});

Route::group(['prefix' => 'v1'], function () {
    Route::post('token', 'Api\APIController@token');

    //Authentication
    Route::post('login', 'Api\UserController@login');
    Route::post('SendCode', 'Api\UserController@SendCode');
    Route::post('verifie', 'Api\UserController@verifie');
    Route::post('UserInfo', 'Api\UserController@UserInfo');
    Route::post('register', 'Api\UserController@register');
    Route::get('avatar/{id}', 'Api\MediaController@getUserAvatar');
    //Language
    Route::get('languages', 'Api\LanguageController@index');

    //Post
    Route::get('posts', 'Api\PostController@index');
    Route::get('post/{id?}', 'Api\PostController@show');

    //Page
    Route::get('page/{id?}', 'Api\PageController@show');

    //Home
	Route::get('home/search', 'Api\HomeController@search');
	Route::get('home/filters', 'Api\HomeController@getFilters');
	Route::get('home/availability/{id?}', 'Api\HomeController@getAvailability');
    Route::get('home/time-availability/{id?}', 'Api\HomeController@getTimeAvailability');
    Route::get('home/price-realtime/{id?}', 'Api\HomeController@getPriceRealtime');
    Route::get('home/{id?}', 'Api\HomeController@show');
    Route::post('coordinate', 'Api\HomeController@coordinate');
    Route::post('similar_ads', 'Api\HomeController@similar_ads');
    Route::post('getFilterAdsFunc', 'Api\HomeController@getFilterAdsFunc');
    Route::post('getFavAdsFunc', 'Api\HomeController@getFavAdsFunc');
    Route::post('getFavStatusFunc', 'Api\HomeController@getFavStatusFunc');
     Route::post('changeAdsFavStateFunc', 'Api\HomeController@changeAdsFavStateFunc');
     Route::post('getAdvancedSearchFunc', 'Api\HomeController@getAdvancedSearchFunc');
     Route::get('getDmsDays/{id}', 'Api\HomeController@getDmsDaysFunc');
     Route::get('getLocationFunc/{id}', 'Api\HomeController@getLocationFunc');
	//Experience
	Route::get('experience/search', 'Api\ExperienceController@search');
	Route::get('experience/filters', 'Api\ExperienceController@getFilters');
    Route::get('experience/availability/{id?}', 'Api\ExperienceController@getAvailability');
    Route::get('experience/price-realtime/{id?}', 'Api\ExperienceController@getPriceRealtime');
    Route::get('experience/{id?}', 'Api\ExperienceController@show');

    //Car
	Route::get('car/search', 'Api\CarController@search');
	Route::get('car/filters', 'Api\CarController@getFilters');
    Route::get('car/availability/{id?}', 'Api\CarController@getAvailability');
    Route::get('car/time-availability/{id?}', 'Api\CarController@getTimeAvailability');
        Route::get('car/price-realtime/{id?}', 'Api\CarController@getPriceRealtime');
    Route::get('car/{id?}', 'Api\CarController@show');

    //Booking
	Route::get('payment-gateways', 'Api\BookingController@getPaymentGateways');
    Route::get('booking-detail/{token_code?}', 'Api\BookingController@getBookingDetail');
Route::get('getBookingHistory', 'Api\BookingController@getBookingHistory');
Route::get('getBookingBill', 'Api\BookingController@getBookingBill');
Route::post('SendGift', 'Api\BookingController@SendGift');
Route::post('addCoupon', 'Api\BookingController@addCoupon');
    //Comment
	Route::get('reviews', 'Api\CommentController@getReviews');
Route::get('status_role/{id}', 'Api\UserController@status_role');
	//Other data
	Route::get('countries', 'Api\OtherController@getCountries');
});

Route::group([], function () {
    // Auth
    Route::post('auth/register', 'Api\UserController@register');
    Route::post('auth/login', 'Api\UserController@login');
    Route::post('auth/otp/request', 'Api\UserController@SendCode');
    Route::post('auth/otp/verify', 'Api\UserController@verifie');
    Route::post('auth/logout', 'Api\UserController@logout')->middleware('api_token');

    // Properties
    Route::get('properties', 'Api\PropertyController@index');
    Route::get('properties/{id}', 'Api\PropertyController@show');
    Route::get('properties/{id}/availability', 'Api\PropertyController@availability');
    Route::get('properties/{id}/reviews', 'Api\PropertyController@reviews');
    Route::get('properties/{id}/amenities', 'Api\PropertyController@amenities');

    // Mobile Services
    Route::get('mobile/services', 'Api\Mobile\ServicesController@index')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/chalets', 'Api\Mobile\ChaletsController@index')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/chalets/{id}', 'Api\Mobile\ChaletsController@show')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/ads', 'Api\Mobile\ChaletsController@ads')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/ads/{id}', 'Api\Mobile\ChaletsController@showAd')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/experiences', 'Api\Mobile\ExperiencesController@index')->middleware(['api_token', 'throttle:60,1']);
    Route::get('mobile/experiences/{id}', 'Api\Mobile\ExperiencesController@show')->middleware(['api_token', 'throttle:60,1']);

    // Bookings
    Route::post('bookings/quote', 'Api\BookingController@quote');
    Route::post('bookings', 'Api\BookingController@store')->middleware('api_token');
    Route::get('bookings/my', 'Api\BookingController@my')->middleware('api_token');
    Route::post('bookings/{id}/cancel', 'Api\BookingController@cancel')->middleware('api_token');

    // Payments
    Route::post('payments/intent', 'Api\PaymentController@intent')->middleware('api_token');
    Route::post('payments/checkout', 'Api\PaymentController@checkout')->middleware('api_token');
    Route::post('payments/webhook', 'Api\PaymentController@webhook');
    Route::post('finance/payments/webhook/{gateway}', '\App\Http\Controllers\Api\V1\FinanceController@webhook');

    // Favorites + Notifications
    Route::post('favorites/{propertyId}', 'Api\FavoriteController@toggle')->middleware('api_token');
    Route::get('favorites', 'Api\FavoriteController@index')->middleware('api_token');
    Route::get('notifications', 'Api\NotificationController@index')->middleware('api_token');

    // Settings + Account
    Route::get('settings/account', 'Api\SettingsController@account')->middleware('api_token');
    Route::get('settings/legal', 'Api\SettingsController@legal');
    Route::get('settings/help', 'Api\SettingsController@help');
    Route::get('settings/privacy', 'Api\SettingsController@privacy')->middleware('api_token');
    Route::patch('settings/privacy/{key}', 'Api\SettingsController@updatePrivacy')->middleware('api_token');
    Route::post('settings/privacy/request-data', 'Api\SettingsController@requestData')->middleware('api_token');
    Route::delete('account', 'Api\SettingsController@requestAccountDeletion')->middleware('api_token');

    // Cohost + Referral
    Route::get('cohosts', 'Api\CohostController@search');
    Route::post('cohosts/notify', 'Api\CohostController@notify');
    Route::get('referrals/host', 'Api\ReferralController@hostProgram');
});
