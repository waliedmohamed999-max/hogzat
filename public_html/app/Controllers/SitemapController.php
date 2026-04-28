<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class SitemapController extends Controller
{

    public function _siteMapCompressSave(Request $request)
    {
        $sitemap_per_page = $request->get('sitemap_per_page', '10');
        $sitemap_home_enable = $request->get('sitemap_home_enable', 'off');
        $sitemap_car_enable = $request->get('sitemap_car_enable', 'off');
        $sitemap_experience_enable = $request->get('sitemap_experience_enable', 'off');
        $sitemap_post_enable = $request->get('sitemap_post_enable', 'off');
        $sitemap_page_enable = $request->get('sitemap_page_enable', 'off');
        update_opt('sitemap_per_page', $sitemap_per_page);
        update_opt('sitemap_home_enable', $sitemap_home_enable);
        update_opt('sitemap_car_enable', $sitemap_car_enable);
        update_opt('sitemap_experience_enable', $sitemap_experience_enable);
        update_opt('sitemap_post_enable', $sitemap_post_enable);
        update_opt('sitemap_page_enable', $sitemap_page_enable);

        return $this->sendJson([
            'status' => 1,
            'title' => __('System Alert'),
            'message' => __('Saved Successfully'),
            'reload' => false
        ]);
    }

    public function _siteMapCompress(Request $request)
    {
        return view('dashboard.screens.administrator.site-map');
    }

    public function _createSitemapIndex()
    {
        $xml = Cache::remember('sitemap.index', now()->addMinutes(1), function () {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $sitemap_per_page = sitemap_per_page();
            $now = Carbon::now();

            if (get_opt('sitemap_post_enable', 'on') == 'on') {
                $number_post = DB::table('post')->count();
                if ($number_post > $sitemap_per_page) {
                    $max_post_pages = (int)ceil($number_post / $sitemap_per_page);
                    for ($i = 1; $i <= $max_post_pages; $i++) {
                        $sitemap->add(
                            \Spatie\Sitemap\Tags\Url::create(url('post-' . $i . '.xml'))
                                ->setLastModificationDate($now)
                                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                                ->setPriority(1.0)
                        );
                    }
                } else {
                    $sitemap->add(
                        \Spatie\Sitemap\Tags\Url::create(url('post.xml'))
                            ->setLastModificationDate($now)
                            ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                            ->setPriority(1.0)
                    );
                }
            }

            if (get_opt('sitemap_page_enable', 'on') == 'on') {
                $number_page = DB::table('page')->count();
                if ($number_page <= $sitemap_per_page) {
                    $sitemap->add(
                        \Spatie\Sitemap\Tags\Url::create(url('page.xml'))
                            ->setLastModificationDate($now)
                            ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                            ->setPriority(1.0)
                    );
                } else {
                    $max_page_pages = (int)ceil($number_page / $sitemap_per_page);
                    for ($i = 1; $i <= $max_page_pages; $i++) {
                        $sitemap->add(
                            \Spatie\Sitemap\Tags\Url::create(url('page-' . $i . '.xml'))
                                ->setLastModificationDate($now)
                                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                                ->setPriority(1.0)
                        );
                    }
                }
            }

            $list_services = get_posttypes(true);
            foreach ($list_services as $key => $service) {
                $enable_service = get_option('enable_' . $key, 'off');
                $stm_enable_service = get_opt('sitemap_' . $key . '_enable', 'on');
                if ($enable_service == 'on' && $stm_enable_service == 'on') {
                    $number_service = DB::table($key)->count();
                    if ($number_service > $sitemap_per_page) {
                        $max_service_pages = (int)ceil($number_service / $sitemap_per_page);
                        for ($i = 1; $i <= $max_service_pages; $i++) {
                            $sitemap->add(
                                \Spatie\Sitemap\Tags\Url::create(url($key . '-' . $i . '.xml'))
                                    ->setLastModificationDate($now)
                                    ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                                    ->setPriority(1.0)
                            );
                        }
                    } else {
                        $sitemap->add(
                            \Spatie\Sitemap\Tags\Url::create(url($key . '.xml'))
                                ->setLastModificationDate($now)
                                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                                ->setPriority(1.0)
                        );
                    }
                }
            }

            $list_page = Config::get('awebooking.pages_name');
            foreach ($list_page as $page) {
                if ($page['sitemap'] == true) {
                    $sitemap->add(
                        \Spatie\Sitemap\Tags\Url::create(url($page['screen']))
                            ->setLastModificationDate($now)
                            ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                            ->setPriority(1.0)
                    );
                }
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function _createSitemapPost(Request $request, $page = 1)
    {
        $cacheKey = 'sitemap.post.' . $page;
        $xml = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($page) {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $posts = DB::table('post')->orderBy('created_at', 'desc');
            $sitemap_per_page = sitemap_per_page();
            $offset = ($page - 1) * $sitemap_per_page;
            $posts = $posts->limit($sitemap_per_page)->offset($offset)->get();

            foreach ($posts as $post) {
                $url = get_the_permalink($post->post_id, $post->post_slug, '', 'post');
                $sitemap->add(
                    \Spatie\Sitemap\Tags\Url::create($url)
                        ->setLastModificationDate(Carbon::parse($post->created_at))
                        ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(1.0)
                );
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function _createSitemapHome(Request $request, $page = 1)
    {
        $cacheKey = 'sitemap.home.' . $page;
        $xml = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($page) {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $posts = DB::table('home')->orderBy('created_at', 'desc');
            $sitemap_per_page = sitemap_per_page();
            $offset = ($page - 1) * $sitemap_per_page;
            $posts = $posts->limit($sitemap_per_page)->offset($offset)->get();

            foreach ($posts as $post) {
                $url = get_the_permalink($post->post_id, $post->post_slug, 'home');
                $sitemap->add(
                    \Spatie\Sitemap\Tags\Url::create($url)
                        ->setLastModificationDate(Carbon::parse($post->created_at))
                        ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(1.0)
                );
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function _createSitemapCar(Request $request, $page = 1)
    {
        $cacheKey = 'sitemap.car.' . $page;
        $xml = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($page) {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $posts = DB::table('car')->orderBy('created_at', 'desc');
            $sitemap_per_page = sitemap_per_page();
            $offset = ($page - 1) * $sitemap_per_page;
            $posts = $posts->limit($sitemap_per_page)->offset($offset)->get();

            foreach ($posts as $post) {
                $url = get_the_permalink($post->post_id, $post->post_slug, 'car');
                $sitemap->add(
                    \Spatie\Sitemap\Tags\Url::create($url)
                        ->setLastModificationDate(Carbon::parse($post->created_at))
                        ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(1.0)
                );
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function _createSitemapExperience(Request $request, $page = 1)
    {
        $cacheKey = 'sitemap.experience.' . $page;
        $xml = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($page) {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $posts = DB::table('experience')->orderBy('created_at', 'desc');
            $sitemap_per_page = sitemap_per_page();
            $offset = ($page - 1) * $sitemap_per_page;
            $posts = $posts->limit($sitemap_per_page)->offset($offset)->get();

            foreach ($posts as $post) {
                $url = get_the_permalink($post->post_id, $post->post_slug, 'experience');
                $sitemap->add(
                    \Spatie\Sitemap\Tags\Url::create($url)
                        ->setLastModificationDate(Carbon::parse($post->created_at))
                        ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(1.0)
                );
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function _createSitemapPage(Request $request, $page = 1)
    {
        $cacheKey = 'sitemap.page.' . $page;
        $xml = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($page) {
            $sitemap = \Spatie\Sitemap\Sitemap::create();
            $posts = DB::table('page')->orderBy('created_at', 'desc');
            $sitemap_per_page = sitemap_per_page();
            $offset = ($page - 1) * $sitemap_per_page;
            $posts = $posts->limit($sitemap_per_page)->offset($offset)->get();

            foreach ($posts as $post) {
                $url = get_the_permalink($post->post_id, $post->post_slug, 'page');
                $sitemap->add(
                    \Spatie\Sitemap\Tags\Url::create($url)
                        ->setLastModificationDate(Carbon::parse($post->created_at))
                        ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(1.0)
                );
            }

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
