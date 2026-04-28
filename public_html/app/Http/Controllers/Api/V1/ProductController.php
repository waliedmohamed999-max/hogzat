<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Home;
use App\Models\Experience;
use App\Models\Car;
use App\Models\HomeAvailability;
use App\Models\ExperienceAvailability;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $type = $this->normalizeType($request->get('type', 'home'));
        $items = [];

        if ($type === 'home') {
            $items = $this->searchHome($request);
        } elseif ($type === 'experience') {
            $items = $this->searchExperience($request);
        } else {
            $items = $this->searchService($request);
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function show($id, Request $request)
    {
        $type = $this->resolveType($id, $request->get('type'));
        if (!$type) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $item = $this->getByType($type, $id);
        if (!$item) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $payload = $this->mapDetails($item, $type);

        return response()->json([
            'status' => 1,
            'data' => $payload,
        ]);
    }

    public function reviews($id, Request $request)
    {
        $type = $this->resolveType($id, $request->get('type'));
        if (!$type) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $comments = get_comment_list($id, [
            'number' => $request->get('limit', comments_per_page()),
            'page' => $request->get('page', 1),
            'type' => $type,
        ]);

        $results = [];
        foreach ($comments['results'] as $comment) {
            $results[] = $this->mapComment($comment);
        }

        return response()->json([
            'status' => 1,
            'data' => $results,
        ]);
    }

    public function availability($id, Request $request)
    {
        $type = $this->resolveType($id, $request->get('type'));
        if (!$type) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $from = $request->get('from');
        $to = $request->get('to');
        if (!$from || !$to) {
            return response()->json(['status' => 0, 'message' => 'Missing dates'], 422);
        }

        $start = strtotime($from);
        $end = strtotime($to);
        $events = [];

        if ($type === 'home') {
            $availability = new HomeAvailability();
            $blocked = $availability->getAvailabilityItems($id, $start, $end);
            $blockedRanges = $blocked['results'];

            for ($i = $start; $i <= $end; $i = strtotime('+1 day', $i)) {
                $available = true;
                foreach ($blockedRanges as $range) {
                    if ($i >= $range->start_date && $i <= $range->end_date) {
                        $available = false;
                        break;
                    }
                }
                $events[] = [
                    'date' => date('Y-m-d', $i),
                    'available' => $available,
                    'price' => null,
                ];
            }
        } elseif ($type === 'experience') {
            $availability = new ExperienceAvailability();
            $blocked = $availability->getAvailabilityItems($id, $start, $end);
            $blockedDates = array_map(function ($row) {
                return $row->date;
            }, $blocked['results']->all());

            for ($i = $start; $i <= $end; $i = strtotime('+1 day', $i)) {
                $events[] = [
                    'date' => date('Y-m-d', $i),
                    'available' => !in_array($i, $blockedDates, true),
                    'price' => null,
                ];
            }
        } else {
            for ($i = $start; $i <= $end; $i = strtotime('+1 day', $i)) {
                $events[] = [
                    'date' => date('Y-m-d', $i),
                    'available' => true,
                    'price' => null,
                ];
            }
        }

        return response()->json([
            'status' => 1,
            'data' => $events,
        ]);
    }

    public function amenities($id, Request $request)
    {
        $type = $this->resolveType($id, $request->get('type'));
        if (!$type) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $item = $this->getByType($type, $id);
        if (!$item) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $taxonomy = $this->amenityTaxonomy($type);
        $amenities = $this->mapAmenities($item->amenities ?? '', $taxonomy);

        return response()->json([
            'status' => 1,
            'data' => $amenities,
        ]);
    }

    public function rooms($id, Request $request)
    {
        $type = $this->resolveType($id, $request->get('type'));
        if ($type !== 'home') {
            return response()->json(['status' => 1, 'data' => []]);
        }

        $home = (new Home())->getById($id);
        if (!$home) {
            return response()->json(['status' => 0, 'message' => 'Data is invalid'], 404);
        }

        $rooms = [];
        $bedrooms = (int)($home->number_of_bedrooms ?? 0);
        if ($bedrooms < 1) {
            $bedrooms = 1;
        }
        $rooms[] = [
            'title' => 'غرفة النوم',
            'beds_label' => $bedrooms . ' سرير مزدوج',
            'image_url' => $this->firstImage($home),
        ];

        return response()->json([
            'status' => 1,
            'data' => $rooms,
        ]);
    }

    private function searchHome(Request $request)
    {
        $price_filter = $this->buildPriceFilter($request);
        $amenities = $this->toCsv($request->get('amenities', []));

        $data = [
            'page' => $request->get('page', 1),
            'address' => $request->get('city', ''),
            'checkIn' => $request->get('date_from', ''),
            'checkOut' => $request->get('date_to', ''),
            'num_adults' => $request->get('guests', 0),
            'price_filter' => $price_filter,
            'home-amenity' => $amenities,
        ];

        $model = new Home();
        $posts = $model->getSearchResult($data);

        $results = [];
        foreach ($posts['results'] as $item) {
            $results[] = $this->mapSummary($item, 'home');
        }
        return $results;
    }

    private function searchExperience(Request $request)
    {
        $price_filter = $this->buildPriceFilter($request);
        $data = [
            'page' => $request->get('page', 1),
            'address' => $request->get('city', ''),
            'checkIn' => $request->get('date_from', ''),
            'checkOut' => $request->get('date_to', ''),
            'num_adults' => $request->get('guests', 1),
            'price_filter' => $price_filter,
        ];

        $model = new Experience();
        $posts = $model->getSearchResult($data);

        $results = [];
        foreach ($posts['results'] as $item) {
            $results[] = $this->mapSummary($item, 'experience');
        }

        $amenities = (array)$request->get('amenities', []);
        if (!empty($amenities)) {
            $results = array_values(array_filter($results, function ($row) use ($amenities) {
                if (empty($row['amenity_ids'])) {
                    return false;
                }
                $ids = explode(',', $row['amenity_ids']);
                return count(array_intersect($amenities, $ids)) > 0;
            }));
        }

        return $results;
    }

    private function searchService(Request $request)
    {
        $price_filter = $this->buildPriceFilter($request);
        $features = $this->toCsv($request->get('amenities', []));

        $data = [
            'page' => $request->get('page', 1),
            'address' => $request->get('city', ''),
            'checkIn' => $request->get('date_from', ''),
            'checkOut' => $request->get('date_to', ''),
            'price_filter' => $price_filter,
            'car-feature' => $features,
        ];

        $model = new Car();
        $posts = $model->getSearchResult($data);

        $results = [];
        foreach ($posts['results'] as $item) {
            $results[] = $this->mapSummary($item, 'service');
        }
        return $results;
    }

    private function mapSummary($item, $type)
    {
        $thumb = get_attachment_url($item->thumbnail_id);
        $rating = isset($item->rating) ? (float)$item->rating : 0;

        return [
            'id' => (int)$item->post_id,
            'type' => $type,
            'slug' => $item->post_slug ?? '',
            'title' => get_translate($item->post_title, 1),
            'price_from' => (float)($item->base_price ?? 0),
            'rating' => $rating,
            'thumb' => $thumb ?? '',
            'city' => get_translate($item->location_city ?? '', 1),
            'amenity_ids' => $item->amenities ?? ($item->features ?? ''),
            'guests' => $this->guestCount($item, $type),
            'bedrooms' => (int)($item->number_of_bedrooms ?? 0),
            'baths' => (float)($item->number_of_bathrooms ?? 0),
            'is_featured' => ($item->is_featured ?? '') === 'on',
            'use_offer' => ($item->use_offer ?? '') === 'on',
            'offer_percent' => (int)($item->offer ?? 0),
        ];
    }

    private function mapDetails($item, $type)
    {
        $images = $this->buildGallery($item);
        $amenities = $this->mapAmenities($item->amenities ?? ($item->features ?? ''), $this->amenityTaxonomy($type));
        $sleepingArrangements = $this->buildRooms($item, $type);
        $rules = $this->buildRules($item, $type);
        $safety = [];
        $cancellation = $this->buildCancellation($item);
        $host = $this->mapHost($item->author ?? 0);

        $rating = isset($item->rating) ? (float)$item->rating : 0;
        $reviewCount = get_comment_number($item->post_id, $type);
        $guestFavorite = get_option('home_featured_label', 'مفضل لدى الضيوف');

        $pricing = $this->buildPricing($item);
        $reviewHighlight = $this->buildReviewHighlight($item->post_id, $type, $guestFavorite);

        return [
            'id' => (int)$item->post_id,
            'title' => get_translate($item->post_title, 1),
            'subtitle' => $this->buildSubtitle($item),
            'description' => get_translate($item->post_description ?: $item->post_content, 1),
            'rules' => '',
            'images' => $images,
            'amenities' => $amenities,
            'sleeping_arrangements' => $sleepingArrangements,
            'house_rules' => $rules,
            'safety_items' => $safety,
            'cancellation_policy' => $cancellation,
            'location' => [
                'lat' => (float)($item->location_lat ?? 0),
                'lng' => (float)($item->location_lng ?? 0),
                'address' => get_translate($item->location_address ?? '', 1),
                'city' => get_translate($item->location_city ?? '', 1),
                'country' => get_translate($item->location_country ?? '', 1),
                'map_image_url' => $this->buildMapImage($item),
            ],
            'property_type_label' => $this->buildPropertyTypeLabel($item, $type),
            'rating' => $rating,
            'review_count' => (int)$reviewCount,
            'guest_favorite_label' => $guestFavorite,
            'guests' => $this->guestCount($item, $type),
            'bedrooms' => (int)($item->number_of_bedrooms ?? 0),
            'beds' => (int)($item->number_of_bedrooms ?? 0),
            'baths' => (float)($item->number_of_bathrooms ?? 0),
            'host' => $host,
            'pricing' => $pricing,
            'review_highlight' => $reviewHighlight,
        ];
    }

    private function buildGallery($item)
    {
        $gallery = [];
        if (!empty($item->gallery)) {
            $gallery_ids = explode(',', $item->gallery);
            foreach ($gallery_ids as $gallery_id) {
                $gallery[] = get_attachment_url($gallery_id);
            }
        }
        if (empty($gallery) && !empty($item->thumbnail_id)) {
            $gallery[] = get_attachment_url($item->thumbnail_id);
        }
        return $gallery;
    }

    private function firstImage($item)
    {
        $gallery = $this->buildGallery($item);
        return !empty($gallery) ? $gallery[0] : '';
    }

    private function buildRooms($item, $type)
    {
        if ($type !== 'home') {
            return [];
        }
        $bedrooms = (int)($item->number_of_bedrooms ?? 0);
        if ($bedrooms < 1) {
            $bedrooms = 1;
        }
        return [
            [
                'title' => 'غرفة النوم',
                'beds_label' => $bedrooms . ' سرير مزدوج',
                'image_url' => $this->firstImage($item),
            ]
        ];
    }

    private function buildRules($item, $type)
    {
        if ($type !== 'home') {
            return [];
        }
        $rules = [];
        if (!empty($item->checkin_time)) {
            $rules[] = [
                'title' => 'تسجيل الوصول بعد ' . $item->checkin_time,
                'value' => '',
                'icon' => 'calendar',
            ];
        }
        if (!empty($item->checkout_time)) {
            $rules[] = [
                'title' => 'تسجيل المغادرة قبل ' . $item->checkout_time,
                'value' => '',
                'icon' => 'calendar',
            ];
        }
        if (!empty($item->number_of_guest)) {
            $rules[] = [
                'title' => (int)$item->number_of_guest . ' ضيوف بحد أقصى',
                'value' => '',
                'icon' => 'house',
            ];
        }
        return $rules;
    }

    private function buildCancellation($item)
    {
        $title = 'سياسة الإلغاء';
        $summary = '';
        $details = get_translate($item->cancellation_detail ?? '', 1);

        if (!empty($item->enable_cancellation) && (int)$item->cancel_before > 0) {
            $summary = 'إلغاء مجاني قبل ' . (int)$item->cancel_before . ' يوم';
        }

        return [
            'title' => $title,
            'summary' => $summary,
            'details' => $details,
        ];
    }

    private function buildPricing($item)
    {
        $startDate = date('Y-m-d');
        $endDate = date('Y-m-d', strtotime('+2 days'));
        $nights = 2;
        $base = (float)($item->base_price ?? 0);
        $total = $base * $nights;

        return [
            'currency' => get_option('currency', 'SR'),
            'total' => $total,
            'nights' => $nights,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'date_range_label' => $startDate . ' - ' . $endDate,
            'free_cancellation_label' => 'إلغاء مجاني',
        ];
    }

    private function buildReviewHighlight($postId, $type, $guestFavorite)
    {
        $comments = get_comment_list($postId, [
            'number' => 1,
            'page' => 1,
            'type' => $type,
        ]);

        $results = $comments['results'] ?? [];
        if ($results instanceof \Illuminate\Support\Collection) {
            $results = $results->values()->all();
        }

        if (!empty($results)) {
            $comment = $results[0];
            return [
                'rating' => (float)($comment->comment_rate ?? 0),
                'title' => '',
                'body' => $comment->comment_content ?? '',
                'author_name' => $comment->comment_name ?? get_username($comment->comment_author),
                'author_avatar' => get_user_avatar($comment->comment_author),
                'date_label' => date('Y-m-d', $comment->created_at),
                'badge_label' => $guestFavorite,
            ];
        }

        return [
            'rating' => 0,
            'title' => '',
            'body' => '',
            'author_name' => '',
            'author_avatar' => '',
            'date_label' => '',
            'badge_label' => $guestFavorite,
        ];
    }

    private function mapHost($authorId)
    {
        $name = get_username($authorId);
        return [
            'id' => (int)$authorId,
            'name' => $name ?: 'مضيف',
            'avatar_url' => get_user_avatar($authorId),
            'is_superhost' => false,
            'hosting_years' => 1,
            'reviews_count' => 0,
            'rating' => 0,
            'response_rate' => 99,
            'response_time_label' => 'يرد في غضون ساعة',
            'badge_label' => 'مضيف موثوق',
            'about_title' => 'عن المضيف',
            'about_body' => '',
            'location_label' => '',
            'job_title' => '',
            'message_button_label' => 'مراسلة المضيف',
        ];
    }

    private function mapAmenities($amenityCsv, $taxonomy)
    {
        $results = [];
        $ids = $this->csvToArray($amenityCsv);
        foreach ($ids as $id) {
            $term = get_term_by('id', $id);
            if ($term) {
                $results[] = [
                    'id' => (int)$term->term_id,
                    'name' => get_translate($term->term_title, 1),
                    'icon' => $term->term_icon ?? '',
                ];
            }
        }
        return $results;
    }

    private function mapComment($comment)
    {
        return [
            'id' => (int)$comment->comment_id,
            'author_name' => $comment->comment_name ?? get_username($comment->comment_author),
            'author_avatar' => get_user_avatar($comment->comment_author),
            'rating' => (float)($comment->comment_rate ?? 0),
            'comment' => $comment->comment_content ?? '',
            'date_label' => date('Y-m-d', $comment->created_at),
        ];
    }

    private function buildSubtitle($item)
    {
        $city = get_translate($item->location_city ?? '', 1);
        $country = get_translate($item->location_country ?? '', 1);
        if ($city && $country) {
            return $city . '، ' . $country;
        }
        return $city ?: $country ?: '';
    }

    private function buildPropertyTypeLabel($item, $type)
    {
        if ($type === 'home') {
            return $this->termTitleFromCsv($item->home_type ?? '');
        }
        if ($type === 'experience') {
            return $this->termTitleFromCsv($item->experience_type ?? '');
        }
        return $this->termTitleFromCsv($item->car_type ?? '');
    }

    private function termTitleFromCsv($csv)
    {
        $ids = $this->csvToArray($csv);
        if (empty($ids)) {
            return '';
        }
        $term = get_term_by('id', $ids[0]);
        return $term ? get_translate($term->term_title, 1) : '';
    }

    private function buildMapImage($item)
    {
        if (empty($item->location_lat) || empty($item->location_lng)) {
            return '';
        }
        $lat = $item->location_lat;
        $lng = $item->location_lng;
        return "https://staticmap.openstreetmap.de/staticmap.php?center={$lat},{$lng}&zoom=13&size=800x450&markers={$lat},{$lng},red-pushpin";
    }

    private function guestCount($item, $type)
    {
        if ($type === 'service') {
            return (int)($item->passenger ?? 1);
        }
        return (int)($item->number_of_guest ?? 1);
    }

    private function resolveType($id, $type)
    {
        if (!empty($type)) {
            return $this->normalizeType($type);
        }
        if ((new Home())->getById($id)) {
            return 'home';
        }
        if ((new Experience())->getById($id)) {
            return 'experience';
        }
        if ((new Car())->getById($id)) {
            return 'service';
        }
        return null;
    }

    private function getByType($type, $id)
    {
        if ($type === 'home') {
            return (new Home())->getById($id);
        }
        if ($type === 'experience') {
            return (new Experience())->getById($id);
        }
        return (new Car())->getById($id);
    }

    private function normalizeType($type)
    {
        $type = strtolower($type);
        if ($type === 'service' || $type === 'car') {
            return 'service';
        }
        if ($type === 'experience') {
            return 'experience';
        }
        return 'home';
    }

    private function amenityTaxonomy($type)
    {
        if ($type === 'experience') {
            return 'experience-inclusions';
        }
        if ($type === 'service') {
            return 'car-feature';
        }
        return 'home-amenity';
    }

    private function buildPriceFilter(Request $request)
    {
        $min = $request->get('min_price');
        $max = $request->get('max_price');
        if ($min === null && $max === null) {
            return '';
        }
        $min = $min ?? 0;
        $max = $max ?? 0;
        return $min . ';' . $max;
    }

    private function toCsv($value)
    {
        if (is_array($value)) {
            return implode(',', $value);
        }
        return (string)$value;
    }

    private function csvToArray($value)
    {
        if (empty($value)) {
            return [];
        }
        if (is_array($value)) {
            return $value;
        }
        return array_filter(array_map('trim', explode(',', $value)));
    }
}
