<?php

namespace App\Http\Controllers\Api\V1;

use App\Controllers\MediaController as LegacyMediaController;
use App\Http\Controllers\Controller;
use App\Models\ExperienceAvailability;
use App\Models\ExperiencePrice;
use App\Models\Experience;
use App\Models\Home;
use App\Models\HomeAvailability;
use App\Models\HomePrice;
use App\Models\Seo;
use App\Models\TermRelation;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Sentinel;

class ServiceEditorBridgeController extends Controller
{
    public function homeNew()
    {
        $this->requireUser();
        $id = (new Home())->createHome();

        return $this->respondEditor('home', $id, true);
    }

    public function homeShow($id)
    {
        $this->requireUser();

        return $this->respondEditor('home', (int)$id);
    }

    public function homeSave(Request $request, $id)
    {
        $this->requireUser();

        return $this->saveEditor('home', (int)$id, $request);
    }

    public function experienceNew()
    {
        $this->requireUser();
        $id = (new Experience())->createExperience();

        return $this->respondEditor('experience', $id, true);
    }

    public function experienceShow($id)
    {
        $this->requireUser();

        return $this->respondEditor('experience', (int)$id);
    }

    public function experienceSave(Request $request, $id)
    {
        $this->requireUser();

        return $this->saveEditor('experience', (int)$id, $request);
    }

    public function upload(Request $request)
    {
        $this->requireUser();
        $file = $request->file('file');

        if (!$file || !$file->isValid()) {
            return response()->json([
                'status' => 0,
                'message' => __('The uploaded file is invalid'),
            ], 422);
        }

        $mediaId = app(LegacyMediaController::class)->_addMediaApi($file, get_current_user_id());
        $attachment = get_attachment_info($mediaId, 'full');

        return response()->json([
            'status' => 1,
            'data' => [
                'id' => (int)$mediaId,
                'url' => $attachment['url'] ?? '',
                'description' => $attachment['description'] ?? '',
                'type' => $attachment['type'] ?? '',
            ],
        ]);
    }

    private function requireUser()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            throw new HttpResponseException(response()->json([
                'status' => 0,
                'message' => 'Unauthorized',
            ], 401));
        }

        return $user;
    }

    private function respondEditor($type, $id, $created = false)
    {
        $service = $this->authorizedService($type, $id);
        if (!$service) {
            return response()->json([
                'status' => 0,
                'message' => __('This item is not available'),
            ], 404);
        }

        $configKey = $type === 'home' ? 'home_settings' : 'experience_settings';
        $options = Config::get('awebooking.' . $configKey);
        $fields = [];

        foreach ($options['fields'] as $field) {
            $merged = \ThemeOptions::mergeField($field);
            $fields[] = $this->mapFieldForEditor($service, $merged);
        }

        $sections = array_map(function ($section) {
            $section['label'] = $this->translateEditorText((string) ($section['label'] ?? ''));
            return $section;
        }, $options['sections']);
        $sectionIds = array_map(function ($section) {
            return $section['id'] ?? '';
        }, $sections);

        foreach ($options['fields'] as $field) {
            $sectionId = $field['section'] ?? '';
            if (empty($sectionId) || in_array($sectionId, $sectionIds, true)) {
                continue;
            }

            $sections[] = [
                'id' => $sectionId,
                'label' => $this->missingSectionLabel($sectionId),
            ];
            $sectionIds[] = $sectionId;
        }

        $sections[] = [
            'id' => 'seo',
            'label' => __('SEO'),
        ];
        $fields[] = [
            'id' => 'seo_bundle',
            'label' => 'إعدادات تحسين الظهور',
            'desc' => 'بيانات الظهور في محركات البحث ومشاركة الصفحة على الشبكات الاجتماعية.',
            'type' => 'seo',
            'section' => 'seo',
            'layout' => '',
            'condition' => '',
            'choices' => [],
            'items' => [],
            'value' => $this->seoFieldValue($service),
        ];

        return response()->json([
            'status' => 1,
            'data' => [
                'service_type' => $type,
                'service_id' => (int)$service->post_id,
                'created' => $created,
                'title' => $type === 'home' ? 'إضافة وتعديل الإعلانات' : 'إضافة وتعديل التجارب',
                'sections' => $sections,
                'fields' => $fields,
                'public_url' => $this->publicUrlForService($type, $service),
                'list_url' => $type === 'home'
                    ? dashboard_url('services/homes')
                    : dashboard_url('services/experiences'),
                'preview' => [
                    'id' => (int) $service->post_id,
                    'title' => get_translate($service->post_title ?? '', 1),
                    'status' => $service->status ?? 'draft',
                    'status_label' => $this->statusLabel((string) ($service->status ?? 'draft')),
                    'thumbnail_url' => !empty($service->thumbnail_id) ? (get_attachment_url($service->thumbnail_id) ?: '') : '',
                    'type_label' => $type === 'home' ? 'إعلان' : 'تجربة',
                    'price' => (float) ($service->base_price ?? 0),
                    'currency' => current_currency('symbol'),
                ],
            ],
        ]);
    }

    private function saveEditor($type, $id, Request $request)
    {
        $service = $this->authorizedService($type, $id);
        if (!$service) {
            return response()->json([
                'status' => 0,
                'message' => __('This item is not available'),
            ], 404);
        }

        $configKey = $type === 'home' ? 'home_settings' : 'experience_settings';
        $options = Config::get('awebooking.' . $configKey);
        $values = (array)$request->input('values', []);
        $data = [];

        if (($service->status ?? '') === 'revision') {
            $data['status'] = 'pending';
        }

        foreach ($options['fields'] as $field) {
            $field = \ThemeOptions::mergeField($field);
            if (!empty($field['excluded'])) {
                continue;
            }

            $fieldId = $field['id'];
            $hasValue = array_key_exists($fieldId, $values);
            if (!$hasValue && $field['type'] !== 'on_off') {
                continue;
            }

            $value = $hasValue ? $values[$fieldId] : null;

            if ($field['field_type'] === 'taxonomy') {
                $termIds = array_values(array_filter(array_map('intval', (array)$value)));
                $taxonomy = explode(':', $field['choices'])[1];
                $termRelation = new TermRelation();
                $termRelation->deleteRelationByServiceID($id, $taxonomy);
                foreach ($termIds as $termId) {
                    $termRelation->createRelation($termId, $id, $type);
                }
                $data[$fieldId] = implode(',', $termIds);
                continue;
            }

            if ($field['field_type'] === 'location') {
                $location = is_array($value) ? $value : [];
                foreach (['address', 'city', 'state', 'postcode', 'country', 'lat', 'lng', 'zoom'] as $key) {
                    $data[$fieldId . '_' . $key] = $location[$key] ?? '';
                }
                continue;
            }

            switch ($field['type']) {
                case 'on_off':
                    $data[$fieldId] = $this->normalizeToggle($value);
                    break;
                case 'checkbox':
                case 'select2_multiple':
                    $data[$fieldId] = implode(',', $this->normalizeArray($value));
                    break;
                case 'permalink':
                    $data[$fieldId] = Str::slug((string)$value);
                    break;
                case 'list_item':
                    $data[$fieldId] = serialize($this->normalizeListItems($field, $value));
                    break;
                case 'media_advanced':
                    $media = is_array($value) ? $value : ['ids' => (array)$value];
                    $ids = array_values(array_filter(array_map('intval', (array)($media['ids'] ?? []))));
                    $data[$fieldId] = implode(',', $ids);
                    if ($fieldId === 'gallery') {
                        $featuredId = (int)($media['featured_id'] ?? ($ids[0] ?? 0));
                        if ($featuredId > 0) {
                            $data['thumbnail_id'] = $featuredId;
                        }
                    }
                    break;
                case 'upload':
                    if (is_array($value)) {
                        $data[$fieldId] = (int)($value['id'] ?? 0);
                    } else {
                        $data[$fieldId] = (int)$value;
                    }
                    break;
                case 'price_categories':
                    $selected = $this->normalizeArray(is_array($value) ? ($value['selected'] ?? []) : []);
                    $primary = is_array($value) ? (string)($value['price_primary'] ?? 'adult_price') : 'adult_price';
                    $adult = is_array($value) ? (float)($value['adult_price'] ?? 0) : 0;
                    $child = is_array($value) ? (float)($value['child_price'] ?? 0) : 0;
                    $infant = is_array($value) ? (float)($value['infant_price'] ?? 0) : 0;
                    $data[$fieldId] = implode(',', $selected);
                    $data['price_primary'] = $primary;
                    $data['adult_price'] = $adult;
                    $data['child_price'] = $child;
                    $data['infant_price'] = $infant;
                    $data['base_price'] = (float)($data[$primary] ?? 0);
                    break;
                case 'price':
                    $this->syncCustomPrice($type, $id, $value, $service);
                    break;
                case 'availability':
                    $this->syncAvailability($type, $id, $value, $service);
                    break;
                case 'ical':
                case 'alert':
                    break;
                case 'seo':
                    $this->saveSeoBundle($type, $id, $value);
                    break;
                default:
                    $data[$fieldId] = is_array($value) ? '' : $value;
                    break;
            }
        }

        if (empty($data['post_slug'])) {
            $fallbackTitle = !empty($values['post_title']) ? (string)$values['post_title'] : (($service->post_title ?? '') ?: ($type . '-' . time()));
            $data['post_slug'] = Str::slug($fallbackTitle);
        }

        if ($type === 'home') {
            (new Home())->updateHome($data, $id);
            do_action('hh_saved_home_meta', $id);
        } else {
            (new Experience())->updateExperience($data, $id);
            do_action('hh_saved_experience_meta', $id);
        }
        do_action('hh_saved_service_meta', $id);

        return response()->json([
            'status' => 1,
            'message' => 'تم الحفظ بنجاح',
            'data' => [
                'service_id' => $id,
                'public_url' => $this->publicUrlForService($type, $this->authorizedService($type, $id)),
            ],
        ]);
    }

    private function mapFieldForEditor($service, array $field)
    {
        $value = $this->fieldValue($service, $field);

        return [
            'id' => $field['id'],
            'label' => $this->translateEditorText((string) ($field['label'] ?? '')),
            'desc' => $this->translateEditorText((string) ($field['desc'] ?? '')),
            'type' => $field['type'],
            'section' => $field['section'],
            'layout' => $field['layout'],
            'condition' => $field['condition'],
            'choices' => $this->fieldChoices($field),
            'items' => $this->fieldItems($field),
            'value' => $value,
        ];
    }

    private function missingSectionLabel($sectionId)
    {
        $labels = [
            'availability_options' => 'الإتاحة',
            'amenities_options' => 'وسائل الراحة',
            'languages_options' => 'اللغات',
            'inclusions_options' => 'المتضمن وغير المتضمن',
            'itinerary_options' => 'برنامج الرحلة',
            'gallery_options' => 'المعرض',
            'pricing_options' => 'الأسعار',
            'policies_options' => 'السياسات',
            'location_options' => 'الموقع',
            'detail_options' => 'التفاصيل',
        ];

        if (isset($labels[$sectionId])) {
            return $labels[$sectionId];
        }

        return $this->translateEditorText(ucwords(str_replace('_', ' ', str_replace('_options', '', $sectionId))));
    }

    private function fieldValue($service, array $field)
    {
        $fieldId = $field['id'];
        $raw = $service->{$fieldId} ?? $field['std'];

        if ($field['field_type'] === 'location') {
            return [
                'address' => get_translate($service->{$fieldId . '_address'} ?? '', 1),
                'city' => get_translate($service->{$fieldId . '_city'} ?? '', 1),
                'state' => get_translate($service->{$fieldId . '_state'} ?? '', 1),
                'postcode' => $service->{$fieldId . '_postcode'} ?? '',
                'country' => get_translate($service->{$fieldId . '_country'} ?? '', 1),
                'lat' => $service->{$fieldId . '_lat'} ?? '',
                'lng' => $service->{$fieldId . '_lng'} ?? '',
                'zoom' => $service->{$fieldId . '_zoom'} ?? '',
            ];
        }

        if ($field['field_type'] === 'taxonomy') {
            $selected = [];
            $choices = is_string($field['choices']) ? explode(':', $field['choices']) : [];
            if (!empty($choices) && $choices[0] === 'terms') {
                $terms = get_the_terms($service->post_id, $choices[1]);
                if ($terms) {
                    foreach ($terms as $term) {
                        $selected[] = (int)$term->term_id;
                    }
                }
            }
            return $selected;
        }

        switch ($field['type']) {
            case 'checkbox':
            case 'select2_multiple':
                return $this->normalizeArray($raw);
            case 'list_item':
                return maybe_unserialize($raw) ?: [];
            case 'media_advanced':
                $ids = $this->normalizeArray($raw);
                $items = [];
                foreach ($ids as $id) {
                    $attachment = get_attachment_info((int)$id, 'full');
                    if ($attachment) {
                        $items[] = [
                            'id' => (int)$id,
                            'url' => $attachment['url'] ?? '',
                            'description' => $attachment['description'] ?? '',
                            'type' => $attachment['type'] ?? '',
                        ];
                    }
                }
                return [
                    'ids' => array_map('intval', $ids),
                    'featured_id' => (int)($service->thumbnail_id ?? 0),
                    'items' => $items,
                ];
            case 'upload':
                if (!empty($raw)) {
                    $attachment = get_attachment_info((int)$raw, 'full');
                    if ($attachment) {
                        return [
                            'id' => (int)$raw,
                            'url' => $attachment['url'] ?? '',
                            'description' => $attachment['description'] ?? '',
                            'type' => $attachment['type'] ?? '',
                        ];
                    }
                }
                return null;
            case 'price_categories':
                return [
                    'selected' => $this->normalizeArray($service->price_categories ?? ''),
                    'price_primary' => $service->price_primary ?? 'adult_price',
                    'adult_price' => (float)($service->adult_price ?? 0),
                    'child_price' => (float)($service->child_price ?? 0),
                    'infant_price' => (float)($service->infant_price ?? 0),
                ];
            case 'editor':
            case 'textarea':
            case 'text':
                return is_string($raw) ? get_translate($raw, 1) : $raw;
            case 'on_off':
                return $this->normalizeToggle($raw);
            case 'price':
                return $this->priceFieldValue($service);
            case 'availability':
                return $this->availabilityFieldValue($service);
            case 'ical':
                return $this->icalFieldValue($service);
            case 'alert':
                return ['message' => __($field['desc'])];
            default:
                return $raw;
        }
    }

    private function fieldChoices(array $field)
    {
        if (empty($field['choices'])) {
            return [];
        }

        if (is_array($field['choices'])) {
            $items = [];
            foreach ($field['choices'] as $value => $label) {
                $items[] = ['value' => (string)$value, 'label' => $this->translateEditorText((string) $label)];
            }
            return $items;
        }

        if (!is_string($field['choices'])) {
            return [];
        }

        $parts = explode(':', $field['choices']);
        if ($parts[0] === 'terms' && !empty($parts[1])) {
            $items = [];
            foreach (get_terms($parts[1]) as $value => $label) {
                $items[] = ['value' => (string)$value, 'label' => (string)$label];
            }
            return $items;
        }

        if ($parts[0] === 'list' && ($parts[1] ?? '') === 'hour') {
            $step = (int)($parts[2] ?? 30);
            $items = [];
            for ($hour = 0; $hour < 24; $hour++) {
                for ($minute = 0; $minute < 60; $minute += max(1, $step)) {
                    $timestamp = strtotime(sprintf('%02d:%02d', $hour, $minute));
                    $items[] = [
                        'value' => date('h:i A', $timestamp),
                        'label' => date('h:i A', $timestamp),
                    ];
                }
            }
            return $items;
        }

        return [];
    }

    private function fieldItems(array $field)
    {
        if ($field['type'] !== 'list_item') {
            return [];
        }

        $items = [];
        foreach ($field['items'] as $item) {
            $merged = \ThemeOptions::mergeField($item);
            $items[] = [
                'id' => $merged['id'],
                'label' => $this->translateEditorText((string) ($merged['label'] ?? '')),
                'type' => $merged['type'],
                'choices' => $this->fieldChoices($merged),
            ];
        }

        return $items;
    }

    private function authorizedService($type, $id)
    {
        $service = get_post($id, $type);
        if (!$service || !user_can_edit_service($service)) {
            return null;
        }

        return $service;
    }

    private function normalizeArray($value)
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map(static function ($item) {
                return is_scalar($item) ? (string)$item : '';
            }, $value)));
        }

        if (is_string($value) && strlen(trim($value))) {
            return array_values(array_filter(array_map('trim', explode(',', $value))));
        }

        return [];
    }

    private function normalizeToggle($value)
    {
        return in_array($value, [true, 1, '1', 'true', 'on'], true) ? 'on' : 'off';
    }

    private function statusLabel($status)
    {
        $map = [
            'draft' => 'مسودة',
            'publish' => 'منشور',
            'published' => 'منشور',
            'pending' => 'بانتظار المراجعة',
            'revision' => 'مراجعة',
            'inactive' => 'غير نشط',
        ];

        return $map[$status] ?? $this->translateEditorText(ucfirst($status));
    }

    private function translateEditorText($text)
    {
        $text = trim((string) $text);
        if ($text === '') {
            return '';
        }

        $map = [
            'Home Editor' => 'إضافة وتعديل الإعلانات',
            'Experience Editor' => 'إضافة وتعديل التجارب',
            'SEO' => 'SEO',
            'SEO Settings' => 'إعدادات تحسين الظهور',
            'Details' => 'التفاصيل',
            'Detail' => 'التفاصيل',
            'Title' => 'العنوان',
            'Permalink' => 'الرابط الثابت',
            'Location' => 'الموقع',
            'Pricing' => 'الأسعار',
            'Gallery' => 'المعرض',
            'Languages' => 'اللغات',
            'Inclusions / Exclusions' => 'المتضمن وغير المتضمن',
            'Inclusions' => 'المتضمن',
            'Exclusions' => 'غير المتضمن',
            'Itinerary' => 'برنامج الرحلة',
            'Policies' => 'السياسات',
            'Availability' => 'الإتاحة',
            'Amenities' => 'وسائل الراحة',
            'Description' => 'الوصف',
            'Address' => 'العنوان',
            'City' => 'المدينة',
            'State' => 'المنطقة',
            'Postcode' => 'الرمز البريدي',
            'Country' => 'الدولة',
            'Latitude' => 'خط العرض',
            'Longitude' => 'خط الطول',
            'Zoom' => 'مستوى التكبير',
            'Price' => 'السعر',
            'Adult Price' => 'سعر البالغ',
            'Child Price' => 'سعر الطفل',
            'Infant Price' => 'سعر الرضيع',
            'Maximum People' => 'الحد الأقصى للأشخاص',
            'Minimum Stay' => 'الحد الأدنى للإقامة',
            'Maximum Stay' => 'الحد الأقصى للإقامة',
            'Check In' => 'موعد الدخول',
            'Check Out' => 'موعد الخروج',
            'Featured Image' => 'الصورة الرئيسية',
            'Images' => 'الصور',
            'Video' => 'الفيديو',
            'Image' => 'صورة',
            'Status' => 'الحالة',
            'Featured' => 'مميز',
            'Contact Information' => 'بيانات التواصل',
            'Email' => 'البريد الإلكتروني',
            'Phone' => 'رقم الجوال',
            'Name' => 'الاسم',
            'Booking Type' => 'نوع الحجز',
            'Date' => 'التاريخ',
            'Date Time' => 'التاريخ والوقت',
            'Hour' => 'الساعة',
            'Icon' => 'الأيقونة',
            'Short Description' => 'وصف مختصر',
            'Enter a minimum of 6 characters' => 'أدخل 6 أحرف على الأقل',
            'Enter a minimum of 10 characters' => 'أدخل 10 أحرف على الأقل',
            'Show reservation history on calendar' => 'إظهار سجل الحجوزات على التقويم',
            'Add some blocked dates or reduce available slots for a specific date.' => 'أضف تواريخ محجوبة أو خفّض السعة المتاحة في تاريخ محدد.',
            'You can sync availability using iCal feeds.' => 'يمكنك مزامنة الإتاحة باستخدام روابط iCal.',
            'Please upload your gallery images.' => 'يرجى رفع صور المعرض.',
            'Please enter your address' => 'يرجى إدخال العنوان',
            'Write a short summary' => 'اكتب ملخصاً قصيراً',
            'Write your detail' => 'اكتب التفاصيل',
            'Choose one option' => 'اختر قيمة',
            'Select your city' => 'اختر المدينة',
            'Select your country' => 'اختر الدولة',
            'Turn on to enable this option' => 'فعّل هذا الخيار لتمكينه',
            'SEO title' => 'عنوان SEO',
            'SEO description' => 'وصف SEO',
            'Facebook title' => 'عنوان فيسبوك',
            'Facebook description' => 'وصف فيسبوك',
            'Facebook image ID' => 'معرّف صورة فيسبوك',
            'Twitter title' => 'عنوان X / تويتر',
            'Twitter description' => 'وصف X / تويتر',
            'Twitter image ID' => 'معرّف صورة X / تويتر',
            'Search engine and social sharing metadata for this listing.' => 'بيانات الظهور في محركات البحث ومشاركة الصفحة على الشبكات الاجتماعية.',
            'Saved Successful' => 'تم الحفظ بنجاح',
        ];

        return $map[$text] ?? __($text);
    }

    private function normalizeListItems(array $field, $value)
    {
        $rows = is_array($value) ? $value : [];
        $normalized = [];

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }

            $item = [];
            $hasMeaningfulValue = false;

            foreach ($field['items'] as $definition) {
                $definition = \ThemeOptions::mergeField($definition);
                $itemValue = $row[$definition['id']] ?? '';

                if ($definition['type'] === 'on_off') {
                    $itemValue = $this->normalizeToggle($itemValue);
                } elseif ($definition['type'] === 'upload') {
                    if (is_array($itemValue)) {
                        $itemValue = (int)($itemValue['id'] ?? 0);
                    } else {
                        $itemValue = (int)$itemValue;
                    }
                } elseif (is_array($itemValue)) {
                    $itemValue = '';
                }

                if ($itemValue !== '' && $itemValue !== 'off' && $itemValue !== 0) {
                    $hasMeaningfulValue = true;
                }

                $item[$definition['id']] = $itemValue;
            }

            if ($hasMeaningfulValue) {
                $normalized[] = $item;
            }
        }

        return $normalized;
    }

    private function publicUrlForService($type, $service)
    {
        if ($type === 'home') {
            return get_home_permalink($service->post_id, $service->post_slug ?? '');
        }

        return get_experience_permalink($service->post_id, $service->post_slug ?? '');
    }

    private function priceFieldValue($service)
    {
        $type = $service->post_type;
        $entries = [];

        if ($type === 'home') {
            $results = (new HomePrice())->getAllPrices($service->post_id);
            foreach ($results['results'] as $item) {
                $entries[] = [
                    'id' => (int)$item->ID,
                    'start_date' => date('Y-m-d', (int)$item->start_time),
                    'end_date' => date('Y-m-d', (int)$item->end_time),
                    'price' => (float)$item->price,
                    'available' => $item->available === 'off' ? 'off' : 'on',
                ];
            }
        } else {
            $results = (new ExperiencePrice())->getAllPrices($service->post_id);
            foreach ($results['results'] as $item) {
                $entries[] = [
                    'id' => (int)$item->ID,
                    'start_at' => $service->booking_type === 'date_time'
                        ? date('Y-m-d\TH:i', (int)$item->start_time)
                        : date('Y-m-d', (int)$item->start_date),
                    'adult_price' => (float)$item->adult_price,
                    'child_price' => (float)$item->child_price,
                    'infant_price' => (float)$item->infant_price,
                    'max_people' => (int)$item->max_people,
                ];
            }
        }

        return [
            'booking_type' => $service->booking_type ?? 'per_night',
            'entries' => $entries,
        ];
    }

    private function availabilityFieldValue($service)
    {
        if ($service->post_type === 'home') {
            $rows = DB::table('home_availability')
                ->where('home_id', $service->post_id)
                ->where(function ($query) {
                    $query->whereNull('booking_id')
                        ->orWhere('booking_id', '')
                        ->orWhere('booking_id', 0);
                })
                ->where(function ($query) {
                    $query->whereNull('type')
                        ->orWhere('type', '');
                })
                ->orderBy('start_date')
                ->get();

            $entries = [];
            foreach ($rows as $row) {
                $entries[] = [
                    'key' => $row->start_date . ':' . $row->end_date,
                    'start_date' => date('Y-m-d', (int)$row->start_date),
                    'end_date' => date('Y-m-d', (int)$row->end_date),
                ];
            }

            return ['entries' => $entries];
        }

        $rows = DB::table('experience_availability')
            ->where('experience_id', $service->post_id)
            ->where(function ($query) {
                $query->whereNull('type')
                    ->orWhere('type', '');
            })
            ->orderBy('date')
            ->get();

        $entries = [];
        foreach ($rows as $row) {
            $entries[] = [
                'key' => (string)$row->date,
                'date' => date('Y-m-d', (int)$row->date),
                'max_people' => isset($row->max_people) ? (int)$row->max_people : null,
                'summary' => (string)($row->summary ?? ''),
            ];
        }

        return [
            'entries' => $entries,
            'booking_type' => $service->booking_type ?? 'date_time',
        ];
    }

    private function icalFieldValue($service)
    {
        return [
            'export_url' => get_ical_url($service->post_id, $service->post_type),
            'imports' => maybe_unserialize($service->import_ical_url) ?: [],
            'message' => __('Imported calendar feeds are saved from the list above and synchronized by cron.'),
        ];
    }

    private function seoFieldValue($service)
    {
        $seo = (new Seo())->getByPostId($service->post_id, $service->post_type);

        return [
            'seo_title' => $seo->seo_title ?? '',
            'seo_description' => $seo->seo_description ?? '',
            'facebook_title' => $seo->facebook_title ?? '',
            'facebook_description' => $seo->facebook_description ?? '',
            'facebook_image' => (int) ($seo->facebook_image ?? 0),
            'twitter_title' => $seo->twitter_title ?? '',
            'twitter_description' => $seo->twitter_description ?? '',
            'twitter_image' => (int) ($seo->twitter_image ?? 0),
        ];
    }

    private function saveSeoBundle($type, $serviceId, $value)
    {
        $payload = is_array($value) ? $value : [];
        $data = [
            'post_id' => $serviceId,
            'post_type' => $type,
            'created_at' => time(),
            'seo_title' => (string) ($payload['seo_title'] ?? ''),
            'seo_description' => (string) ($payload['seo_description'] ?? ''),
            'facebook_title' => (string) ($payload['facebook_title'] ?? ''),
            'facebook_description' => (string) ($payload['facebook_description'] ?? ''),
            'facebook_image' => (int) ($payload['facebook_image'] ?? 0),
            'twitter_title' => (string) ($payload['twitter_title'] ?? ''),
            'twitter_description' => (string) ($payload['twitter_description'] ?? ''),
            'twitter_image' => (int) ($payload['twitter_image'] ?? 0),
        ];

        $seoModel = new Seo();
        $existing = $seoModel->getByPostId($serviceId, $type);
        if ($existing) {
            $seoModel->updateSeo($data, $existing->seo_id);
        } else {
            $seoModel->createSeo($data);
        }
    }

    private function syncCustomPrice($type, $serviceId, $value, $service)
    {
        $entries = is_array($value) ? ($value['entries'] ?? []) : [];

        if ($type === 'home') {
            DB::table('home_price')->where('home_id', $serviceId)->delete();
            DB::table('home_availability')
                ->where('home_id', $serviceId)
                ->where(function ($query) {
                    $query->whereNull('booking_id')
                        ->orWhere('booking_id', '')
                        ->orWhere('booking_id', 0);
                })
                ->where(function ($query) {
                    $query->whereNull('type')
                        ->orWhere('type', '');
                })
                ->delete();

            foreach ((array)$entries as $entry) {
                if (!is_array($entry)) {
                    continue;
                }

                $start = strtotime((string)($entry['start_date'] ?? ''));
                $end = strtotime((string)($entry['end_date'] ?? ''));
                $price = (float)($entry['price'] ?? 0);
                $available = ($entry['available'] ?? 'on') === 'off' ? 'off' : 'on';

                if (!$start || !$end) {
                    continue;
                }

                if ($end < $start) {
                    $tmp = $start;
                    $start = $end;
                    $end = $tmp;
                }

                DB::table('home_price')->insert([
                    'home_id' => $serviceId,
                    'start_time' => $start,
                    'end_time' => $end,
                    'price' => $price,
                    'available' => $available,
                ]);

                if ($available === 'off') {
                    DB::table('home_availability')->insert([
                        'home_id' => $serviceId,
                        'start_time' => $start,
                        'start_date' => $start,
                        'end_time' => $end,
                        'end_date' => $end,
                        'total_minutes' => 1440,
                    ]);
                }
            }

            return;
        }

        DB::table('experience_price')->where('experience_id', $serviceId)->delete();

        foreach ((array)$entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $raw = (string)($entry['start_at'] ?? '');
            $timestamp = strtotime($raw);
            if (!$timestamp) {
                continue;
            }

            $startDate = ($service->booking_type ?? 'date_time') === 'date_time'
                ? strtotime(date('Y-m-d', $timestamp))
                : $timestamp;

            DB::table('experience_price')->insert([
                'experience_id' => $serviceId,
                'start_time' => $timestamp,
                'end_time' => $timestamp,
                'start_date' => $startDate,
                'end_date' => $startDate,
                'adult_price' => (float)($entry['adult_price'] ?? 0),
                'child_price' => (float)($entry['child_price'] ?? 0),
                'infant_price' => (float)($entry['infant_price'] ?? 0),
                'max_people' => (int)($entry['max_people'] ?? 0),
            ]);
        }
    }

    private function syncAvailability($type, $serviceId, $value, $service)
    {
        $entries = is_array($value) ? ($value['entries'] ?? []) : [];

        if ($type === 'home') {
            DB::table('home_availability')
                ->where('home_id', $serviceId)
                ->where(function ($query) {
                    $query->whereNull('booking_id')
                        ->orWhere('booking_id', '')
                        ->orWhere('booking_id', 0);
                })
                ->where(function ($query) {
                    $query->whereNull('type')
                        ->orWhere('type', '');
                })
                ->delete();

            foreach ((array)$entries as $entry) {
                if (!is_array($entry)) {
                    continue;
                }

                $start = strtotime((string)($entry['start_date'] ?? ''));
                $end = strtotime((string)($entry['end_date'] ?? ''));
                if (!$start || !$end) {
                    continue;
                }

                if ($end < $start) {
                    $tmp = $start;
                    $start = $end;
                    $end = $tmp;
                }

                DB::table('home_availability')->insert([
                    'home_id' => $serviceId,
                    'start_time' => $start,
                    'start_date' => $start,
                    'end_time' => $end,
                    'end_date' => $end,
                    'total_minutes' => 1440,
                ]);
            }

            return;
        }

        DB::table('experience_availability')
            ->where('experience_id', $serviceId)
            ->where(function ($query) {
                $query->whereNull('type')
                    ->orWhere('type', '');
            })
            ->delete();

        foreach ((array)$entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $date = strtotime((string)($entry['date'] ?? ''));
            if (!$date) {
                continue;
            }

            DB::table('experience_availability')->insert([
                'experience_id' => $serviceId,
                'date' => strtotime(date('Y-m-d', $date)),
                'max_people' => isset($entry['max_people']) && $entry['max_people'] !== ''
                    ? (int)$entry['max_people']
                    : (int)($service->number_of_guest ?? 0),
                'summary' => (string)($entry['summary'] ?? __('Unavailable')),
            ]);
        }
    }
}
