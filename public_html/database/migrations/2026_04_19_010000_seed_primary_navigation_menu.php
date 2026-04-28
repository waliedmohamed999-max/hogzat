<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedPrimaryNavigationMenu extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('menu') || !Schema::hasTable('menu_structure')) {
            return;
        }

        $now = (string) time();

        $menu = DB::table('menu')
            ->where('menu_position', 'primary')
            ->orWhere('menu_key', 'primary')
            ->orderBy('menu_id')
            ->first();

        if ($menu) {
            $menuId = $menu->menu_id;
            DB::table('menu')->where('menu_id', $menuId)->update($this->filterColumns('menu', [
                'menu_title' => 'الرئيسية',
                'menu_key' => 'primary',
                'menu_position' => 'primary',
                'description' => 'قائمة الهيدر الرئيسية في واجهة الموقع',
                'is_active' => 1,
                'updated_at' => $now,
            ]));
        } else {
            $menuId = DB::table('menu')->insertGetId($this->filterColumns('menu', [
                'menu_title' => 'الرئيسية',
                'menu_key' => 'primary',
                'menu_position' => 'primary',
                'description' => 'قائمة الهيدر الرئيسية في واجهة الموقع',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]), 'menu_id');
        }

        $items = [
            ['title' => 'الرئيسية', 'url' => '/', 'type' => 'internal'],
            ['title' => 'إقامات لبية', 'url' => '/home-search-result', 'type' => 'internal'],
            ['title' => 'تجارب مميزة', 'url' => '/experience-search-result', 'type' => 'internal'],
            ['title' => 'فعاليات ومؤتمرات', 'url' => '/experience-search-result?category=events', 'type' => 'internal'],
            ['title' => 'صفقات سريعة', 'url' => '/home-search-result?featured=1', 'type' => 'internal'],
            ['title' => 'المدونة', 'url' => '/blog', 'type' => 'internal'],
            ['title' => 'تواصل معنا', 'url' => '/contact-us', 'type' => 'internal'],
        ];

        DB::transaction(function () use ($menuId, $items, $now) {
            DB::table('menu_structure')->where('menu_id', $menuId)->delete();

            $nextItemId = ((int) DB::table('menu_structure')->max('item_id')) + 1;

            foreach ($items as $index => $item) {
                DB::table('menu_structure')->insert($this->filterColumns('menu_structure', [
                    'item_id' => (string) ($nextItemId + $index),
                    'parent_id' => '0',
                    'depth' => '0',
                    'left' => (string) (($index * 2) + 1),
                    'right' => (string) (($index * 2) + 2),
                    'name' => $item['title'],
                    'type' => $item['type'],
                    'post_id' => '',
                    'post_title' => '',
                    'url' => $item['url'],
                    'route_name' => '',
                    'target' => '_self',
                    'icon' => '',
                    'class' => '',
                    'css_class' => '',
                    'target_blank' => 0,
                    'sort_order' => $index,
                    'is_active' => 1,
                    'open_in_new_tab' => 0,
                    'permission_key' => '',
                    'metadata' => json_encode(['synced_from' => 'frontend_nav'], JSON_UNESCAPED_UNICODE),
                    'menu_id' => (string) $menuId,
                    'menu_lang' => 'ar',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        });

        Cache::forget('public_menu_primary_ar');
        Cache::forget('public_menu_primary_en');
        Cache::forget('dashboard_menus_all');
    }

    public function down()
    {
        // Keep menu data intact on rollback.
    }

    private function filterColumns(string $table, array $payload): array
    {
        return array_filter(
            $payload,
            static fn ($key) => Schema::hasColumn($table, $key),
            ARRAY_FILTER_USE_KEY
        );
    }
}
