<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Indicates whether the XSRF-TOKEN cookie should be set on the response.
     *
     * @var bool
     */
    protected $addHttpCookie = true;

    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '/thank-you',
        'subscribe-email',
        'bridge/v1/session/login',
        'bridge/v1/session/logout',
        'bridge/v1/profile',
        'bridge/v1/profile/password',
        'bridge/v1/wishlist/toggle',
        'bridge/v1/notifications/*/delete',
        'bridge/v1/dashboard/bookings/*/cancel',
        'bridge/v1/dashboard/bookings/*/confirm',
        'bridge/v1/dashboard/services/homes/*/status',
        'bridge/v1/dashboard/services/homes/*/duplicate',
        'bridge/v1/dashboard/services/homes/*/delete',
        'bridge/v1/dashboard/services/homes/editor/*',
        'bridge/v1/dashboard/last-minute/homes/*',
        'bridge/v1/dashboard/services/experiences/*/status',
        'bridge/v1/dashboard/services/experiences/*/duplicate',
        'bridge/v1/dashboard/services/experiences/*/delete',
        'bridge/v1/dashboard/services/experiences/editor/*',
        'bridge/v1/dashboard/media/upload',
        'bridge/v1/dashboard/posts/create',
        'bridge/v1/dashboard/posts/*/status',
        'bridge/v1/dashboard/posts/*/delete',
        'bridge/v1/dashboard/pages/create',
        'bridge/v1/dashboard/pages/*/status',
        'bridge/v1/dashboard/pages/*/delete',
        'bridge/v1/dashboard/media/*/delete',
        'bridge/v1/dashboard/users/*/approve',
        'bridge/v1/dashboard/users/*/delete',
        'bridge/v1/dashboard/coupons/*/status',
        'bridge/v1/dashboard/coupons/*/delete',
        'bridge/v1/dashboard/payouts/*/status',
        'bridge/v1/dashboard/payouts/*/delete',
        'bridge/v1/dashboard/content/posts/editor/*',
        'bridge/v1/dashboard/content/posts/comments/*/status',
        'bridge/v1/dashboard/content/posts/comments/*/delete',
        'bridge/v1/dashboard/content/posts/terms/*',
        'bridge/v1/dashboard/content/posts/terms/*/*/delete',
        'bridge/v1/dashboard/content/pages/editor/*',
        'bridge/v1/dashboard/system-native/settings',
        'bridge/v1/dashboard/system-native/menus',
        'bridge/v1/dashboard/system-native/menus/*/delete',
        'bridge/v1/dashboard/system-native/messages/all',
        'bridge/v1/dashboard/system-native/messages/specific',
        'bridge/v1/dashboard/system-native/languages',
        'bridge/v1/dashboard/system-native/languages/*/status',
        'bridge/v1/dashboard/system-native/languages/*/delete',
        'bridge/v1/dashboard/system-native/languages/order',
        'bridge/v1/dashboard/system-native/translation',
        'bridge/v1/dashboard/system-native/translation/scan',
        'bridge/v1/dashboard/system-native/seo',
        'bridge/v1/dashboard/system-native/api',
        'bridge/v1/dashboard/system-native/tools',
        'bridge/v1/admin/users/*',
        'bridge/v1/admin/partners/*',
        'bridge/v1/admin/partners/*/*',
        'bridge/v1/admin/partners/*/*/*',
        'bridge/v1/admin/permissions',
        'bridge/v1/bookings/complete',
        'bridge/v1/bookings/quote',
    ];
}
