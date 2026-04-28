<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Sentinel;

class SessionController extends Controller
{
    public function me(Request $request)
    {
        if (!Sentinel::check()) {
            return response()->json([
                'status' => 0,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => $this->mapUser(Sentinel::getUser()),
        ]);
    }

    public function login(Request $request)
    {
        if ($request->filled('email') || $request->filled('password')) {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first(),
                ], 422);
            }

            try {
                $sentinelUser = Sentinel::authenticate([
                    'email' => trim((string) $request->get('email')),
                    'password' => (string) $request->get('password'),
                ], $request->boolean('remember', $request->boolean('rememberMe')));
            } catch (\Throwable $throwable) {
                return response()->json([
                    'status' => 0,
                    'message' => $throwable->getMessage() ?: __('The email or password is incorrect'),
                ], 422);
            }

            if (!$sentinelUser) {
                return response()->json([
                    'status' => 0,
                    'message' => __('The email or password is incorrect'),
                ], 422);
            }

            Sentinel::login($sentinelUser, $request->boolean('remember', $request->boolean('rememberMe')));
            $request->session()->regenerate();

            return response()->json([
                'status' => 1,
                'message' => __('Logged in successfully. Redirecting ...'),
                'data' => $this->mapUser(Sentinel::getUser()),
                'redirect' => $request->get('return_url', url('/')),
            ]);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'mobile' => 'required|exists:users,mobile',
                'digit1' => 'required',
                'digit2' => 'required',
                'digit3' => 'required',
                'digit4' => 'required',
            ],
            [
                'mobile.required' => __('The mobile is required'),
                'mobile.exists' => __('The mobile does not exist'),
                'digit1.required' => __('The code is required'),
                'digit2.required' => __('The code is required'),
                'digit3.required' => __('The code is required'),
                'digit4.required' => __('The code is required'),
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $mobile = $request->get('mobile');
        $codeForward = $request->digit1 . $request->digit2 . $request->digit3 . $request->digit4;
        $codeReverse = $request->digit4 . $request->digit3 . $request->digit2 . $request->digit1;

        $userModel = new User();
        $userRow = $userModel->getUserWithMobile($mobile);
        $sentinelUser = $userRow ? Sentinel::findById($userRow->id) : null;

        if (!$sentinelUser) {
            return response()->json([
                'status' => 0,
                'message' => __('The mobile does not exist'),
            ], 404);
        }

        $hashOk = Hash::check($codeForward, $sentinelUser->password) || Hash::check($codeReverse, $sentinelUser->password);
        if (!$hashOk) {
            return response()->json([
                'status' => 0,
                'message' => __('The input code is incorrect'),
            ], 422);
        }

        Sentinel::login($sentinelUser, $request->boolean('remember'));
        $request->session()->regenerate();

        return response()->json([
            'status' => 1,
            'message' => __('Logged in successfully. Redirecting ...'),
            'data' => $this->mapUser(Sentinel::getUser()),
            'redirect' => $request->get('return_url', url('/')),
        ]);
    }

    public function logout(Request $request)
    {
        Sentinel::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 1,
            'message' => __('Successfully Logged out'),
        ]);
    }

    public function checkEmail(Request $request)
    {
        $email = trim((string) $request->get('email', ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'status' => 0,
                'available' => false,
                'message' => __('Invalid email address'),
            ], 422);
        }

        return response()->json([
            'status' => 1,
            'available' => !DB::table('users')->where('email', $email)->exists(),
        ]);
    }

    public function partnerApply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:120',
            'lastName' => 'required|string|max:120',
            'email' => 'required|email|max:190',
            'phone' => 'required|string|max:40',
            'password' => 'required|string|min:8',
            'nationality' => 'required|string|max:120',
            'idNumber' => 'required|string|max:80',
            'partnerType' => 'required|string|max:80',
            'expectedListings' => 'nullable|numeric',
            'yearsExperience' => 'nullable|string|max:80',
            'description' => 'nullable|string|max:500',
            'idDocument' => 'required|file|max:5120',
            'commercialDoc' => 'nullable|file|max:5120',
            'propertyPhotos.*' => 'nullable|file|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $email = trim((string) $request->get('email'));
        $mobile = preg_replace('/[^\d+]/', '', (string) $request->get('phone'));

        if (DB::table('users')->where('email', $email)->orWhere('mobile', $mobile)->exists()) {
            return response()->json([
                'status' => 0,
                'message' => __('This user already exists'),
            ], 422);
        }

        $userModel = new User();
        $user = Sentinel::registerAndActivate([
            'email' => $email,
            'password' => (string) $request->get('password'),
            'first_name' => trim((string) $request->get('firstName')),
            'last_name' => trim((string) $request->get('lastName')),
            'mobile' => $mobile,
        ]);

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => __('Can not create new user'),
            ], 500);
        }

        $role = $userModel->getRoleByName('customer');
        if ($role) {
            $userModel->updateUserRole($user->getUserId(), $role->id);
        }

        $userId = (int) $user->getUserId();
        $userModel->updateUser($userId, [
            'request' => 'request_a_partner',
            'description' => trim((string) $request->get('description', '')),
            'location' => trim((string) $request->get('primaryCity', '')),
        ]);

        $documentMeta = $this->storePartnerDocuments($request, $userId);
        $userModel->updateUserMeta($userId, array_merge([
            'nationality' => trim((string) $request->get('nationality')),
            'national_id' => trim((string) $request->get('idNumber')),
            'partner_type' => trim((string) $request->get('partnerType')),
            'company_name' => trim((string) $request->get('companyName', '')),
            'commercial_registration' => trim((string) $request->get('commercialReg', '')),
            'target_cities' => trim((string) $request->get('cities', '')),
            'planned_listings' => trim((string) $request->get('expectedListings', '')),
            'experience_years' => trim((string) $request->get('yearsExperience', '')),
            'expected_monthly_bookings' => trim((string) $request->get('expectedMonthlyBookings', '')),
            'partner_request_priority' => 'normal',
            'partner_request_reason' => '',
            'partner_document_national_id' => 'pending',
            'partner_document_commercial_registration' => $request->hasFile('commercialDoc') ? 'pending' : '',
            'partner_document_property_images' => $request->hasFile('propertyPhotos') ? 'pending' : '',
        ], $documentMeta));

        if (Schema::hasTable('agreement')) {
            DB::table('agreement')->updateOrInsert(['user_id' => $userId], ['status' => 0]);
        }

        if (function_exists('do_action')) {
            do_action('hh_user_registered_as_partner', $userId, (string) $request->get('password'));
        }

        return response()->json([
            'status' => 1,
            'message' => __('Your partner request has been submitted successfully.'),
            'data' => [
                'id' => $userId,
                'email' => $email,
                'phone' => $mobile,
                'request_status' => 'pending',
            ],
        ]);
    }

    private function storePartnerDocuments(Request $request, int $userId)
    {
        $meta = [];
        $basePath = public_path('uploads/partner-requests/' . $userId);
        if (!is_dir($basePath)) {
            @mkdir($basePath, 0755, true);
        }

        $saveFile = function ($file, string $name) use ($basePath, $userId) {
            if (!$file || !$file->isValid()) {
                return '';
            }
            $extension = $file->getClientOriginalExtension() ?: 'bin';
            $fileName = $name . '-' . time() . '-' . mt_rand(1000, 9999) . '.' . $extension;
            $file->move($basePath, $fileName);
            return url('uploads/partner-requests/' . $userId . '/' . $fileName);
        };

        $meta['national_id_url'] = $saveFile($request->file('idDocument'), 'national-id');
        if ($request->hasFile('commercialDoc')) {
            $meta['commercial_registration_url'] = $saveFile($request->file('commercialDoc'), 'commercial-registration');
        }
        if ($request->hasFile('propertyPhotos')) {
            $urls = [];
            foreach ((array) $request->file('propertyPhotos') as $index => $file) {
                $url = $saveFile($file, 'property-' . ($index + 1));
                if ($url) {
                    $urls[] = $url;
                }
            }
            $meta['property_images_url'] = implode(',', $urls);
        }

        return $meta;
    }

    private function mapUser($user)
    {
        $roles = [];

        if (method_exists($user, 'roles')) {
            try {
                $roles = $user->roles()->pluck('slug')->all();
            } catch (\Throwable $throwable) {
                $roles = [];
            }
        }

        $displayName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: get_username($user->id);
        $displayName = str_replace(
            ['D M S Admin', 'DMS Admin', 'DMS Reserve', 'Premium Stays', 'Blagat Saudia', 'Blagat Saudi', 'Balajat', 'بلاجات', 'بلجات', 'النادر'],
            ['Labayh Admin', 'Labayh Admin', 'Labayh', 'Labayh', 'فريق لبية', 'فريق لبية', 'Labayh', 'لبية', 'لبية', 'لبية'],
            $displayName
        );

        return [
            'id' => (int)$user->id,
            'email' => $user->email ?? '',
            'mobile' => $user->mobile ?? '',
            'first_name' => $user->first_name ?? '',
            'last_name' => $user->last_name ?? '',
            'display_name' => $displayName,
            'avatar' => get_user_avatar($user->id),
            'roles' => $roles,
            'dashboard_url' => dashboard_url(),
        ];
    }
}
