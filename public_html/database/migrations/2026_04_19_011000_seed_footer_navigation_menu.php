<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedFooterNavigationMenu extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('menu') || !Schema::hasTable('menu_structure')) {
            return;
        }

        $now = (string) time();
        $menu = DB::table('menu')
            ->where('menu_position', 'footer')
            ->orWhere('menu_key', 'footer')
            ->orderBy('menu_id')
            ->first();

        if ($menu) {
            $menuId = $menu->menu_id;
            DB::table('menu')->where('menu_id', $menuId)->update($this->filterColumns('menu', [
                'menu_title' => 'الفوتر',
                'menu_key' => 'footer',
                'menu_position' => 'footer',
                'description' => 'روابط الفوتر الظاهرة في واجهة الموقع',
                'is_active' => 1,
                'updated_at' => $now,
            ]));
        } else {
            $menuId = DB::table('menu')->insertGetId($this->filterColumns('menu', [
                'menu_title' => 'الفوتر',
                'menu_key' => 'footer',
                'menu_position' => 'footer',
                'description' => 'روابط الفوتر الظاهرة في واجهة الموقع',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]), 'menu_id');
        }

        $items = [
            ['title' => 'الرئيسية', 'url' => '/', 'group' => 'sections'],
            ['title' => 'الشاليهات والفلل', 'url' => '/home-search-result', 'group' => 'sections'],
            ['title' => 'التجارب', 'url' => '/experience-search-result', 'group' => 'sections'],
            ['title' => 'الفعاليات والمؤتمرات', 'url' => '/experience-search-result?category=events', 'group' => 'sections'],
            ['title' => 'لوحة التحكم', 'url' => '/dashboard', 'group' => 'account'],
            ['title' => 'تسجيل الدخول', 'url' => '/auth/login', 'group' => 'account'],
            ['title' => 'إنشاء حساب', 'url' => '/auth/sign-up', 'group' => 'account'],
            ['title' => 'المدونة', 'url' => '/blog', 'group' => 'account'],
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
                    'type' => 'internal',
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
                    'metadata' => json_encode(['group' => $item['group'], 'synced_from' => 'footer_defaults'], JSON_UNESCAPED_UNICODE),
                    'menu_id' => (string) $menuId,
                    'menu_lang' => 'ar',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        });

        Cache::forget('public_menu_footer_ar');
        Cache::forget('public_menu_footer_en');
        Cache::forget('dashboard_menus_all');
    }

    public function down()
    {
        // Keep footer menu data intact on rollback.
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
