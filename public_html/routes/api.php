<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    // Auth
    Route::post('auth/login', '\App\Controllers\Api\UserController@login');
    Route::post('auth/register', '\App\Controllers\Api\UserController@register');
    Route::get('auth/me', '\App\Http\Controllers\Api\V1\AuthController@me')->middleware('api_token');

    // Products
    Route::get('products', '\App\Http\Controllers\Api\V1\ProductController@index');
    Route::get('products/{id}', '\App\Http\Controllers\Api\V1\ProductController@show');
    Route::get('products/{id}/reviews', '\App\Http\Controllers\Api\V1\ProductController@reviews');
    Route::get('products/{id}/availability', '\App\Http\Controllers\Api\V1\ProductController@availability');
    Route::get('products/{id}/amenities', '\App\Http\Controllers\Api\V1\ProductController@amenities');
    Route::get('products/{id}/rooms', '\App\Http\Controllers\Api\V1\ProductController@rooms');

    // Promotions
    Route::get('promotions/featured', '\App\Http\Controllers\Api\V1\PromotionController@featured');
    Route::get('promotions/sponsored', '\App\Http\Controllers\Api\V1\PromotionController@sponsored');

    // Bookings
    Route::post('bookings/quote', '\App\Http\Controllers\Api\V1\BookingController@quote');
    Route::post('bookings', '\App\Http\Controllers\Api\V1\BookingController@store')->middleware('api_token');
    Route::get('bookings/my', '\App\Http\Controllers\Api\V1\BookingController@my')->middleware('api_token');
    Route::post('bookings/{id}/cancel', '\App\Http\Controllers\Api\V1\BookingController@cancel')->middleware('api_token');
    Route::post('finance/payments/webhook/{gateway}', '\App\Http\Controllers\Api\V1\FinanceController@webhook');
});

// Load AweBooking API routes for the app/dashboard.
$aweApiRoutes = app_path('Routes/api.php');
if (file_exists($aweApiRoutes)) {
    require $aweApiRoutes;
}
