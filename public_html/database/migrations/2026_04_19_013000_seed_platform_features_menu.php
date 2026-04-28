<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedPlatformFeaturesMenu extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('menu') || !Schema::hasTable('menu_structure')) {
            return;
        }

        $now = (string) time();

        $menu = DB::table('menu')
            ->where('menu_position', 'platform-features')
            ->orWhere('menu_key', 'platform-features')
            ->orderBy('menu_id')
            ->first();

        if ($menu) {
            $menuId = $menu->menu_id;
            DB::table('menu')->where('menu_id', $menuId)->update($this->filterColumns('menu', [
                'menu_title' => 'مزايا المنصة',
                'menu_key' => 'platform-features',
                'menu_position' => 'platform-features',
                'description' => 'كروت مزايا المنصة في الصفحة الرئيسية',
                'is_active' => 1,
                'updated_at' => $now,
            ]));
        } else {
            $menuId = DB::table('menu')->insertGetId($this->filterColumns('menu', [
                'menu_title' => 'مزايا المنصة',
                'menu_key' => 'platform-features',
                'menu_position' => 'platform-features',
                'description' => 'كروت مزايا المنصة في الصفحة الرئيسية',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]), 'menu_id');
        }

        $items = [
            [
                'title' => 'دفع آمن',
                'url' => '#secure-payment',
                'icon' => 'ShieldCheck',
                'description' => 'تجربة دفع واضحة مع جلسات مستخدم موحدة وحماية للبيانات في كل خطوة.',
            ],
            [
                'title' => 'إعلانات موثقة',
                'url' => '#verified-listings',
                'icon' => 'BadgeCheck',
                'description' => 'الصور والأسعار والتوفر تظهر من بيانات النظام مع حالات نشر قابلة للإدارة.',
            ],
            [
                'title' => 'بحث ذكي',
                'url' => '#smart-search',
                'icon' => 'Sparkles',
                'description' => 'فلترة بالمدينة والتاريخ والضيوف والأسعار مع مسارات نتائج مستقرة.',
            ],
            [
                'title' => 'تجربة متكاملة',
                'url' => '#connected-experience',
                'icon' => 'Workflow',
                'description' => 'الواجهة ولوحة التحكم تعملان فوق نفس الربط لضمان اتساق البيانات.',
            ],
            [
                'title' => 'عروض قابلة للتحكم',
                'url' => '#managed-offers',
                'icon' => 'TicketPercent',
                'description' => 'العروض والتمييز والخصومات تظهر من إعدادات المنتج بلا عناصر منفصلة غير مرتبطة.',
            ],
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
                    'type' => 'anchor',
                    'post_id' => '',
                    'post_title' => '',
                    'url' => $item['url'],
                    'route_name' => '',
                    'target' => '_self',
                    'icon' => $item['icon'],
                    'class' => '',
                    'css_class' => '',
                    'target_blank' => 0,
                    'sort_order' => $index,
                    'is_active' => 1,
                    'open_in_new_tab' => 0,
                    'permission_key' => '',
                    'metadata' => json_encode(['description' => $item['description']], JSON_UNESCAPED_UNICODE),
                    'menu_id' => (string) $menuId,
                    'menu_lang' => 'ar',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        });

        Cache::forget('public_menu_platform-features_ar');
        Cache::forget('public_menu_platform-features_en');
        Cache::forget('dashboard_menus_all');
    }

    public function down()
    {
        // Keep platform features menu data intact on rollback.
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
