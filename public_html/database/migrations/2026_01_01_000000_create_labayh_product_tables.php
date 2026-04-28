<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLabayhProductTables extends Migration
{
    public function up()
    {
        Schema::create('hosts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('avatar_url')->nullable();
            $table->boolean('is_superhost')->default(false);
            $table->unsignedInteger('response_rate')->default(0);
            $table->string('response_time_label')->default('');
            $table->unsignedInteger('years_hosting')->default(0);
            $table->string('job_title')->nullable();
            $table->string('location_label')->nullable();
            $table->string('badge_label')->nullable();
            $table->string('about_title')->nullable();
            $table->text('about_body')->nullable();
            $table->string('message_button_label')->default('مراسلة المضيف');
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('type');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();
            $table->string('city');
            $table->string('country');
            $table->string('address')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('map_image_url')->nullable();
            $table->string('status')->default('active');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_promoted')->default(false);
            $table->string('property_type_label')->nullable();
            $table->string('guest_favorite_label')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedBigInteger('host_id')->nullable();
            $table->timestamps();

            $table->index(['type', 'city']);
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->string('url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('home_details', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->primary();
            $table->unsignedInteger('guests')->default(1);
            $table->unsignedInteger('bedrooms')->default(0);
            $table->unsignedInteger('beds')->default(0);
            $table->decimal('bathrooms', 3, 1)->default(1);
            $table->string('property_type')->nullable();
            $table->string('space_type')->nullable();
        });

        Schema::create('service_details', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->primary();
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->string('category')->nullable();
            $table->text('inclusions')->nullable();
            $table->text('requirements')->nullable();
        });

        Schema::create('experience_details', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->primary();
            $table->unsignedInteger('duration_minutes')->default(120);
            $table->unsignedInteger('group_size')->default(1);
            $table->string('difficulty')->nullable();
            $table->text('highlights')->nullable();
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name_ar');
            $table->string('icon_key');
            $table->timestamps();
        });

        Schema::create('product_amenities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('amenity_id');
        });

        Schema::create('house_rules', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title_ar');
            $table->string('value_ar')->nullable();
            $table->string('icon_key');
            $table->timestamps();
        });

        Schema::create('product_rules', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('house_rule_id');
        });

        Schema::create('safety_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title_ar');
            $table->string('value_ar')->nullable();
            $table->string('icon_key');
            $table->timestamps();
        });

        Schema::create('product_safety', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('safety_item_id');
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->string('title_ar');
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('room_beds', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('room_id');
            $table->string('bed_type_ar');
            $table->unsignedInteger('count')->default(1);
        });

        Schema::create('cancellation_policies', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name_ar');
            $table->text('summary_ar')->nullable();
            $table->text('details_ar')->nullable();
            $table->json('rules_json')->nullable();
            $table->timestamps();
        });

        Schema::create('product_cancellation', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('cancellation_policy_id');
            $table->date('free_cancel_until')->nullable();
        });

        Schema::create('availability', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->date('date');
            $table->boolean('is_available')->default(true);
            $table->decimal('price_override', 10, 2)->nullable();
        });

        Schema::create('pricing', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('base_price', 10, 2);
            $table->decimal('cleaning_fee', 10, 2)->default(0);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('taxes', 10, 2)->default(0);
            $table->string('currency', 10)->default('SR');
            $table->decimal('weekly_discount', 5, 2)->default(0);
            $table->decimal('monthly_discount', 5, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->date('checkin');
            $table->date('checkout');
            $table->unsignedInteger('guests_count');
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('unpaid');
            $table->string('coupon_code')->nullable();
            $table->timestamps();
        });

        Schema::create('promotions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('type');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('budget', 10, 2)->default(0);
            $table->json('targeting_json')->nullable();
            $table->timestamps();
        });

        Schema::create('product_promotions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('promotion_id');
            $table->unsignedBigInteger('product_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_promotions');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('pricing');
        Schema::dropIfExists('availability');
        Schema::dropIfExists('product_cancellation');
        Schema::dropIfExists('cancellation_policies');
        Schema::dropIfExists('room_beds');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('product_safety');
        Schema::dropIfExists('safety_items');
        Schema::dropIfExists('product_rules');
        Schema::dropIfExists('house_rules');
        Schema::dropIfExists('product_amenities');
        Schema::dropIfExists('amenities');
        Schema::dropIfExists('experience_details');
        Schema::dropIfExists('service_details');
        Schema::dropIfExists('home_details');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('hosts');
    }
}
