<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Comment;
use App\Models\Coupon;
use App\Models\Experience;
use App\Models\Home;
use App\Models\LastMinute;
use App\Models\Media;
use App\Models\Page;
use App\Models\Payout;
use App\Models\Post;
use App\Models\Term;
use App\Models\Taxonomy;
use App\Models\User;
use App\Models\Voit;
use Cartalyst\Sentinel\Laravel\Facades\Activation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Controllers\BookingController as LegacyBookingController;
use Sentinel;

class DashboardBridgeController extends Controller
{
    public function summary()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context);

        $bookingsCount = (clone $query)->count();
        $pendingCount = (clone $query)->whereIn('status', ['pending', 'incomplete'])->count();
        $completedCount = (clone $query)->where('status', 'completed')->count();
        $wishlistCount = DB::table('favourite')
            ->where('phone_faved_user', $user->id)
            ->where('isFav', '1')
            ->count();
        $grossTotal = (float)((clone $query)->sum('total') ?: 0);

        return response()->json([
            'status' => 1,
            'data' => [
                'role' => $context['role'],
                'bookings_count' => $bookingsCount,
                'pending_count' => $pendingCount,
                'completed_count' => $completedCount,
                'wishlist_count' => $wishlistCount,
                'gross_total' => $grossTotal,
                'currency' => get_option('currency', 'SR'),
                'quick_links' => [
                    ['label' => 'الملف الشخصي', 'href' => dashboard_url('profile')],
                    ['label' => 'الحجوزات الكاملة', 'href' => dashboard_url('bookings')],
                    ['label' => 'المفضلة القديمة', 'href' => dashboard_url('wishlist')],
                    ['label' => 'التنبيهات', 'href' => dashboard_url('notifications')],
                ],
            ],
        ]);
    }

    public function bookings(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context);
        $this->applyBookingFilters($query, $request);

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(50, max(1, (int)$request->get('per_page', 8)));
        $offset = ($page - 1) * $perPage;

        $total = (clone $query)->count();
        $sortBy = $request->get('sortBy', 'newest');
        if ($sortBy === 'oldest') {
            $query->orderBy('ID');
        } elseif ($sortBy === 'price_desc') {
            $query->orderByDesc('total');
        } elseif ($sortBy === 'price_asc') {
            $query->orderBy('total');
        } else {
            $query->orderByDesc('ID');
        }

        $rows = $query
            ->offset($offset)
            ->limit($perPage)
            ->get();

        $items = [];
        foreach ($rows as $row) {
            $items[] = $this->mapBooking($row);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'pages' => max(1, (int)ceil($total / $perPage)),
                'results' => $items,
            ],
        ]);
    }

    public function bookingStats(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context);
        $this->applyBookingFilters($query, $request, true);

        $total = (clone $query)->count();
        $pending = (clone $query)->whereIn('status', ['pending', 'incomplete'])->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $canceled = (clone $query)->where('status', 'canceled')->count();
        $revenue = (float)((clone $query)->where('status', '!=', 'canceled')->sum('total') ?: 0);
        $avgPrice = $total > 0 ? $revenue / max(1, $total - $canceled) : 0;
        $active = (clone $query)
            ->where('status', '!=', 'canceled')
            ->where('start_date', '<=', time())
            ->where('end_date', '>=', time())
            ->count();
        $upcoming = (clone $query)
            ->where(function ($nested) {
                $nested
                    ->whereIn('status', ['pending', 'incomplete'])
                    ->orWhere(function ($dateQuery) {
                        $dateQuery->where('status', '!=', 'canceled')->where('start_date', '>', time());
                    });
            })
            ->count();

        $last7Days = [];
        for ($index = 6; $index >= 0; $index--) {
            $dayStart = strtotime(date('Y-m-d 00:00:00', strtotime("-{$index} days")));
            $dayEnd = strtotime(date('Y-m-d 23:59:59', strtotime("-{$index} days")));
            $last7Days[] = [
                'label' => date('m/d', $dayStart),
                'count' => (clone $query)
                    ->where('created_date', '>=', $dayStart)
                    ->where('created_date', '<=', $dayEnd)
                    ->count(),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => $total,
                'upcoming' => $upcoming,
                'active' => $active,
                'completed' => $completed,
                'canceled' => $canceled,
                'pending' => $pending,
                'revenue' => $revenue,
                'avgPrice' => $avgPrice,
                'occupancyRate' => $total > 0 ? round((($active + $completed) / $total) * 100) : 0,
                'cancellationRate' => $total > 0 ? round(($canceled / $total) * 100) : 0,
                'currency' => get_option('currency', 'SR'),
                'last7Days' => $last7Days,
            ],
        ]);
    }

    public function show($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context)->where('ID', (int)$id);
        $row = $query->first();

        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This booking is not available')], 404);
        }

        return response()->json([
            'status' => 1,
            'data' => $this->mapBookingDetail($row),
        ]);
    }

    public function cancel($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context)->where('ID', (int)$id);
        $row = $query->first();

        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This booking is not available')], 404);
        }

        if (in_array($row->status, ['canceled', 'completed'], true)) {
            return response()->json([
                'status' => 0,
                'message' => __('This booking can not be canceled'),
            ], 422);
        }

        LegacyBookingController::get_inst()->updateBookingStatus($row->ID, 'canceled');

        return response()->json([
            'status' => 1,
            'message' => __('Booking canceled'),
        ]);
    }

    public function confirm($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $context = $this->dashboardContext($user->id);
        $query = $this->bookingQuery($context)->where('ID', (int)$id);
        $row = $query->first();

        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This booking is not available')], 404);
        }

        if (($row->confirm ?? '') === 'confirmed') {
            return response()->json([
                'status' => 1,
                'message' => __('You have already confirmed'),
            ]);
        }

        $bookingModel = new Booking();
        $bookingModel->updateBooking(['confirm' => 'confirmed'], $row->ID);
        do_action('hh_confirmed_booking', $row->ID);

        return response()->json([
            'status' => 1,
            'message' => __('Thank you for your confirmation.'),
        ]);
    }

    public function homes(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Home())->getAllHomes([
            'search' => $request->get('_s', ''),
            'orderby' => $request->get('orderby', 'post_id'),
            'order' => $request->get('order', 'desc'),
            'status' => $request->filled('status') ? [$request->get('status')] : [],
            'page' => $page,
            'number' => $perPage,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = $this->mapManagedServiceItem($row, 'home');
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'type' => 'home',
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'add_url' => dashboard_url('services/homes/new'),
                'results' => $items,
            ],
        ]);
    }

    public function experiences(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Experience())->getAllExperiences([
            'search' => $request->get('_s', ''),
            'orderby' => $request->get('orderby', 'post_id'),
            'order' => $request->get('order', 'desc'),
            'status' => $request->filled('status') ? [$request->get('status')] : [],
            'page' => $page,
            'number' => $perPage,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = $this->mapManagedServiceItem($row, 'experience');
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'type' => 'experience',
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'add_url' => dashboard_url('services/experiences/new'),
                'results' => $items,
            ],
        ]);
    }

    public function homeStatus(Request $request, $id)
    {
        return $this->updateManagedServiceStatus('home', (int)$id, (string)$request->get('status', ''));
    }

    public function homeDuplicate($id)
    {
        return $this->duplicateManagedService('home', (int)$id);
    }

    public function homeDelete($id)
    {
        return $this->deleteManagedService('home', (int)$id);
    }

    public function experienceStatus(Request $request, $id)
    {
        return $this->updateManagedServiceStatus('experience', (int)$id, (string)$request->get('status', ''));
    }

    public function experienceDuplicate($id)
    {
        return $this->duplicateManagedService('experience', (int)$id);
    }

    public function experienceDelete($id)
    {
        return $this->deleteManagedService('experience', (int)$id);
    }

    public function reviews(Request $request, $type)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        if (!in_array($type, ['home', 'experience'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid review type')], 422);
        }

        $table = $type;
        $query = DB::table('comments')
            ->join($table, 'comments.post_id', '=', $table . '.post_id')
            ->where('comments.post_type', $type)
            ->selectRaw("comments.comment_id, comments.comment_name, comments.comment_email, comments.comment_content, comments.status, comments.created_at, {$table}.post_id as service_id, {$table}.post_title, {$table}.post_slug");

        if (!is_admin()) {
            $query->where($table . '.author', $user->id);
        }

        if ($request->filled('_s')) {
            $search = esc_sql($request->get('_s'));
            $query->whereRaw("(comments.comment_content LIKE '%{$search}%' OR comments.comment_name LIKE '%{$search}%')");
        }

        $rows = $query->orderByDesc('comments.comment_id')->limit(50)->get();
        $items = [];
        foreach ($rows as $row) {
            $items[] = [
                'id' => (int)$row->comment_id,
                'author' => $row->comment_name,
                'email' => $row->comment_email,
                'content' => $row->comment_content,
                'status' => $row->status,
                'service_id' => (int)$row->service_id,
                'service_title' => get_translate($row->post_title, 1),
                'public_url' => $type === 'home'
                    ? get_home_permalink($row->service_id, $row->post_slug)
                    : get_experience_permalink($row->service_id, $row->post_slug),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function terms($taxonomy)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $allowed = [
            'home-type',
            'home-amenity',
            'experience-type',
            'experience-languages',
            'experience-inclusions',
            'experience-exclusions',
        ];

        if (!in_array($taxonomy, $allowed, true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $terms = (new Term())->getAllTerms([
            'tax' => $taxonomy,
            'number' => -1,
        ]);

        $items = [];
        foreach ($terms['results'] as $term) {
            $usageCount = (int) DB::table('term_relation')->where('term_id', $term->term_id)->count();
            if ($taxonomy === 'home-type') {
                $usageCount = (int) DB::table('home')->where('home_type', $term->term_id)->count();
            } elseif ($taxonomy === 'experience-type') {
                $usageCount = (int) DB::table('experience')->where('experience_type', $term->term_id)->count();
            }

            $items[] = [
                'id' => (int)$term->term_id,
                'title' => get_translate($term->term_title, 1),
                'name' => $term->term_name,
                'description' => get_translate($term->term_description ?? '', 1),
                'icon' => $term->term_icon ?? '',
                'price' => (float)($term->term_price ?? 0),
                'usage_count' => $usageCount,
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function termSave(Request $request, $taxonomy)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $allowed = [
            'home-type',
            'home-amenity',
            'experience-type',
            'experience-languages',
            'experience-inclusions',
            'experience-exclusions',
        ];

        if (!in_array($taxonomy, $allowed, true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $title = trim((string) $request->get('title', ''));
        if ($title === '') {
            return response()->json(['status' => 0, 'message' => __('Term title is required')], 422);
        }

        $taxonomyRow = (new Taxonomy())->getByName($taxonomy);
        if (!$taxonomyRow) {
            return response()->json(['status' => 0, 'message' => __('Taxonomy is not available')], 404);
        }

        $termId = (int) $request->get('id', 0);
        $slug = trim((string) $request->get('name', $request->get('slug', '')));
        $slug = $slug !== '' ? preg_replace('/\s+/u', '-', $slug) : Str::slug($title);
        $payload = [
            'term_title' => $title,
            'term_name' => $slug,
            'term_description' => (string) $request->get('description', ''),
            'term_icon' => (string) $request->get('icon', ''),
            'term_price' => (float) $request->get('price', 0),
        ];

        $termModel = new Term();
        if ($termId > 0) {
            $updated = $termModel->updateTerm($payload, $termId);
            return response()->json([
                'status' => $updated !== null ? 1 : 0,
                'message' => $updated !== null ? __('Updated Successfully') : __('Have error when saving'),
                'data' => ['id' => $termId],
            ], $updated !== null ? 200 : 422);
        }

        $payload['taxonomy_id'] = (int) $taxonomyRow->taxonomy_id;
        $payload['created_at'] = time();
        $payload['author'] = get_current_user_id();
        $created = $termModel->createTerm($payload);

        return response()->json([
            'status' => $created ? 1 : 0,
            'message' => $created ? __('Created Successfully') : __('Have error when saving'),
            'data' => ['id' => (int) $created],
        ], $created ? 200 : 422);
    }

    public function termDelete($taxonomy, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $term = (new Term())->getById((int) $id);
        if (!$term) {
            return response()->json(['status' => 0, 'message' => __('This term is not available')], 404);
        }

        $taxonomyRow = DB::table('taxonomy')
            ->where('taxonomy_id', $term->taxonomy_id)
            ->where('taxonomy_name', $taxonomy)
            ->first();
        if (!$taxonomyRow) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $deleted = (new Term())->deleteTerm((int) $id);
        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Have error when delete this term'),
        ], $deleted ? 200 : 422);
    }

    public function lastMinuteHomes()
    {
        $user = Sentinel::getUser();

        $hasEndTimeColumn = Schema::hasColumn('last_minute', 'end_time_last');
        $select = 'last_minute.id, last_minute.home_id, last_minute.price, last_minute.last, last_minute.start_time_last, home.post_title, home.post_slug, home.thumbnail_id, home.base_price';
        if ($hasEndTimeColumn) {
            $select .= ', last_minute.end_time_last';
        }

        $query = DB::table('last_minute')
            ->join('home', 'last_minute.home_id', '=', 'home.post_id')
            ->selectRaw($select);

        if ($user && !is_admin()) {
            $query->where('home.author', $user->id);
        }

        $rows = $query->orderByDesc('last_minute.id')->limit(50)->get();
        $items = [];
        $now = time();
        foreach ($rows as $row) {
            $startTimestamp = (int)($row->start_time_last ?? 0);
            $endTimestamp = $hasEndTimeColumn ? (int)($row->end_time_last ?? 0) : 0;
            if ($endTimestamp <= 0 && $startTimestamp > 0) {
                $endTimestamp = strtotime('+1 day', $startTimestamp);
            }
            $durationHours = $startTimestamp > 0 && $endTimestamp > $startTimestamp
                ? max(1, (int)ceil(($endTimestamp - $startTimestamp) / 3600))
                : 24;
            $dealPrice = (float)$row->price;
            $originalPrice = (float)($row->base_price ?? 0);
            $discountPercent = $originalPrice > 0 && $dealPrice > 0 && $dealPrice < $originalPrice
                ? round((($originalPrice - $dealPrice) / $originalPrice) * 100)
                : 0;
            $items[] = [
                'id' => (int)$row->id,
                'home_id' => (int)$row->home_id,
                'title' => get_translate($row->post_title, 1),
                'price' => $dealPrice,
                'original_price' => $originalPrice,
                'discount_percent' => $discountPercent,
                'enabled' => (bool)$row->last,
                'date' => $startTimestamp > 0 ? date('Y-m-d', $startTimestamp) : '',
                'ends_date' => $endTimestamp > 0 ? date('Y-m-d', $endTimestamp) : '',
                'starts_at' => $startTimestamp > 0 ? date('c', $startTimestamp) : '',
                'ends_at' => $endTimestamp > 0 ? date('c', $endTimestamp) : '',
                'starts_at_timestamp' => $startTimestamp,
                'ends_at_timestamp' => $endTimestamp,
                'duration_hours' => $durationHours,
                'remaining_seconds' => $endTimestamp > 0 ? max(0, $endTimestamp - $now) : 0,
                'expired' => $endTimestamp > 0 ? $endTimestamp <= $now : false,
                'thumbnail' => get_attachment_url($row->thumbnail_id) ?? '',
                'public_url' => get_home_permalink($row->home_id, $row->post_slug),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function updateLastMinuteHome(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $query = DB::table('last_minute')
            ->join('home', 'last_minute.home_id', '=', 'home.post_id')
            ->where('last_minute.id', (int)$id)
            ->selectRaw('last_minute.id, last_minute.home_id, home.author');

        $row = $query->first();
        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This deal is not available')], 404);
        }

        if (!is_admin() && (int)$row->author !== (int)$user->id) {
            return response()->json(['status' => 0, 'message' => 'Forbidden'], 403);
        }

        $data = [];
        if ($request->has('enabled')) {
            $data['last'] = filter_var($request->get('enabled'), FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        if ($request->has('price')) {
            $data['price'] = max(0, (float)$request->get('price'));
        }

        $startTimestamp = null;
        if ($request->filled('date')) {
            $timestamp = strtotime($request->get('date') . ' 00:00:00');
            if ($timestamp) {
                $startTimestamp = $timestamp;
                $data['start_time_last'] = $timestamp;
            }
        }

        if ($request->filled('ends_date') && Schema::hasColumn('last_minute', 'end_time_last')) {
            $endTimestamp = strtotime($request->get('ends_date') . ' 23:59:59');
            if ($endTimestamp) {
                if ($startTimestamp && $endTimestamp < $startTimestamp) {
                    return response()->json(['status' => 0, 'message' => __('End date must be after start date')], 422);
                }
                $data['end_time_last'] = $endTimestamp;
            }
        }

        if (empty($data)) {
            return response()->json(['status' => 0, 'message' => __('No changes found')], 422);
        }

        DB::table('last_minute')->where('id', (int)$id)->update($data);

        return response()->json([
            'status' => 1,
            'message' => __('Updated successfully'),
        ]);
    }

    public function centerVote()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $query = DB::table('voits')
            ->join('experience', 'voits.experienceID', '=', 'experience.post_id')
            ->selectRaw('voits.id, voits.experienceID, voits.event_date, voits.image, experience.post_title, experience.post_slug');

        if (!is_admin()) {
            $query->where('experience.author', $user->id);
        }

        $rows = $query->orderByDesc('voits.id')->limit(50)->get();
        $items = [];
        foreach ($rows as $row) {
            $items[] = [
                'id' => (int)$row->id,
                'experience_id' => (int)$row->experienceID,
                'title' => get_translate($row->post_title, 1),
                'event_date' => $row->event_date ?? '',
                'image' => get_attachment_url($row->image) ?? '',
                'public_url' => get_experience_permalink($row->experienceID, $row->post_slug),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function posts(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Post())->getAllPosts([
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
            'status' => $request->filled('status') ? [$request->get('status')] : '',
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int)$row->post_id,
                'title' => get_translate($row->post_title, 1),
                'slug' => $row->post_slug ?? '',
                'status' => $row->status,
                'status_label' => $row->status,
                'thumbnail' => !empty($row->thumbnail_id) ? (get_attachment_url($row->thumbnail_id) ?: '') : '',
                'created_at' => !empty($row->created_at) ? date('Y-m-d', $row->created_at) : '',
                'public_url' => get_the_permalink($row->post_id, $row->post_slug, '', 'post'),
                'legacy_edit_url' => dashboard_url('edit-post', $row->post_id),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'new_url' => dashboard_url('add-new-post'),
                'results' => $items,
            ],
        ]);
    }

    public function postCreate()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $id = (new Post())->createPost();

        return response()->json([
            'status' => 1,
            'message' => __('Created successfully'),
            'data' => [
                'id' => (int)$id,
                'edit_url' => dashboard_url('edit-post', $id),
            ],
        ]);
    }

    public function postStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string)$request->get('status', '');
        if (!in_array($status, ['publish', 'draft', 'trash'], true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $updated = (new Post())->updatePost(['status' => $status], (int)$id);

        return response()->json([
            'status' => $updated !== null ? 1 : 0,
            'message' => $updated !== null ? __('Updated Successfully') : __('Have error when saving'),
        ], $updated !== null ? 200 : 422);
    }

    public function postDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $deleted = (new Post())->deletePost((int)$id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this post'),
        ], $deleted ? 200 : 422);
    }

    public function pagesIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Page())->getAllPages([
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
            'status' => $request->filled('status') ? [$request->get('status')] : [],
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int)$row->post_id,
                'title' => get_translate($row->post_title, 1),
                'slug' => $row->post_slug ?? '',
                'status' => $row->status,
                'status_label' => $row->status,
                'created_at' => !empty($row->created_at) ? date('Y-m-d', $row->created_at) : '',
                'public_url' => get_the_permalink($row->post_id, $row->post_slug, '', 'page'),
                'legacy_edit_url' => dashboard_url('edit-page', $row->post_id),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'new_url' => dashboard_url('add-new-page'),
                'results' => $items,
            ],
        ]);
    }

    public function pageCreate()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $id = (new Page())->createPage();

        return response()->json([
            'status' => 1,
            'message' => __('Created successfully'),
            'data' => [
                'id' => (int)$id,
                'edit_url' => dashboard_url('edit-page', $id),
            ],
        ]);
    }

    public function pageStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string)$request->get('status', '');
        if (!in_array($status, ['publish', 'draft', 'trash'], true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $updated = (new Page())->updatePage(['status' => $status], (int)$id);

        return response()->json([
            'status' => $updated !== null ? 1 : 0,
            'message' => $updated !== null ? __('Updated Successfully') : __('Have error when saving'),
        ], $updated !== null ? 200 : 422);
    }

    public function pageDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $deleted = (new Page())->deletePage((int)$id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this page'),
        ], $deleted ? 200 : 422);
    }

    public function mediaIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(40, max(1, (int)$request->get('per_page', 24)));
        $itemsRaw = (new Media())->listAttachments([
            's' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
        ]);

        $results = [];
        foreach (($itemsRaw ?? []) as $row) {
            $results[] = [
                'id' => (int)$row->media_id,
                'title' => get_translate($row->media_title ?? '', 1),
                'url' => get_attachment_url($row->media_id) ?: '',
                'type' => $row->media_type ?? '',
                'author' => (int)($row->author ?? 0),
                'created_at' => !empty($row->created_at) ? date('Y-m-d', $row->created_at) : '',
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'page' => $page,
                'per_page' => $perPage,
                'results' => $results,
            ],
        ]);
    }

    public function mediaDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $mediaModel = new Media();
        $media = $mediaModel->getById((int)$id);
        if (!$media) {
            return response()->json(['status' => 0, 'message' => __('This media is not available')], 404);
        }

        if (!is_admin() && (int)$media->author !== (int)$user->id) {
            return response()->json(['status' => 0, 'message' => __('This media is not available')], 403);
        }

        $deleted = $mediaModel->deleteAttachment((int)$id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete media'),
        ], $deleted ? 200 : 422);
    }

    public function usersIndex(Request $request)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        [$query, $page, $perPage] = $this->adminUsersQuery($request);
        $total = (clone $query)->count();
        $rows = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'pages' => max(1, (int) ceil($total / $perPage)),
                'results' => $rows->map(fn ($row) => $this->mapDashboardUser($row))->values(),
            ],
        ]);
    }

    public function usersStats()
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $base = $this->baseUsersQuery();
        $roleCount = function ($roles) use ($base) {
            return (clone $base)->whereIn('roles.slug', (array) $roles)->count();
        };

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (clone $base)->count(),
                'active' => (clone $base)->whereRaw("COALESCE(user_status.meta_value, '') NOT IN ('suspended', 'deleted')")->where('activations.completed', 1)->count(),
                'suspended' => (clone $base)->where('user_status.meta_value', 'suspended')->count(),
                'hosts' => $roleCount(['partner', 'host']),
                'guests' => $roleCount(['customer', 'guest']),
            ],
        ]);
    }

    public function userShow($id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $row = $this->baseUsersQuery()->where('users.id', (int) $id)->first();
        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This user does not exist')], 404);
        }

        return response()->json(['status' => 1, 'data' => $this->mapDashboardUserDetail($row)]);
    }

    public function userUpdate(Request $request, $id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $target = get_user_by_id((int) $id);
        if (!$target) {
            return response()->json(['status' => 0, 'message' => __('This user does not exist')], 404);
        }

        $payload = [];
        foreach (['first_name', 'last_name', 'email', 'mobile', 'address', 'location', 'description'] as $key) {
            if ($request->has($key) && Schema::hasColumn('users', $key)) {
                $payload[$key] = (string) $request->get($key, '');
            }
        }

        if (!empty($payload)) {
            (new User())->updateUser((int) $id, $payload);
        }

        $this->logAdminActivity((int) $id, 'update_user', __('User data updated'));

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function userRole(Request $request, $id)
    {
        if (!$this->requireSuperAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        $roleSlug = $this->normalizeAdminRole((string) $request->get('role', ''));
        $role = DB::table('roles')->where('slug', $roleSlug)->first();
        if (!$role) {
            return response()->json(['status' => 0, 'message' => __('Invalid role')], 422);
        }

        $updated = (new User())->updateUserRole((int) $id, (int) $role->id);
        if ($updated) {
            $this->logAdminActivity((int) $id, 'change_role', __('User role changed') . ': ' . $roleSlug);
            $this->notifyUser((int) $id, __('Role updated'), __('Your account role has been updated.'));
        }

        return response()->json([
            'status' => $updated ? 1 : 0,
            'message' => $updated ? __('Updated Successfully') : __('Invalid role'),
        ], $updated ? 200 : 422);
    }

    public function userStatus(Request $request, $id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string) $request->get('status', '');
        if (!in_array($status, ['active', 'suspended', 'inactive'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid status')], 422);
        }

        $ids = (array) $request->get('ids', []);
        if ((int) $id > 0) {
            $ids = [(int) $id];
        }
        $ids = array_values(array_filter(array_map('intval', $ids)));

        foreach ($ids as $targetId) {
            (new User())->updateUserMeta($targetId, 'account_status', $status === 'active' ? '' : $status);
            if ($status === 'active') {
                $target = get_user_by_id($targetId);
                if ($target) {
                    $activation = Activation::create($target);
                    if (is_object($activation)) {
                        Activation::complete($target, $activation->code);
                    }
                }
            }
            $this->logAdminActivity($targetId, 'change_status', __('User status changed') . ': ' . $status);
            $this->notifyUser($targetId, __('Account status updated'), __('Your account status has been updated.'));
        }

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function userNotify(Request $request, $id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $message = trim((string) $request->get('message', ''));
        if ($message === '') {
            return response()->json(['status' => 0, 'message' => __('Message is required')], 422);
        }

        $this->notifyUser((int) $id, (string) $request->get('title', __('Admin notification')), $message);
        $this->logAdminActivity((int) $id, 'send_notification', __('Notification sent by admin'));

        return response()->json(['status' => 1, 'message' => __('Sent successfully')]);
    }

    public function userActivity($id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json(['status' => 1, 'data' => $this->userActivityItems((int) $id)]);
    }

    public function usersExport(Request $request)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        [$query] = $this->adminUsersQuery($request, 10000);
        $rows = $query->limit(10000)->get();
        $csv = "id,name,email,mobile,role,status,created_at\n";
        foreach ($rows as $row) {
            $item = $this->mapDashboardUser($row);
            $csv .= implode(',', array_map(fn ($value) => '"' . str_replace('"', '""', (string) $value) . '"', [
                $item['id'],
                $item['name'],
                $item['email'],
                $item['mobile'],
                $item['role_slug'],
                $item['status'],
                $item['created_at'],
            ])) . "\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="users.csv"',
        ]);
    }

    public function partnerRequestsIndex(Request $request)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        [$query, $page, $perPage] = $this->adminPartnerRequestsQuery($request);
        $total = (clone $query)->count();
        $rows = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'pages' => max(1, (int) ceil($total / $perPage)),
                'results' => $rows->map(fn ($row) => $this->mapPartnerRequest($row))->values(),
            ],
        ]);
    }

    public function partnerRequestsStats()
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $base = $this->basePartnerRequestsQuery();
        $monthStart = strtotime(date('Y-m-01 00:00:00'));

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (clone $base)->count(),
                'pending' => (clone $base)->where(function ($query) {
                    $query->whereNull('agreement.status')->orWhere('agreement.status', 0);
                })->count(),
                'approved' => (clone $base)->where('agreement.status', 1)->count(),
                'rejected' => (clone $base)->where('agreement.status', -1)->count(),
                'this_month' => (clone $base)->where('users.created_at', '>=', date('Y-m-d H:i:s', $monthStart))->count(),
            ],
        ]);
    }

    public function partnerRequestShow($id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $row = $this->basePartnerRequestsQuery()->where('users.id', (int) $id)->first();
        if (!$row) {
            return response()->json(['status' => 0, 'message' => __('This request is not available')], 404);
        }

        return response()->json(['status' => 1, 'data' => $this->mapPartnerRequestDetail($row)]);
    }

    public function userApprove($id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $target = get_user_by_id((int)$id);
        if (!$target || empty($target->request)) {
            return response()->json(['status' => 0, 'message' => __('There is no request from this account')], 422);
        }

        $userModel = new User();
        $approved = false;
        if ($target->request === 'request_a_partner') {
            $approved = $userModel->updateUserRole((int)$id, 2);
        } elseif ($target->request === 'request_a_customer') {
            $approved = $userModel->updateUserRole((int)$id, 3);
        }

        if ($approved) {
            $activation = Activation::create($target);
            if (is_object($activation)) {
                Activation::complete($target, $activation->code);
            }
            $userModel->updateUser((int)$id, ['request' => 'approved']);
            if (Schema::hasTable('agreement')) {
                DB::table('agreement')->where('user_id', (int) $id)->update(['status' => 1]);
            }
            $this->notifyUser((int) $id, __('Partner request approved'), __('Your partner request has been approved.'));
            $this->logAdminActivity((int) $id, 'approve_partner', __('Partner request approved'));
            do_action('hh_approved_partner', $target, $target->request);
        }

        return response()->json([
            'status' => $approved ? 1 : 0,
            'message' => $approved ? __('Approved successfully') : __('Has error when approve this user.'),
        ], $approved ? 200 : 422);
    }

    public function userDelete($id)
    {
        if (!$this->requireSuperAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        $target = get_user_by_id((int)$id);
        if (!$target) {
            return response()->json(['status' => 0, 'message' => __('This user does not exist')], 404);
        }

        (new User())->updateUserMeta((int) $id, 'account_status', 'deleted');
        if (Schema::hasColumn('users', 'request')) {
            (new User())->updateUser((int) $id, ['request' => 'deleted']);
        }
        $this->logAdminActivity((int) $id, 'delete_user', __('User soft deleted'));

        return response()->json([
            'status' => 1,
            'message' => __('Deleted successfully'),
        ]);
    }

    public function partnerRequestStatus(Request $request, $id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string) $request->get('status', '');
        $reason = trim((string) $request->get('reason', ''));
        if (!in_array($status, ['approved', 'rejected', 'pending', 'suspended', 'info_requested'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid status')], 422);
        }
        if ($status === 'rejected' && $reason === '') {
            return response()->json(['status' => 0, 'message' => __('Reason is required')], 422);
        }

        if ($status === 'approved') {
            return $this->userApprove($id);
        }

        $agreementStatus = ['rejected' => -1, 'pending' => 0, 'suspended' => 2, 'info_requested' => 3][$status];
        if (Schema::hasTable('agreement')) {
            DB::table('agreement')->where('user_id', (int) $id)->update(['status' => $agreementStatus]);
        }
        (new User())->updateUserMeta((int) $id, [
            'partner_request_reason' => $reason,
            'partner_request_priority' => (string) $request->get('priority', 'normal'),
        ]);

        $title = $status === 'rejected' ? __('Partner request rejected') : __('Partner request updated');
        $this->notifyUser((int) $id, $title, $reason ?: __('Your partner request status has been updated.'));
        $this->logAdminActivity((int) $id, 'partner_request_' . $status, $reason ?: __('Partner request status updated'));

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function partnerDocumentStatus(Request $request, $id, $docId)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string) $request->get('status', '');
        if (!in_array($status, ['verified', 'rejected', 'pending'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid status')], 422);
        }

        (new User())->updateUserMeta((int) $id, 'partner_document_' . preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $docId), $status);
        $this->logAdminActivity((int) $id, 'document_' . $status, __('Document status updated') . ': ' . $docId);

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function partnerNote(Request $request, $id)
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $note = trim((string) $request->get('note', ''));
        if ($note === '') {
            return response()->json(['status' => 0, 'message' => __('Note is required')], 422);
        }

        $this->logAdminActivity((int) $id, 'partner_note', $note);

        return response()->json(['status' => 1, 'message' => __('Saved Successfully')]);
    }

    public function partnerMessage(Request $request, $id)
    {
        return $this->userNotify($request, $id);
    }

    public function partnerActivity($id)
    {
        return $this->userActivity($id);
    }

    public function permissionsMatrix()
    {
        if (!$this->requireAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json(['status' => 1, 'data' => $this->permissionsMatrixData()]);
    }

    public function permissionsMatrixSave(Request $request)
    {
        if (!$this->requireSuperAdmin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        $matrix = $request->get('matrix', []);
        if (!is_array($matrix)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        update_opt('dashboard_permissions_matrix', json_encode($matrix, JSON_UNESCAPED_UNICODE));

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function couponsIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Coupon())->getAllCoupons([
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
            'status' => $request->get('status', ''),
            'author' => is_admin() ? '' : $user->id,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int)$row->coupon_id,
                'code' => $row->coupon_code,
                'description' => get_translate($row->coupon_description ?? '', 1),
                'price_type' => $row->price_type ?? '',
                'price' => (float)($row->coupon_price ?? 0),
                'status' => $row->status ?? 'off',
                'start_date' => !empty($row->start_time) ? date('Y-m-d', $row->start_time) : '',
                'end_date' => !empty($row->end_time) ? date('Y-m-d', $row->end_time) : '',
                'service_type' => $row->service_type ?? '',
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'results' => $items,
            ],
        ]);
    }

    public function couponSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $code = strtoupper(trim((string)$request->get('code', '')));
        if ($code === '') {
            return response()->json(['status' => 0, 'message' => __('Coupon code is required')], 422);
        }

        $priceType = (string)$request->get('price_type', 'fixed');
        if (!in_array($priceType, ['fixed', 'percent'], true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $status = (string)$request->get('status', 'on');
        if (!in_array($status, ['on', 'off'], true)) {
            $status = 'on';
        }

        $serviceType = (string)$request->get('service_type', '');
        if (!in_array($serviceType, ['', 'home', 'experience', 'car'], true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $startDate = (string)$request->get('start_date', '');
        $endDate = (string)$request->get('end_date', '');
        $startTime = $startDate !== '' ? strtotime($startDate . ' 00:00:00') : 0;
        $endTime = $endDate !== '' ? strtotime($endDate . ' 23:59:59') : 0;
        if ($startTime && $endTime && $endTime < $startTime) {
            return response()->json(['status' => 0, 'message' => __('End date must be after start date')], 422);
        }

        $couponId = (int)$request->get('id', 0);
        $couponModel = new Coupon();
        $existing = $couponModel->getByCode($code);
        if ($existing && (int)$existing->coupon_id !== $couponId) {
            return response()->json(['status' => 0, 'message' => __('Coupon code already exists')], 422);
        }

        $payload = [
            'coupon_code' => $code,
            'coupon_description' => (string)$request->get('description', ''),
            'price_type' => $priceType,
            'coupon_price' => max(0, (float)$request->get('price', 0)),
            'start_time' => $startTime ?: '',
            'end_time' => $endTime ?: '',
            'service_type' => $serviceType,
            'status' => $status,
        ];

        if ($couponId > 0) {
            $updated = $couponModel->updateCoupon($payload, $couponId);
            return response()->json([
                'status' => $updated !== false ? 1 : 0,
                'message' => $updated !== false ? __('Updated Successfully') : __('Can not update this coupon'),
                'data' => ['id' => $couponId],
            ], $updated !== false ? 200 : 422);
        }

        $payload['author'] = get_current_user_id();
        $payload['created_at'] = time();
        $created = $couponModel->createCoupon($payload);

        return response()->json([
            'status' => $created ? 1 : 0,
            'message' => $created ? __('Created Successfully') : __('Can not create new coupon'),
            'data' => ['id' => (int)$created],
        ], $created ? 200 : 422);
    }

    public function couponStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string)$request->get('status', '');
        if (!in_array($status, ['on', 'off'], true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $updated = (new Coupon())->updateCoupon(['status' => $status], (int)$id);

        return response()->json([
            'status' => $updated ? 1 : 0,
            'message' => $updated ? __('Updated Successfully') : __('Can not update this coupon'),
        ], $updated ? 200 : 422);
    }

    public function couponDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $deleted = (new Coupon())->deleteCoupon((int)$id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this coupon'),
        ], $deleted ? 200 : 422);
    }

    public function payoutsIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(24, max(1, (int)$request->get('per_page', 12)));
        $result = (new Payout())->getAllPayout([
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
            'status' => $request->get('status', ''),
            'user_id' => is_admin() ? '' : $user->id,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = $this->mapPayout($row);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int)$result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'results' => $items,
            ],
        ]);
    }

    public function payoutShow($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $item = (new Payout())->getPayout((int)$id);
        if (!$item || (!is_admin() && (int)$item->user_id !== (int)$user->id)) {
            return response()->json(['status' => 0, 'message' => __('This payout is not available')], 404);
        }

        return response()->json([
            'status' => 1,
            'data' => $this->mapPayout($item),
        ]);
    }

    public function payoutStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string)$request->get('status', '');
        if (!in_array($status, ['pending', 'completed'], true)) {
            return response()->json(['status' => 0, 'message' => __('This action is invalid')], 422);
        }

        $updated = (new Payout())->updatePayout((int)$id, ['status' => $status]);

        return response()->json([
            'status' => $updated !== null ? 1 : 0,
            'message' => $updated !== null ? __('Updated successfully') : __('This action is invalid'),
        ], $updated !== null ? 200 : 422);
    }

    public function payoutDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $deleted = (new Payout())->deletePayout((int)$id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('This item is not available'),
        ], $deleted ? 200 : 422);
    }

    private function dashboardContext($userId)
    {
        if (is_partner()) {
            return ['role' => 'partner', 'column' => 'owner', 'user_id' => $userId];
        }

        if (is_customer()) {
            return ['role' => 'customer', 'column' => 'buyer', 'user_id' => $userId];
        }

        return ['role' => 'admin', 'column' => null, 'user_id' => $userId];
    }

    private function bookingQuery(array $context)
    {
        $query = DB::table((new Booking())->getTable());

        if (!empty($context['column'])) {
            $query->where($context['column'], $context['user_id']);
        }

        return $query;
    }

    private function applyBookingFilters($query, Request $request, $skipStatus = false)
    {
        if (!$skipStatus && $request->filled('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            if ($status === 'upcoming') {
                $query->where(function ($nested) {
                    $nested
                        ->whereIn('status', ['pending', 'incomplete'])
                        ->orWhere(function ($dateQuery) {
                            $dateQuery->where('status', '!=', 'canceled')->where('start_date', '>', time());
                        });
                });
            } elseif ($status === 'active') {
                $query
                    ->where('status', '!=', 'canceled')
                    ->where('start_date', '<=', time())
                    ->where('end_date', '>=', time());
            } elseif ($status === 'pending') {
                $query->whereIn('status', ['pending', 'incomplete']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            $query->where(function ($nested) use ($search) {
                $nested
                    ->where('booking_id', 'like', '%' . $search . '%')
                    ->orWhere('booking_description', 'like', '%' . $search . '%')
                    ->orWhere('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('dateFrom')) {
            $timestamp = strtotime($request->get('dateFrom') . ' 00:00:00');
            if ($timestamp) {
                $query->where('start_date', '>=', $timestamp);
            }
        }

        if ($request->filled('dateTo')) {
            $timestamp = strtotime($request->get('dateTo') . ' 23:59:59');
            if ($timestamp) {
                $query->where('end_date', '<=', $timestamp);
            }
        }

        if ($request->filled('listingType') && $request->get('listingType') !== 'all') {
            $listingType = $request->get('listingType') === 'service' ? 'car' : $request->get('listingType');
            $query->where('service_type', $listingType);
        }

        if ($request->filled('paymentMethod') && $request->get('paymentMethod') !== 'all') {
            $query->where('payment_type', $request->get('paymentMethod'));
        }

        if ($request->filled('minPrice')) {
            $query->where('total', '>=', (float)$request->get('minPrice'));
        }

        if ($request->filled('maxPrice')) {
            $query->where('total', '<=', (float)$request->get('maxPrice'));
        }
    }

    private function mapBooking($row)
    {
        $publicType = $row->service_type === 'car' ? 'service' : $row->service_type;
        $service = get_post($row->service_id, $row->service_type);
        $title = $service ? get_translate($service->post_title, 1) : ($row->booking_description ?? 'حجز');
        $slug = $service->post_slug ?? '';

        return [
            'id' => (int)$row->ID,
            'booking_id' => $row->booking_id,
            'status' => $row->status,
            'service_id' => (int)$row->service_id,
            'service_type' => $publicType,
            'service_title' => $title,
            'service_slug' => $slug,
            'service_image' => $service ? (get_attachment_url($service->thumbnail_id) ?? '') : '',
            'service_city' => $service ? get_translate($service->location_city ?? '', 1) : '',
            'service_path' => '/' . ($publicType === 'service' ? 'car' : $publicType) . '/' . $row->service_id . (!empty($slug) ? '/' . $slug : ''),
            'guests_count' => (int)($row->number_of_guest ?? 0),
            'total' => (float)($row->total ?? 0),
            'currency' => get_option('currency', 'SR'),
            'payment_type' => $row->payment_type ?? '',
            'start_date' => !empty($row->start_date) ? date('Y-m-d', $row->start_date) : '',
            'end_date' => !empty($row->end_date) ? date('Y-m-d', $row->end_date) : '',
            'created_at' => !empty($row->created_date) ? date('Y-m-d', $row->created_date) : '',
        ];
    }

    private function mapBookingDetail($row)
    {
        $summary = $this->mapBooking($row);
        $bookingData = get_booking_data($row->ID, '', $row->service_type);
        $serviceObject = get_booking_data($row->ID, 'serviceObject', $row->service_type);
        $paymentObject = get_payments($row->payment_type);
        $owner = !empty($row->owner) ? get_user_by_id($row->owner) : null;
        $customer = !empty($row->buyer) ? get_user_by_id($row->buyer) : null;
        $status = booking_status_info($row->status);

        $invoiceItems = [
            [
                'label' => __('Base Price'),
                'value' => (float)($bookingData['basePrice'] ?? 0),
            ],
        ];

        $extraPrice = (float)($bookingData['extraPrice'] ?? 0);
        if ($extraPrice > 0) {
            $invoiceItems[] = [
                'label' => __('Extra'),
                'value' => $extraPrice,
            ];
        }

        if (!empty($bookingData['equipmentPrice'])) {
            $invoiceItems[] = [
                'label' => __('Equipment Price'),
                'value' => (float)$bookingData['equipmentPrice'],
            ];
        }

        if (!empty($bookingData['insurancePrice'])) {
            $invoiceItems[] = [
                'label' => __('Insurance Price'),
                'value' => (float)$bookingData['insurancePrice'],
            ];
        }

        return array_merge($summary, [
            'confirm_status' => $row->confirm ?? '',
            'is_confirmed' => ($row->confirm ?? '') === 'confirmed',
            'status_label' => __($status['label'] ?? $row->status),
            'payment_method' => $paymentObject ? $paymentObject::getName() : __('Not Available'),
            'payment_follow_up' => [
                'status' => $row->status,
                'label' => __($status['label'] ?? $row->status),
                'message' => $this->paymentFollowUpMessage($row->status, $row->payment_type ?? ''),
                'legacy_url' => dashboard_url('bookings/' . $row->ID),
            ],
            'customer' => [
                'first_name' => $row->first_name ?? '',
                'last_name' => $row->last_name ?? '',
                'email' => $row->email ?? '',
                'phone' => $row->phone ?? '',
                'address' => $row->address ?? '',
                'note' => $row->note ?? '',
            ],
            'owner' => [
                'name' => $owner ? get_username($owner->id) : '',
                'email' => $owner->email ?? '',
                'phone' => $owner->mobile ?? '',
                'address' => $owner->address ?? '',
            ],
            'invoice' => [
                'booking_id' => $row->booking_id,
                'service_name' => $serviceObject ? get_translate($serviceObject->post_title, 1) : $summary['service_title'],
                'guests_count' => (int)($bookingData['cartData']['numberGuest'] ?? $row->number_of_guest ?? 0),
                'currency' => get_option('currency', 'SR'),
                'payment_method' => $paymentObject ? $paymentObject::getName() : __('Not Available'),
                'status' => $row->status,
                'status_label' => __($status['label'] ?? $row->status),
                'date_range' => [
                    'start_date' => !empty($row->start_date) ? date('Y-m-d', $row->start_date) : '',
                    'end_date' => !empty($row->end_date) ? date('Y-m-d', $row->end_date) : '',
                    'start_time' => !empty($row->start_time) ? date('H:i', $row->start_time) : '',
                    'end_time' => !empty($row->end_time) ? date('H:i', $row->end_time) : '',
                ],
                'line_items' => $invoiceItems,
                'tax_percent' => (float)($bookingData['tax']['tax'] ?? 0),
                'commission_percent' => (float)($bookingData['commission']['Commission'] ?? 0),
                'subtotal' => (float)($bookingData['subTotal'] ?? $row->total ?? 0),
                'total' => (float)($row->total ?? 0),
            ],
        ]);
    }

    private function paymentFollowUpMessage($status, $paymentType)
    {
        if ($status === 'completed') {
            return __('Payment completed successfully and the booking is now active.');
        }

        if ($status === 'canceled') {
            return __('This booking was canceled. No further payment follow-up is required.');
        }

        if ($status === 'pending') {
            return __('The payment is still pending. Review the booking status again or continue follow-up from the legacy dashboard if required by the gateway.');
        }

        if ($status === 'incomplete') {
            return __('The payment has not been confirmed yet. Use the legacy flow if this gateway requires a callback or manual reconciliation.');
        }

        return __('Follow up this booking from the dashboard until payment status changes.');
    }

    private function authorizedService($type, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return null;
        }

        $service = get_post($id, $type);
        if (!is_object($service)) {
            return null;
        }

        return user_can_edit_service($service) ? $service : null;
    }

    private function updateManagedServiceStatus($type, $id, $status)
    {
        $allowed = ['publish', 'pending', 'draft', 'trash'];
        if (!in_array($status, $allowed, true)) {
            return response()->json(['status' => 0, 'message' => __('The data is invalid')], 422);
        }

        $service = $this->authorizedService($type, $id);
        if (!$service) {
            return response()->json(['status' => 0, 'message' => __('This service is not available')], 404);
        }

        $updated = $type === 'home'
            ? (new Home())->updateStatus($id, $status)
            : (new Experience())->updateStatus($id, $status);

        return response()->json([
            'status' => $updated !== null ? 1 : 0,
            'message' => $updated !== null ? __('Updated Successfully') : __('Have error when saving'),
        ], $updated !== null ? 200 : 422);
    }

    private function duplicateManagedService($type, $id)
    {
        $service = $this->authorizedService($type, $id);
        if (!$service) {
            return response()->json(['status' => 0, 'message' => __('This service is not available')], 404);
        }

        $newId = $type === 'home'
            ? (new Home())->duplicate($id)
            : (new Experience())->duplicate($id);

        return response()->json([
            'status' => $newId ? 1 : 0,
            'message' => $newId
                ? ($type === 'home' ? __('Duplicated new home successful') : __('Duplicated new experience successful'))
                : __('Can not duplicate'),
            'new_id' => $newId ?: null,
        ], $newId ? 200 : 422);
    }

    private function deleteManagedService($type, $id)
    {
        $service = $this->authorizedService($type, $id);
        if (!$service) {
            return response()->json(['status' => 0, 'message' => __('This service is not available')], 404);
        }

        $deleted = $type === 'home'
            ? (new Home())->deleteHomeItem($id)
            : (new Experience())->deleteExperienceItem($id);

        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Successfully Deleted') : __('Has error when delete this service'),
        ], $deleted ? 200 : 422);
    }

    private function mapManagedServiceItem($row, $type)
    {
        $isHome = $type === 'home';
        $thumbnailId = $isHome ? get_home_thumbnail_id($row->post_id) : get_experience_thumbnail_id($row->post_id);
        $termId = $isHome ? ($row->home_type ?? null) : ($row->experience_type ?? null);
        $term = $termId ? get_term_by('term_id', $termId) : null;
        $statusInfo = service_status_info($row->status);

        return [
            'id' => (int)$row->post_id,
            'title' => get_translate($row->post_title, 1),
            'slug' => $row->post_slug ?? '',
            'status' => $row->status,
            'status_label' => __($statusInfo['name'] ?? $row->status),
            'price' => (float)($row->base_price ?? 0),
            'currency' => get_option('currency', 'SR'),
            'guests' => (int)($row->number_of_guest ?? 0),
            'thumbnail' => $thumbnailId ? (get_attachment_url($thumbnailId) ?: '') : '',
            'type_label' => $term ? get_translate($term->term_title, 1) : '',
            'public_url' => $isHome
                ? get_home_permalink($row->post_id, $row->post_slug)
                : get_experience_permalink($row->post_id, $row->post_slug),
            'legacy_edit_url' => $isHome
                ? dashboard_url('services/homes/' . $row->post_id . '/edit')
                : dashboard_url('services/experiences/' . $row->post_id . '/edit'),
        ];
    }

    private function requireAdmin()
    {
        $user = Sentinel::getUser();
        return $user && is_admin();
    }

    private function requireSuperAdmin()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return false;
        }

        $role = (new User())->getUserRole($user->id);
        return !$role || in_array($role->slug, ['superadmin', 'administrator', 'admin'], true);
    }

    private function normalizeAdminRole($role)
    {
        $map = [
            'guest' => 'customer',
            'host' => 'partner',
            'admin' => 'administrator',
            'superadmin' => 'administrator',
        ];

        return $map[$role] ?? $role;
    }

    private function publicRoleSlug($role)
    {
        $map = [
            'customer' => 'guest',
            'administrator' => 'admin',
        ];

        return $map[$role] ?? ($role ?: 'guest');
    }

    private function baseUsersQuery()
    {
        $query = DB::table('users')
            ->join('role_users', 'users.id', '=', 'role_users.user_id')
            ->join('roles', 'role_users.role_id', '=', 'roles.id')
            ->leftJoin('activations', 'users.id', '=', 'activations.user_id')
            ->leftJoin('usermeta as user_status', function ($join) {
                $join->on('users.id', '=', 'user_status.user_id')->where('user_status.meta_key', '=', 'account_status');
            })
            ->selectRaw('users.*, roles.slug as role_slug, roles.name as role_name, activations.completed as activation_completed, user_status.meta_value as account_status');

        return $query;
    }

    private function adminUsersQuery(Request $request, $forcedPerPage = null)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = $forcedPerPage ?: min(50, max(1, (int) $request->get('per_page', 12)));
        $query = $this->baseUsersQuery();

        $search = trim((string) ($request->get('search', $request->get('_s', ''))));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                $nested
                    ->where('users.email', 'like', '%' . $search . '%')
                    ->orWhere('users.mobile', 'like', '%' . $search . '%')
                    ->orWhere('users.first_name', 'like', '%' . $search . '%')
                    ->orWhere('users.last_name', 'like', '%' . $search . '%');
                if (is_numeric($search)) {
                    $nested->orWhere('users.id', (int) $search);
                }
            });
        }

        $role = (string) $request->get('role', '');
        if ($role !== '' && $role !== 'all') {
            $query->where('roles.slug', $this->normalizeAdminRole($role));
        }

        $status = (string) $request->get('status', '');
        if ($status === 'active') {
            $query->whereRaw("COALESCE(user_status.meta_value, '') NOT IN ('suspended', 'deleted')")->where('activations.completed', 1);
        } elseif ($status === 'suspended') {
            $query->where('user_status.meta_value', 'suspended');
        } elseif ($status === 'inactive') {
            $query->where(function ($nested) {
                $nested->whereNull('activations.completed')->orWhere('activations.completed', 0);
            });
        } elseif ($status === 'deleted') {
            $query->where('user_status.meta_value', 'deleted');
        } else {
            $query->whereRaw("COALESCE(user_status.meta_value, '') != 'deleted'");
        }

        $verification = (string) $request->get('verification', '');
        if ($verification === 'verified') {
            $query->where('activations.completed', 1);
        } elseif ($verification === 'unverified') {
            $query->where(function ($nested) {
                $nested->whereNull('activations.completed')->orWhere('activations.completed', 0);
            });
        }

        if ($request->filled('date_from')) {
            $query->where('users.created_at', '>=', $request->get('date_from') . ' 00:00:00');
        }
        if ($request->filled('date_to')) {
            $query->where('users.created_at', '<=', $request->get('date_to') . ' 23:59:59');
        }

        $sort = (string) $request->get('sort', 'newest');
        if ($sort === 'oldest') {
            $query->orderBy('users.id');
        } elseif ($sort === 'bookings') {
            $query->orderByDesc(DB::raw('(select count(*) from home_booking where home_booking.buyer = users.id)'));
        } else {
            $query->orderByDesc('users.id');
        }

        return [$query, $page, $perPage];
    }

    private function basePartnerRequestsQuery()
    {
        $query = $this->baseUsersQuery()
            ->leftJoin('agreement', 'users.id', '=', 'agreement.user_id')
            ->addSelect(DB::raw('agreement.id as agreement_id, agreement.status as agreement_status'))
            ->whereIn('users.request', ['request_a_partner', 'request_a_customer', 'approved']);

        return $query;
    }

    private function adminPartnerRequestsQuery(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(50, max(1, (int) $request->get('per_page', 10)));
        $query = $this->basePartnerRequestsQuery();

        $search = trim((string) ($request->get('search', $request->get('_s', ''))));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                $nested
                    ->where('users.email', 'like', '%' . $search . '%')
                    ->orWhere('users.mobile', 'like', '%' . $search . '%')
                    ->orWhere('users.first_name', 'like', '%' . $search . '%')
                    ->orWhere('users.last_name', 'like', '%' . $search . '%');
            });
        }

        $status = (string) $request->get('status', '');
        if ($status === 'pending') {
            $query->where(function ($nested) {
                $nested->whereNull('agreement.status')->orWhere('agreement.status', 0);
            });
        } elseif ($status === 'approved') {
            $query->where('agreement.status', 1);
        } elseif ($status === 'rejected') {
            $query->where('agreement.status', -1);
        } elseif ($status === 'suspended') {
            $query->where('agreement.status', 2);
        }

        $type = (string) $request->get('partner_type', '');
        if ($type === 'host') {
            $query->where('users.request', 'request_a_partner');
        } elseif ($type !== '' && $type !== 'all') {
            $query->where('users.request', 'request_a_customer');
        }

        if ($request->filled('date_from')) {
            $query->where('users.created_at', '>=', $request->get('date_from') . ' 00:00:00');
        }
        if ($request->filled('date_to')) {
            $query->where('users.created_at', '<=', $request->get('date_to') . ' 23:59:59');
        }

        $sort = (string) $request->get('sort', 'newest');
        $query->orderBy($sort === 'oldest' ? 'users.id' : 'users.id', $sort === 'oldest' ? 'asc' : 'desc');

        return [$query, $page, $perPage];
    }

    private function userStatusLabel($row)
    {
        if (($row->account_status ?? '') === 'suspended') {
            return 'suspended';
        }
        if (($row->account_status ?? '') === 'deleted') {
            return 'deleted';
        }
        if ((int) ($row->activation_completed ?? 0) !== 1) {
            return 'inactive';
        }

        return 'active';
    }

    private function userBookingsCount($userId)
    {
        return Schema::hasTable('home_booking')
            ? (int) DB::table('home_booking')->where('buyer', $userId)->count()
            : 0;
    }

    private function userListingsCount($userId)
    {
        $homeCount = Schema::hasTable('home') ? DB::table('home')->where('author', $userId)->count() : 0;
        $experienceCount = Schema::hasTable('experience') ? DB::table('experience')->where('author', $userId)->count() : 0;

        return (int) $homeCount + (int) $experienceCount;
    }

    private function userMetaMap($userId)
    {
        return DB::table('usermeta')->where('user_id', $userId)->pluck('meta_value', 'meta_key')->toArray();
    }

    private function userActivityItems($userId)
    {
        $items = [];
        $user = get_user_by_id($userId);
        if ($user && !empty($user->last_login)) {
            $items[] = ['type' => 'login', 'title' => __('Last login'), 'description' => __('Login recorded by Sentinel'), 'date' => (string) $user->last_login];
        }

        $stored = get_user_meta($userId, 'admin_activity_log', []);
        if (is_string($stored)) {
            $decoded = @json_decode($stored, true);
            $stored = is_array($decoded) ? $decoded : [];
        }
        if (is_array($stored)) {
            $items = array_merge($items, $stored);
        }

        if (Schema::hasTable('home_booking')) {
            $bookings = DB::table('home_booking')->where('buyer', $userId)->orderByDesc('ID')->limit(3)->get();
            foreach ($bookings as $booking) {
                $items[] = [
                    'type' => 'booking',
                    'title' => __('Booking') . ' #' . $booking->booking_id,
                    'description' => $booking->booking_description ?? '',
                    'date' => !empty($booking->created_date) ? date('Y-m-d H:i', $booking->created_date) : '',
                ];
            }
        }

        return array_slice($items, 0, 12);
    }

    private function logAdminActivity($userId, $type, $description)
    {
        $current = Sentinel::getUser();
        $items = $this->userActivityItems($userId);
        array_unshift($items, [
            'type' => $type,
            'title' => $description,
            'description' => $current ? __('By') . ' ' . get_username($current->id) : '',
            'date' => date('Y-m-d H:i'),
        ]);
        (new User())->updateUserMeta($userId, 'admin_activity_log', json_encode(array_slice($items, 0, 30), JSON_UNESCAPED_UNICODE));
    }

    private function notifyUser($userId, $title, $message)
    {
        if (!Schema::hasTable('notification')) {
            return;
        }

        DB::table('notification')->insert([
            'user_from' => get_current_user_id() ?: 0,
            'user_to' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => 'admin',
            'created_at' => time(),
        ]);
    }

    private function userMiniBookings($userId)
    {
        if (!Schema::hasTable('home_booking')) {
            return [];
        }

        return DB::table('home_booking')
            ->where('buyer', $userId)
            ->orderByDesc('ID')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->ID,
                'title' => $row->booking_description ?: __('Booking') . ' #' . $row->booking_id,
                'dates' => (!empty($row->start_date) ? date('Y-m-d', $row->start_date) : '') . ' - ' . (!empty($row->end_date) ? date('Y-m-d', $row->end_date) : ''),
                'status' => $row->status,
                'price' => (float) $row->total,
                'currency' => $row->currency ?: get_option('currency', 'SR'),
            ])
            ->values()
            ->all();
    }

    private function userMiniListings($userId)
    {
        $items = [];
        if (Schema::hasTable('home')) {
            $homes = DB::table('home')->where('author', $userId)->orderByDesc('post_id')->limit(5)->get();
            foreach ($homes as $row) {
                $items[] = [
                    'id' => (int) $row->post_id,
                    'title' => get_translate($row->post_title, 1),
                    'status' => $row->status,
                    'price' => (float) ($row->base_price ?? 0),
                    'image' => !empty($row->thumbnail_id) ? (get_attachment_url($row->thumbnail_id) ?: '') : '',
                ];
            }
        }

        return array_slice($items, 0, 5);
    }

    private function userTransactions($userId)
    {
        $spent = Schema::hasTable('home_booking') ? (float) DB::table('home_booking')->where('buyer', $userId)->sum('total') : 0;
        $earned = Schema::hasTable('home_booking') ? (float) DB::table('home_booking')->where('owner', $userId)->sum('total') : 0;

        return [
            'total_spent' => $spent,
            'total_earned' => $earned,
            'methods' => ['cash', 'bank_transfer'],
            'transactions' => $this->userMiniBookings($userId),
        ];
    }

    private function mapDashboardUser($row)
    {
        $name = trim(($row->first_name ?? '') . ' ' . ($row->last_name ?? ''));
        $avatar = !empty($row->avatar) ? (get_attachment_url($row->avatar) ?: '') : '';
        $roleSlug = $this->publicRoleSlug($row->role_slug ?? '');

        return [
            'id' => (int)$row->id,
            'name' => $name,
            'email' => $row->email ?? '',
            'mobile' => $row->mobile ?? '',
            'phone' => $row->mobile ?? '',
            'avatar' => $avatar,
            'role' => $row->role_name ?? '',
            'role_slug' => $roleSlug,
            'request' => $row->request ?? '',
            'status' => $this->userStatusLabel($row),
            'email_verified' => (int) ($row->activation_completed ?? 0) === 1,
            'phone_verified' => !empty($row->mobile),
            'identity_verified' => false,
            'bookings_count' => $this->userBookingsCount((int) $row->id),
            'listings_count' => $this->userListingsCount((int) $row->id),
            'rating' => 0,
            'created_at' => !empty($row->created_at) ? date('Y-m-d', strtotime((string) $row->created_at)) : '',
            'last_login' => !empty($row->last_login) ? date('Y-m-d H:i', strtotime((string) $row->last_login)) : '',
        ];
    }

    private function mapDashboardUserDetail($row)
    {
        $summary = $this->mapDashboardUser($row);
        $meta = $this->userMetaMap((int) $row->id);

        return array_merge($summary, [
            'country' => $row->location ?? ($meta['country'] ?? ''),
            'language' => $meta['language'] ?? get_option('site_language', 'ar'),
            'nationality' => $meta['nationality'] ?? '',
            'birth_date' => $meta['birth_date'] ?? '',
            'address' => $row->address ?? '',
            'description' => $row->description ?? '',
            'permissions' => $this->rolePermissions($summary['role_slug']),
            'bookings' => $this->userMiniBookings((int) $row->id),
            'listings' => $this->userMiniListings((int) $row->id),
            'payments' => $this->userTransactions((int) $row->id),
            'activity' => $this->userActivityItems((int) $row->id),
        ]);
    }

    private function mapPartnerRequest($row)
    {
        $user = $this->mapDashboardUser($row);
        $status = 'pending';
        if ((int) ($row->agreement_status ?? 0) === 1) {
            $status = 'approved';
        } elseif ((int) ($row->agreement_status ?? 0) === -1) {
            $status = 'rejected';
        } elseif ((int) ($row->agreement_status ?? 0) === 2) {
            $status = 'suspended';
        }

        return array_merge($user, [
            'request_status' => $status,
            'partner_type' => ($row->request ?? '') === 'request_a_partner' ? 'host' : 'partner',
            'company_name' => get_user_meta((int) $row->id, 'company_name', ''),
            'submitted_at' => $user['created_at'],
        ]);
    }

    private function mapPartnerRequestDetail($row)
    {
        $summary = $this->mapPartnerRequest($row);
        $meta = $this->userMetaMap((int) $row->id);
        $maskedId = !empty($meta['national_id']) ? substr($meta['national_id'], 0, 2) . '******' . substr($meta['national_id'], -2) : '';

        return array_merge($summary, [
            'nationality' => $meta['nationality'] ?? '',
            'location' => $row->location ?? '',
            'birth_date' => $meta['birth_date'] ?? '',
            'national_id_masked' => $maskedId,
            'commercial_registration' => $meta['commercial_registration'] ?? '',
            'experience_years' => $meta['experience_years'] ?? '',
            'planned_listings' => $meta['planned_listings'] ?? '',
            'target_cities' => $meta['target_cities'] ?? '',
            'expected_monthly_bookings' => $meta['expected_monthly_bookings'] ?? '',
            'priority' => $meta['partner_request_priority'] ?? 'normal',
            'review_reason' => $meta['partner_request_reason'] ?? '',
            'documents' => $this->partnerDocuments((int) $row->id, $meta),
            'activity' => $this->userActivityItems((int) $row->id),
            'onboarding' => [
                ['label' => 'تم إنشاء الحساب', 'done' => true],
                ['label' => 'تم التحقق من البريد الإلكتروني', 'done' => $summary['email_verified']],
                ['label' => 'تم رفع المستندات', 'done' => count($this->partnerDocuments((int) $row->id, $meta)) > 0],
                ['label' => 'تمت الموافقة على الطلب', 'done' => $summary['request_status'] === 'approved'],
                ['label' => 'تم إضافة أول إعلان', 'done' => $summary['listings_count'] > 0],
                ['label' => 'تم استقبال أول حجز', 'done' => $this->userTransactions((int) $row->id)['total_earned'] > 0],
            ],
        ]);
    }

    private function partnerDocuments($userId, array $meta)
    {
        $docs = [
            ['id' => 'national_id', 'title' => 'الهوية الوطنية / الإقامة'],
            ['id' => 'commercial_registration', 'title' => 'السجل التجاري'],
            ['id' => 'ownership_contract', 'title' => 'عقد الإيجار / سند الملكية'],
            ['id' => 'property_images', 'title' => 'صور العقارات'],
            ['id' => 'additional_documents', 'title' => 'مستندات إضافية'],
        ];

        return array_map(function ($doc) use ($userId, $meta) {
            $url = $meta[$doc['id'] . '_url'] ?? '';
            $status = $meta['partner_document_' . $doc['id']] ?? 'pending';
            return array_merge($doc, [
                'url' => $url,
                'thumbnail' => $url,
                'status' => $status,
            ]);
        }, $docs);
    }

    private function rolePermissions($role)
    {
        $matrix = $this->permissionsMatrixData();
        return $matrix[$role] ?? $matrix['guest'];
    }

    private function permissionsMatrixData()
    {
        $stored = get_opt('dashboard_permissions_matrix', '');
        $decoded = is_string($stored) && $stored !== '' ? @json_decode($stored, true) : null;
        if (is_array($decoded)) {
            return $decoded;
        }

        return [
            'guest' => ['create_listing' => false, 'manage_bookings' => false, 'access_dashboard' => false, 'manage_users' => false, 'view_reports' => false, 'edit_others' => false],
            'host' => ['create_listing' => true, 'manage_bookings' => true, 'access_dashboard' => true, 'manage_users' => false, 'view_reports' => false, 'edit_others' => false],
            'partner' => ['create_listing' => true, 'manage_bookings' => true, 'access_dashboard' => true, 'manage_users' => false, 'view_reports' => true, 'edit_others' => false],
            'admin' => ['create_listing' => true, 'manage_bookings' => true, 'access_dashboard' => true, 'manage_users' => true, 'view_reports' => true, 'edit_others' => true],
            'superadmin' => ['create_listing' => true, 'manage_bookings' => true, 'access_dashboard' => true, 'manage_users' => true, 'view_reports' => true, 'edit_others' => true],
        ];
    }

    private function mapPayout($row)
    {
        return [
            'id' => (int)$row->ID,
            'payout_id' => $row->payout_id ?? '',
            'user_id' => (int)($row->user_id ?? 0),
            'amount' => (float)($row->amount ?? 0),
            'currency' => get_option('currency', 'SR'),
            'status' => $row->status ?? 'pending',
            'created_at' => !empty($row->created_at) ? date('Y-m-d', $row->created_at) : '',
            'note' => $row->note ?? '',
        ];
    }
}
