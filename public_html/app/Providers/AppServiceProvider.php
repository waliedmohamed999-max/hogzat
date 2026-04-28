<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use App\Services\Finance\FinanceService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {

    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(UrlGenerator $url)
    {
        if (!app()->runningInConsole() && !empty(config('app.url'))) {
            URL::forceRootUrl(rtrim(config('app.url'), '/'));
        }

        if (\App::environment('production_ssl') && !$this->isLocalHttpHost()) {
            $url->forceScheme('https');
        }
        Schema::defaultStringLength(191);
	    $this->loadTranslationsFrom(__DIR__.'/../resources/lang/', 'App');

        if (function_exists('add_action')) {
            add_action('hh_change_booking_status', function ($status, $bookingId) {
                if ($status === 'completed') {
                    app(FinanceService::class)->recordBookingPayment((int)$bookingId, 'completed', 'booking');
                }
            }, 20, 2);

            add_action('hh_after_created_booking', function ($bookingId, $status = 'pending') {
                if ($status === 'completed') {
                    app(FinanceService::class)->recordBookingPayment((int)$bookingId, 'completed', 'booking');
                }
            }, 20, 2);
        }
    }

    protected function isLocalHttpHost(): bool
    {
        $hosts = ['127.0.0.1', 'localhost'];
        $appUrlHost = parse_url(config('app.url'), PHP_URL_HOST);

        if (in_array($appUrlHost, $hosts, true)) {
            return true;
        }

        if (!app()->runningInConsole()) {
            return in_array(Request::getHost(), $hosts, true);
        }

        return false;
    }
}
