<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LabayhSeeder extends Seeder
{
    private $mediaIds = [];
    private $userIds = [];
    private $taxonomies = [];
    private $termsByTax = [];

    public function run()
    {
        $this->truncateForDemo();
        $this->seedMedia();
        $this->seedUserProfiles();
        $this->seedTerms();

        $homeIds = $this->seedHomes();
        $experienceIds = $this->seedExperiences();
        $carIds = $this->seedCars();

        $this->seedPrices($homeIds, $experienceIds, $carIds);
        $this->seedAvailability($homeIds, $experienceIds);
        $this->seedComments(array_merge($homeIds, $experienceIds, $carIds));
    }

    private function truncateForDemo()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $tables = [
            'comments',
            'home_availability',
            'experience_availability',
            'home_price',
            'experience_price',
            'car_price',
            'home',
            'experience',
            'car',
            'term_relation',
            'term',
            'media',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function seedMedia()
    {
        $authorId = $this->firstUserId();
        $paths = [
            'public/sta.png',
            'public/special.png',
            'public/map.caeeab2f.png',
            'public/installer/img/background.png',
            'public/assets/img/favicon-32x32.png',
        ];

        foreach ($paths as $path) {
            $fullPath = base_path($path);
            if (!file_exists($fullPath)) {
                continue;
            }
            $name = pathinfo($path, PATHINFO_FILENAME);
            $ext = pathinfo($path, PATHINFO_EXTENSION);
            $id = DB::table('media')->insertGetId([
                'media_title' => $name,
                'media_name' => $name,
                'media_url' => $path,
                'media_path' => $path,
                'media_description' => $name,
                'media_size' => filesize($fullPath),
                'media_type' => $ext,
                'author' => $authorId,
                'created_at' => time(),
            ]);
            $this->mediaIds[] = $id;
        }
    }

    private function seedUserProfiles()
    {
        $this->userIds = DB::table('users')->pluck('id')->toArray();
        if (empty($this->userIds)) {
            return;
        }

        $names = [
            ['first' => 'Mesut', 'last' => ''],
            ['first' => 'نورة', 'last' => 'العتيبي'],
            ['first' => 'سلمان', 'last' => 'الشمري'],
            ['first' => 'لينا', 'last' => 'الزهراني'],
            ['first' => 'خالد', 'last' => 'العنزي'],
            ['first' => 'ريم', 'last' => 'الزيد'],
        ];

        foreach ($this->userIds as $index => $userId) {
            $name = $names[$index % count($names)];
            DB::table('users')->where('id', $userId)->update([
                'first_name' => $name['first'],
                'last_name' => $name['last'],
                'avatar' => $this->mediaIds[$index % max(1, count($this->mediaIds))] ?? null,
                'description' => 'مضيف متميز يهتم بالتفاصيل ويقدم تجربة ضيافة رائعة.',
            ]);
        }
    }

    private function seedTerms()
    {
        $this->taxonomies = DB::table('taxonomy')->pluck('taxonomy_id', 'taxonomy_name')->toArray();

        $this->seedTermsForTax('home-type', [
            ['شقة', 'apartment'],
            ['فيلا', 'villa'],
            ['شاليه', 'chalet'],
            ['منتجع', 'resort'],
        ]);

        $this->seedTermsForTax('home-amenity', [
            ['واي فاي', 'wifi', 'wifi'],
            ['مطبخ', 'kitchen', 'kitchen'],
            ['موقف سيارات مجاني', 'parking', 'parking'],
            ['مساحة عمل مخصصة', 'workspace', 'work'],
            ['كاميرات خارجية', 'camera', 'camera'],
            ['تكييف', 'ac', 'ac_unit'],
            ['غسالة', 'washer', 'local_laundry_service'],
            ['تلفزيون', 'tv', 'tv'],
            ['شرفة', 'balcony', 'balcony'],
            ['مصعد', 'elevator', 'elevator'],
            ['مسبح', 'pool', 'pool'],
            ['مناسب للأطفال', 'kids', 'child_friendly'],
            ['مدخل خاص', 'private', 'door'],
            ['حارس أمن', 'security', 'shield'],
            ['إطلالة مميزة', 'view', 'landscape'],
            ['قهوة وشاي', 'coffee', 'local_cafe'],
            ['صالة رياضية', 'gym', 'fitness_center'],
            ['حديقة', 'garden', 'park'],
            ['إضاءة ليلية', 'lights', 'light'],
            ['معدات شواء', 'bbq', 'outdoor_grill'],
        ]);

        $this->seedTermsForTax('experience-type', [
            ['مغامرات', 'adventure'],
            ['ثقافة', 'culture'],
            ['طعام', 'food'],
            ['طبيعة', 'nature'],
        ]);

        $this->seedTermsForTax('experience-inclusions', [
            ['دليل محلي', 'guide', 'person'],
            ['معدات كاملة', 'equipment', 'build'],
            ['وجبة خفيفة', 'snack', 'restaurant'],
            ['مواصلات داخلية', 'transport', 'directions_car'],
            ['صور تذكارية', 'photos', 'camera_alt'],
            ['مياه مجانية', 'water', 'local_drink'],
            ['تأمين', 'insurance', 'shield'],
            ['جلسة تعريفية', 'briefing', 'info'],
        ]);

        $this->seedTermsForTax('car-type', [
            ['اقتصادية', 'economy'],
            ['عائلية', 'family'],
            ['فاخرة', 'luxury'],
        ]);

        $this->seedTermsForTax('car-feature', [
            ['سائق خاص', 'driver', 'person'],
            ['واي فاي', 'wifi', 'wifi'],
            ['مقاعد أطفال', 'child-seat', 'child_care'],
            ['تكييف', 'ac', 'ac_unit'],
            ['مقاعد جلد', 'leather', 'event_seat'],
            ['نظام ملاحة', 'gps', 'map'],
            ['شحن USB', 'usb', 'usb'],
            ['تسليم للموقع', 'delivery', 'room_service'],
        ]);
    }

    private function seedTermsForTax($taxonomyName, array $terms)
    {
        if (empty($this->taxonomies[$taxonomyName])) {
            return;
        }
        $taxonomyId = $this->taxonomies[$taxonomyName];
        $authorId = $this->firstUserId();
        foreach ($terms as $term) {
            $title = $term[0];
            $slug = $term[1];
            $icon = $term[2] ?? '';
            $imageId = $this->mediaIds[0] ?? null;
            $id = DB::table('term')->insertGetId([
                'term_title' => $title,
                'term_name' => $slug,
                'term_description' => $title,
                'term_icon' => $icon,
                'term_image' => $imageId,
                'taxonomy_id' => $taxonomyId,
                'author' => $authorId,
                'created_at' => time(),
            ]);
            $this->termsByTax[$taxonomyName][] = $id;
        }
    }

    private function seedHomes()
    {
        $titles = [
            'إطلالة على برج خليفة والنافورة | وصول مباشر إلى المول',
            'شقة فاخرة بإطلالة بحرية',
            'فيلا بحديقة خاصة',
            'شاليه على البحر',
            'استراحة مع مسبح خاص',
            'بيت تراثي بإطلالة جبلية',
            'شقة عائلية وسط المدينة',
            'جناح أنيق بالقرب من الكورنيش',
            'شقة حديثة مع شرفة',
            'بيت ريفي هادئ',
            'شقة بإطلالة على الحديقة',
            'استوديو عصري في قلب المدينة',
        ];
        $cities = ['الرياض', 'جدة', 'الدمام', 'دبي', 'أبوظبي', 'الخبر'];
        $countries = ['المملكة العربية السعودية', 'الإمارات العربية المتحدة'];
        $homeIds = [];

        foreach ($titles as $index => $title) {
            $city = $cities[$index % count($cities)];
            $country = in_array($city, ['دبي', 'أبوظبي'], true) ? $countries[1] : $countries[0];
            $authorId = $this->userIds[$index % max(1, count($this->userIds))] ?? $this->firstUserId();
            $gallery = $this->galleryCsv(3);
            $thumbnailId = $this->mediaIds[$index % max(1, count($this->mediaIds))] ?? null;
            $amenityIds = $this->pickIds($this->termsByTax['home-amenity'] ?? [], 6);
            $amenities = $this->idsToCsv($amenityIds);
            $homeTypeIds = $this->pickIds($this->termsByTax['home-type'] ?? [], 1);
            $homeType = $this->idsToCsv($homeTypeIds);

            $data = [
                'post_title' => $title,
                'post_slug' => 'home-' . ($index + 1),
                'post_content' => 'تجربة إقامة مميزة مع تفاصيل راقية وخدمات متكاملة.',
                'post_description' => 'سكن مريح بموقع ممتاز وقريب من أهم المعالم.',
                'author' => $authorId,
                'created_at' => time(),
                'location_lat' => $this->randomLat($city),
                'location_lng' => $this->randomLng($city),
                'location_address' => 'حي مميز، شارع رئيسي',
                'location_city' => $city,
                'location_country' => $country,
                'gallery' => $gallery,
                'thumbnail_id' => $thumbnailId,
                'number_of_guest' => rand(2, 6),
                'number_of_bedrooms' => rand(1, 3),
                'number_of_bathrooms' => rand(1, 3),
                'booking_type' => 'per_night',
                'base_price' => rand(250, 900),
                'weekend_price' => rand(300, 1200),
                'amenities' => $amenities,
                'home_type' => $homeType,
                'enable_cancellation' => 'on',
                'cancel_before' => rand(2, 7),
                'cancellation_detail' => 'إلغاء مجاني قبل الموعد وفق السياسة المعلنة.',
                'checkin_time' => '3:00 PM',
                'checkout_time' => '11:00 AM',
                'rating' => $index === 0 ? 4.9 : round(rand(35, 50) / 10, 1),
                'is_featured' => $index < 3 ? 'on' : 'off',
                'status' => 'publish',
            ];

            if (Schema::hasColumn('home', 'post_type')) {
                $data['post_type'] = 'home';
            }

            $id = DB::table('home')->insertGetId($data);
            $this->assignTerms($id, 'home', array_merge($amenityIds, $homeTypeIds));
            $homeIds[] = $id;
        }

        return $homeIds;
    }

    private function seedExperiences()
    {
        $titles = [
            'تجربة قيادة صحراوية',
            'جولة في المدينة القديمة',
            'تجربة طهي سعودية',
            'رحلة بحرية عند الغروب',
            'ورشة تصوير فوتوغرافي',
            'جولة فنية في المعارض',
            'تجربة تسلق جبلي',
            'جولة مزارع محلية',
        ];
        $cities = ['الرياض', 'جدة', 'الدمام', 'دبي', 'أبوظبي', 'الخبر'];
        $countries = ['المملكة العربية السعودية', 'الإمارات العربية المتحدة'];
        $experienceIds = [];

        foreach ($titles as $index => $title) {
            $city = $cities[$index % count($cities)];
            $country = in_array($city, ['دبي', 'أبوظبي'], true) ? $countries[1] : $countries[0];
            $authorId = $this->userIds[$index % max(1, count($this->userIds))] ?? $this->firstUserId();
            $gallery = $this->galleryCsv(3);
            $thumbnailId = $this->mediaIds[$index % max(1, count($this->mediaIds))] ?? null;
            $inclusionIds = $this->pickIds($this->termsByTax['experience-inclusions'] ?? [], 4);
            $inclusions = $this->idsToCsv($inclusionIds);
            $experienceTypeIds = $this->pickIds($this->termsByTax['experience-type'] ?? [], 1);
            $experienceType = $this->idsToCsv($experienceTypeIds);

            $data = [
                'post_title' => $title,
                'post_slug' => 'experience-' . ($index + 1),
                'post_content' => 'تجربة فريدة يقودها مرشد محلي مع تفاصيل ممتعة.',
                'post_description' => 'استمتع بوقت رائع وخدمات متكاملة.',
                'author' => $authorId,
                'created_at' => time(),
                'location_lat' => $this->randomLat($city),
                'location_lng' => $this->randomLng($city),
                'location_address' => 'نقطة اللقاء في مركز المدينة',
                'location_city' => $city,
                'location_country' => $country,
                'gallery' => $gallery,
                'thumbnail_id' => $thumbnailId,
                'number_of_guest' => rand(4, 12),
                'booking_type' => 'per_night',
                'booking_form' => 'instant',
                'base_price' => rand(120, 400),
                'adult_price' => rand(120, 300),
                'child_price' => rand(60, 150),
                'infant_price' => rand(30, 80),
                'durations' => '3 ساعات',
                'inclusions' => $inclusions,
                'exclusions' => '',
                'amenities' => $inclusions,
                'experience_type' => $experienceType,
                'enable_cancellation' => 'on',
                'cancel_before' => rand(1, 5),
                'cancellation_detail' => 'الإلغاء حسب سياسة التجربة.',
                'rating' => round(rand(35, 50) / 10, 1),
                'is_featured' => $index < 2 ? 'on' : 'off',
                'status' => 'publish',
            ];

            if (Schema::hasColumn('experience', 'post_type')) {
                $data['post_type'] = 'experience';
            }

            $id = DB::table('experience')->insertGetId($data);
            $this->assignTerms($id, 'experience', array_merge($inclusionIds, $experienceTypeIds));
            $experienceIds[] = $id;
        }

        return $experienceIds;
    }

    private function seedCars()
    {
        $titles = [
            'خدمة استقبال خاصة',
            'تنظيف عميق للموقع',
            'إعداد وجبة خاصة في الموقع',
            'تنسيق الزهور والديكور',
            'نقل خاص من وإلى المطار',
            'خدمة غسيل وكي',
            'مساعد افتراضي للمضيفين',
            'تصوير احترافي للإعلان',
        ];
        $cities = ['الرياض', 'جدة', 'الدمام', 'دبي', 'أبوظبي', 'الخبر'];
        $countries = ['المملكة العربية السعودية', 'الإمارات العربية المتحدة'];
        $carIds = [];

        foreach ($titles as $index => $title) {
            $city = $cities[$index % count($cities)];
            $country = in_array($city, ['دبي', 'أبوظبي'], true) ? $countries[1] : $countries[0];
            $authorId = $this->userIds[$index % max(1, count($this->userIds))] ?? $this->firstUserId();
            $gallery = $this->galleryCsv(2);
            $thumbnailId = $this->mediaIds[$index % max(1, count($this->mediaIds))] ?? null;
            $featureIds = $this->pickIds($this->termsByTax['car-feature'] ?? [], 3);
            $features = $this->idsToCsv($featureIds);
            $carTypeIds = $this->pickIds($this->termsByTax['car-type'] ?? [], 1);
            $carType = $this->idsToCsv($carTypeIds);

            $data = [
                'post_title' => $title,
                'post_slug' => 'service-' . ($index + 1),
                'post_content' => 'خدمة احترافية بتفاصيل دقيقة وتنفيذ سريع.',
                'post_description' => 'خدمة موثوقة مع مزايا متعددة.',
                'author' => $authorId,
                'created_at' => time(),
                'location_lat' => $this->randomLat($city),
                'location_lng' => $this->randomLng($city),
                'location_address' => 'موقع الخدمة داخل المدينة',
                'location_city' => $city,
                'location_country' => $country,
                'gallery' => $gallery,
                'thumbnail_id' => $thumbnailId,
                'quantity' => 1,
                'car_type' => $carType,
                'features' => $features,
                'booking_form' => 'instant',
                'base_price' => rand(150, 500),
                'enable_cancellation' => 'on',
                'cancel_before' => rand(1, 3),
                'cancellation_detail' => 'يمكن الإلغاء قبل الموعد المحدد.',
                'rating' => round(rand(35, 50) / 10, 1),
                'is_featured' => $index < 2 ? 'on' : 'off',
                'passenger' => rand(1, 4),
                'gear_shift' => 'أوتوماتيك',
                'baggage' => rand(1, 4),
                'door' => rand(2, 4),
                'status' => 'publish',
            ];

            if (Schema::hasColumn('car', 'post_type')) {
                $data['post_type'] = 'car';
            }

            $id = DB::table('car')->insertGetId($data);
            $this->assignTerms($id, 'car', array_merge($featureIds, $carTypeIds));
            $carIds[] = $id;
        }

        return $carIds;
    }

    private function seedPrices(array $homeIds, array $experienceIds, array $carIds)
    {
        $now = time();
        $end = strtotime('+30 days', $now);

        foreach ($homeIds as $homeId) {
            DB::table('home_price')->insert([
                'home_id' => $homeId,
                'start_time' => $now,
                'end_time' => $end,
                'price' => rand(250, 900),
                'available' => 'on',
            ]);
        }

        foreach ($experienceIds as $experienceId) {
            DB::table('experience_price')->insert([
                'experience_id' => $experienceId,
                'start_time' => $now,
                'end_time' => $end,
                'start_date' => $now,
                'end_date' => $end,
                'max_people' => rand(6, 20),
                'adult_price' => rand(120, 300),
                'child_price' => rand(60, 150),
                'infant_price' => rand(30, 80),
            ]);
        }

        foreach ($carIds as $carId) {
            DB::table('car_price')->insert([
                'car_id' => $carId,
                'start_date' => $now,
                'end_date' => $end,
                'price' => rand(150, 500),
                'available' => 'on',
            ]);
        }
    }

    private function seedAvailability(array $homeIds, array $experienceIds)
    {
        foreach ($homeIds as $homeId) {
            $start = strtotime('+7 days');
            $end = strtotime('+9 days');
            DB::table('home_availability')->insert([
                'home_id' => $homeId,
                'booking_id' => 0,
                'start_time' => $start,
                'end_time' => $end,
                'start_date' => $start,
                'end_date' => $end,
                'total_minutes' => 1440,
            ]);
        }

        foreach ($experienceIds as $experienceId) {
            $date = strtotime('+5 days');
            DB::table('experience_availability')->insert([
                'experience_id' => $experienceId,
                'date' => $date,
                'status' => 'unavailable',
            ]);
        }
    }

    private function seedComments(array $postIds)
    {
        if (empty($this->userIds) || empty($postIds)) {
            return;
        }

        $comments = [
            'مكان رائع ونظيف جدًا.',
            'تجربة ممتازة وسهلة الحجز.',
            'المضيف متعاون ويستجيب بسرعة.',
            'موقع مميز وقريب من الخدمات.',
            'سأكرر التجربة بالتأكيد.',
        ];

        foreach ($postIds as $postId) {
            for ($i = 0; $i < 6; $i++) {
                $authorId = $this->userIds[array_rand($this->userIds)];
                DB::table('comments')->insert([
                    'post_id' => $postId,
                    'comment_title' => '',
                    'comment_content' => $comments[array_rand($comments)],
                    'comment_name' => get_username($authorId) ?: 'ضيف',
                    'comment_email' => 'guest' . rand(100, 999) . '@example.com',
                    'comment_author' => $authorId,
                    'comment_rate' => rand(4, 5),
                    'post_type' => $this->resolvePostType($postId),
                    'parent' => 0,
                    'status' => 'publish',
                    'created_at' => time() - rand(1, 120) * 86400,
                ]);
            }
        }
    }

    private function resolvePostType($postId)
    {
        if (DB::table('home')->where('post_id', $postId)->exists()) {
            return 'home';
        }
        if (DB::table('experience')->where('post_id', $postId)->exists()) {
            return 'experience';
        }
        return 'car';
    }

    private function galleryCsv($count)
    {
        if (empty($this->mediaIds)) {
            return '';
        }
        $count = min($count, count($this->mediaIds));
        $ids = $this->mediaIds;
        shuffle($ids);
        return implode(',', array_slice($ids, 0, $count));
    }

    private function pickIds(array $ids, $count)
    {
        if (empty($ids)) {
            return [];
        }
        $count = min($count, count($ids));
        $keys = array_rand($ids, $count);
        if (!is_array($keys)) {
            $keys = [$keys];
        }
        $selected = [];
        foreach ($keys as $key) {
            $selected[] = $ids[$key];
        }
        return $selected;
    }

    private function idsToCsv(array $ids)
    {
        return empty($ids) ? '' : implode(',', $ids);
    }

    private function assignTerms($serviceId, $postType, array $termIds)
    {
        if (empty($termIds)) {
            return;
        }
        foreach ($termIds as $termId) {
            DB::table('term_relation')->insert([
                'term_id' => $termId,
                'service_id' => $serviceId,
                'post_type' => $postType,
            ]);
        }
    }

    private function randomLat($city)
    {
        $map = [
            'الرياض' => 24.7136,
            'جدة' => 21.4858,
            'الدمام' => 26.4207,
            'دبي' => 25.2048,
            'أبوظبي' => 24.4539,
            'الخبر' => 26.2172,
        ];
        return $map[$city] ?? 24.7136;
    }

    private function randomLng($city)
    {
        $map = [
            'الرياض' => 46.6753,
            'جدة' => 39.1925,
            'الدمام' => 50.0888,
            'دبي' => 55.2708,
            'أبوظبي' => 54.3773,
            'الخبر' => 50.1971,
        ];
        return $map[$city] ?? 46.6753;
    }

    private function firstUserId()
    {
        if (!empty($this->userIds)) {
            return $this->userIds[0];
        }
        $first = DB::table('users')->select('id')->first();
        return $first ? $first->id : 1;
    }
}
