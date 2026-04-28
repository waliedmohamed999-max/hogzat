<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Coupon;
use App\Models\Experience;
use App\Models\Home;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Controllers\Api\BookingController as LegacyApiBookingController;
use App\Controllers\BookingController as LegacyBookingController;
use Sentinel;

class BookingController extends Controller
{
    public function quote(Request $request)
    {
        $data = $this->calculateQuote($request);
        if (!$data) {
            return response()->json(['status' => 0, 'message' => 'Invalid request'], 422);
        }

        return response()->json(['status' => 1, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $data = $this->calculateQuote($request);
        if (!$data) {
            return response()->json(['status' => 0, 'message' => 'Invalid request'], 422);
        }

        $user = $this->currentUser($request);
        $bookingId = DB::table('bookings')->insertGetId([
            'product_id' => $request->get('product_id'),
            'user_id' => $user ? $user->id : null,
            'checkin' => $request->get('checkin'),
            'checkout' => $request->get('checkout'),
            'guests_count' => $request->get('guests_count'),
            'total_price' => $data['total'],
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 1,
            'data' => ['booking_id' => $bookingId],
        ]);
    }

    public function complete(Request $request)
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'integer'],
            'type' => ['required', 'string'],
            'checkin' => ['required', 'date'],
            'checkout' => ['required', 'date'],
            'guests_count' => ['required', 'integer', 'min:1'],
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'payment' => ['nullable', 'string'],
            'payment_status' => ['nullable', 'string'],
            'coupon_code' => ['nullable', 'string', 'max:120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $type = $this->normalizeType($request->get('type'));
        $productId = (int)$request->get('product_id');
        $item = $type ? $this->getByType($type, $productId) : null;

        if (!$type || !$item) {
            return response()->json([
                'status' => 0,
                'message' => __('The data is invalid'),
            ], 422);
        }

        $result = $this->buildCartForCompletion($request, $type, $item);
        if (empty($result['status'])) {
            return response()->json([
                'status' => 0,
                'message' => $result['message'] ?? __('The data is invalid'),
            ], 422);
        }

        $couponCode = trim((string)$request->get('coupon_code', $request->get('coupon', '')));
        if ($couponCode !== '') {
            $couponResult = $this->resolveCoupon($couponCode, $type, $item, (float)($result['cart']['subTotal'] ?? 0));
            if (empty($couponResult['status'])) {
                return response()->json([
                    'status' => 0,
                    'message' => $couponResult['message'] ?? __('This coupon is invalid'),
                ], 422);
            }

            $result = $this->applyCouponToCart($result, $couponResult);
        }

        update_user_meta($user->id, 'cart_data', json_encode($result['cart']));

        $payment = $request->get('payment', '');
        if (empty($payment)) {
            $all = get_available_payments();
            if (!empty($all)) {
                $first = array_values($all)[0];
                $payment = $first::getID();
            }
        }

        $request->request->add([
            'payment' => $payment,
            'first_name' => $request->get('first_name'),
            'last_name' => $request->get('last_name'),
            'email' => $request->get('email'),
            'phone' => $request->get('phone'),
            'address' => $request->get('address', ''),
            'note' => $request->get('note', ''),
            'city' => $request->get('city', ''),
            'post_code' => $request->get('post_code', ''),
            'country' => $request->get('country', ''),
        ]);

        $legacyApi = new LegacyApiBookingController();
        $bookingId = $legacyApi->createBooking($user->id, $result['cart']);

        if (!$bookingId) {
            return response()->json([
                'status' => 0,
                'message' => __('Can not create new booking. Please try again!'),
            ], 500);
        }

        do_action('hh_after_create_booking', $bookingId);

        $paymentStatus = $request->get('payment_status', 'pending');
        if (!in_array($paymentStatus, ['completed', 'incomplete', 'pending', 'cancelled'], true)) {
            $paymentStatus = 'pending';
        }

        LegacyBookingController::get_inst()->updateBookingStatus($bookingId, $paymentStatus, true);
        do_action('hh_after_created_booking', $bookingId, $paymentStatus);

        remove_user_meta($user->id, 'cart_data');

        $booking = get_booking($bookingId, $result['cart']['serviceType']);

        return response()->json([
            'status' => 1,
            'message' => __('Booking completed successfully'),
            'data' => [
                'booking_id' => (int)$bookingId,
                'status' => $paymentStatus,
                'token_code' => $booking->token_code ?? '',
                'dashboard_url' => dashboard_url('bookings'),
                'service_path' => get_the_permalink($item->post_id, $item->post_slug ?? '', '', $type),
            ],
        ]);
    }

    public function my(Request $request)
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $items = DB::table('bookings')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (int)$item->id,
                    'status' => $item->status,
                    'startDate' => $item->checkin,
                    'endDate' => $item->checkout,
                    'total' => (float)$item->total_price,
                ];
            });

        return response()->json(['status' => 1, 'data' => $items]);
    }

    public function cancel($id, Request $request)
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        DB::table('bookings')->where('id', $id)->update([
            'status' => 'canceled',
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 1]);
    }

    private function calculateQuote(Request $request)
    {
        $productId = $request->get('product_id');
        $type = $this->normalizeType($request->get('type', 'home'));
        $checkin = $request->get('checkin');
        $checkout = $request->get('checkout');
        $guests = (int)$request->get('guests_count');
        if (!$productId || !$type || !$checkin || !$checkout || $guests < 1) {
            return null;
        }

        $item = $this->getByType($type, $productId);
        if (!$item) {
            return null;
        }

        $start = strtotime($checkin);
        $end = strtotime($checkout);
        if (!$start || !$end) {
            return null;
        }

        $nights = max(1, (int)(($end - $start) / 86400));
        $basePrice = (float)($item->base_price ?? 0);
        $unitLabel = $type === 'experience' ? 'للشخص' : 'لليلة';

        if ($type === 'experience') {
            $subtotal = $basePrice * max(1, $guests);
        } else {
            $subtotal = $basePrice * $nights;
        }

        $fees = 0;
        $tax = 0;
        $discount = 0;
        $couponCode = trim((string)$request->get('coupon_code', $request->get('coupon', '')));
        $couponLabel = '';
        $couponError = '';
        $couponValid = false;

        if ($couponCode !== '') {
            $couponResult = $this->resolveCoupon($couponCode, $type, $item, (float)$subtotal);
            if (!empty($couponResult['status'])) {
                $discount = (float)$couponResult['discount'];
                $couponLabel = (string)$couponResult['label'];
                $couponValid = true;
            } else {
                $couponError = (string)($couponResult['message'] ?? __('This coupon is invalid'));
            }
        }
        $total = $subtotal + $fees + $tax - $discount;

        return [
            'product_id' => (int)$productId,
            'type' => $type === 'car' ? 'service' : $type,
            'title' => get_translate($item->post_title, 1),
            'unit_price' => $basePrice,
            'unit_label' => $unitLabel,
            'currency' => get_option('currency', 'SR'),
            'checkin' => $checkin,
            'checkout' => $checkout,
            'guests_count' => $guests,
            'nights' => $nights,
            'subtotal' => (float)$subtotal,
            'fees' => (float)$fees,
            'tax' => (float)$tax,
            'discount' => (float)$discount,
            'total' => (float)$total,
            'coupon_code' => $couponCode,
            'coupon_label' => $couponLabel,
            'coupon_valid' => $couponValid,
            'coupon_error' => $couponError,
            'booking_url' => get_the_permalink($item->post_id, $item->post_slug ?? '', '', $type),
        ];
    }

    private function resolveCoupon($couponCode, $type, $item, $subtotal)
    {
        if ($couponCode === '') {
            return ['status' => 0, 'message' => __('This coupon is invalid')];
        }

        $coupon = (new Coupon())->getCouponItem($couponCode, 'code');
        if (!$coupon) {
            return ['status' => 0, 'message' => __('This coupon is invalid')];
        }

        if (($coupon->status ?? 'off') === 'off') {
            return ['status' => 0, 'message' => __('This coupon is not available')];
        }

        $now = time();
        if (!empty($coupon->start_time) && $now < (int)$coupon->start_time) {
            return ['status' => 0, 'message' => __('This coupon is not available')];
        }
        if (!empty($coupon->end_time) && $now > (int)$coupon->end_time) {
            return ['status' => 0, 'message' => __('This coupon is not available')];
        }

        if (!empty($coupon->service_type) && $coupon->service_type !== $type) {
            return ['status' => 0, 'message' => __('Coupon code does not apply to this service')];
        }

        $couponPrice = max(0, (float)($coupon->coupon_price ?? 0));
        $couponType = $coupon->price_type === 'percent' ? 'percent' : 'fixed';
        $discount = $couponType === 'percent'
            ? ((float)$subtotal * min(100, $couponPrice) / 100)
            : $couponPrice;
        $discount = min((float)$subtotal, max(0, $discount));

        return [
            'status' => 1,
            'coupon' => $coupon,
            'discount' => $discount,
            'label' => $couponType === 'percent' ? round($couponPrice, 2) . '%' : get_option('currency', 'SR') . ' ' . round($couponPrice, 2),
        ];
    }

    private function applyCouponToCart($result, $couponResult)
    {
        $cart = $result['cart'];
        $coupon = $couponResult['coupon'];
        $discount = (float)$couponResult['discount'];

        if (!isset($cart['cartOrigin'])) {
            $cart['cartOrigin'] = $cart;
        }

        $cart['subTotal'] = max(0, (float)($cart['subTotal'] ?? 0) - $discount);
        $cart['amount'] = max(0, (float)($cart['amount'] ?? $cart['subTotal']) - $discount);
        $cart['couponPrice'] = $couponResult['label'];
        $coupon->couponPriceHtml = $couponResult['label'];

        $cartData = $cart['cartData'] ?? [];
        $cartData['coupon'] = $coupon;
        $cart['cartData'] = $cartData;
        $result['cart'] = $cart;

        return $result;
    }

    private function currentUser(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return Sentinel::getUser();
        }
        return get_user_by_access_token($token);
    }

    private function normalizeType($type)
    {
        if ($type === 'service') {
            return 'car';
        }

        return in_array($type, ['home', 'experience', 'car'], true) ? $type : null;
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

    private function buildCartForCompletion(Request $request, $type, $item)
    {
        if ($type === 'home') {
            $request->request->add([
                'homeID' => (int)$item->post_id,
                'homeEncrypt' => hh_encrypt((int)$item->post_id),
                'num_adults' => (int)$request->get('guests_count', 1),
                'num_children' => 0,
                'num_infants' => 0,
                'checkIn' => $request->get('checkin'),
                'checkOut' => $request->get('checkout'),
                'startTime' => $request->get('start_time', '00:00'),
                'endTime' => $request->get('end_time', '23:59'),
                'extraServices' => [],
                'last' => $request->get('last'),
            ]);

            return \App\Controllers\Services\HomeController::get_inst()->_addToCartHome($request, true);
        }

        if ($type === 'experience') {
            $bookingType = $item->booking_type ?? 'date_time';
            $startTime = $request->get('start_time', $request->get('checkin'));

            $request->request->add([
                'experienceID' => (int)$item->post_id,
                'experienceEncrypt' => hh_encrypt((int)$item->post_id),
                'num_adults' => (int)$request->get('guests_count', 1),
                'num_children' => 0,
                'num_infants' => 0,
                'checkIn' => $request->get('checkin'),
                'checkOut' => $request->get('checkout', $request->get('checkin')),
                'startTime' => $startTime,
                'bookingType' => $bookingType,
                'tour_package' => $request->get('tour_package', ''),
                'voteable' => $request->get('voteable', 0),
                'extraServices' => [],
                'base_price' => $request->get('base_price', $item->base_price ?? 0),
            ]);

            return \App\Controllers\Services\ExperienceController::get_inst()->_addToCartExperience($request, true);
        }

        $request->request->add([
            'carID' => (int)$item->post_id,
            'carEncrypt' => hh_encrypt((int)$item->post_id),
            'checkIn' => $request->get('checkin'),
            'checkOut' => $request->get('checkout'),
            'startTime' => $request->get('start_time', '10:00'),
            'endTime' => $request->get('end_time', '12:00'),
            'equipment' => [],
            'insurancePlan' => [],
            'number' => max(1, (int)$request->get('quantity', 1)),
        ]);

        return \App\Controllers\Services\CarController::get_inst()->_addToCartCar($request, true);
    }
}
