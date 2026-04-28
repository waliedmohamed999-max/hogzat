<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedHomepageNavigationMenus extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('menu') || !Schema::hasTable('menu_structure')) {
            return;
        }

        $this->syncMenu('hero-quick-links', 'hero-quick-links', 'روابط الهيرو السريعة', 'روابط مختصرة أسفل صندوق البحث في الصفحة الرئيسية', [
            ['title' => 'تجارب مميزة', 'url' => '/experience-search-result'],
            ['title' => 'فعاليات ومؤتمرات', 'url' => '/experience-search-result?category=events'],
            ['title' => 'عروض سريعة', 'url' => '/home-search-result?featured=1'],
        ]);

        $this->syncMenu('home-categories', 'home-categories', 'فئات الصفحة الرئيسية', 'كروت الفئات الظاهرة في الصفحة الرئيسية', [
            ['title' => 'شاليهات وفلل', 'url' => '/home-search-result', 'metadata' => ['icon' => 'BedDouble', 'image_index' => 0]],
            ['title' => 'منتجعات', 'url' => '/home-search-result?category=resorts', 'metadata' => ['icon' => 'Palmtree', 'image_index' => 1]],
            ['title' => 'تجارب سفر', 'url' => '/experience-search-result', 'metadata' => ['icon' => 'Compass', 'image_index' => 2]],
            ['title' => 'رحلات وأنشطة', 'url' => '/experience-search-result?category=activities', 'metadata' => ['icon' => 'Mountain', 'image_index' => 3]],
            ['title' => 'فعاليات ومؤتمرات', 'url' => '/experience-search-result?category=events', 'metadata' => ['icon' => 'Building2', 'image_index' => 4]],
            ['title' => 'جولات ثقافية', 'url' => '/experience-search-result?category=culture', 'metadata' => ['icon' => 'Landmark', 'image_index' => 5]],
        ]);

        $this->syncMenu('app-promo-links', 'app-promo-links', 'روابط قسم التطبيق', 'أزرار الإجراءات في قسم الحساب والداشبورد', [
            ['title' => 'فتح الداشبورد', 'url' => '/dashboard', 'metadata' => ['style' => 'primary']],
            ['title' => 'إدارة الحجوزات', 'url' => '/dashboard/bookings', 'metadata' => ['style' => 'secondary']],
        ]);

        Cache::flush();
    }

    public function down()
    {
        // Keep homepage menu data intact on rollback.
    }

    private function syncMenu(string $key, string $position, string $title, string $description, array $items): void
    {
        $now = (string) time();
        $menu = DB::table('menu')
            ->where('menu_position', $position)
            ->orWhere('menu_key', $key)
            ->orderBy('menu_id')
            ->first();

        if ($menu) {
            $menuId = $menu->menu_id;
            DB::table('menu')->where('menu_id', $menuId)->update($this->filterColumns('menu', [
                'menu_title' => $title,
                'menu_key' => $key,
                'menu_position' => $position,
                'description' => $description,
                'is_active' => 1,
                'updated_at' => $now,
            ]));
        } else {
            $menuId = DB::table('menu')->insertGetId($this->filterColumns('menu', [
                'menu_title' => $title,
                'menu_key' => $key,
                'menu_position' => $position,
                'description' => $description,
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]), 'menu_id');
        }

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
                    'metadata' => json_encode($item['metadata'] ?? [], JSON_UNESCAPED_UNICODE),
                    'menu_id' => (string) $menuId,
                    'menu_lang' => 'ar',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        });
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
