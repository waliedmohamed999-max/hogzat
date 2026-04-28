<?php

namespace App\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends APIController
{
    protected $privacyKeys = [
        'marketing_emails',
        'product_updates',
        'data_sharing',
    ];

    public function account(Request $request)
    {
        $payload = [
            'title' => 'Account settings',
            'items' => [
                [
                    'id' => 1,
                    'title' => 'Personal info',
                    'icon' => 'person',
                    'route_key' => 'personal_info',
                ],
                [
                    'id' => 2,
                    'title' => 'Security',
                    'icon' => 'security',
                    'route_key' => 'security',
                ],
                [
                    'id' => 3,
                    'title' => 'Privacy',
                    'icon' => 'privacy',
                    'route_key' => 'privacy',
                ],
                [
                    'id' => 4,
                    'title' => 'Notifications',
                    'icon' => 'notifications',
                    'route_key' => 'notifications',
                ],
                [
                    'id' => 5,
                    'title' => 'Payments',
                    'icon' => 'payments',
                    'route_key' => 'payments',
                ],
            ],
            'footer_label' => 'Manage your account preferences.',
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $payload,
        ]);
    }

    public function legal()
    {
        $items = [
            [
                'id' => 1,
                'title' => 'Terms and Conditions',
                'url' => function_exists('get_the_permalink') ? get_the_permalink(get_option('term_condition_page'), '', '', 'page') : '',
                'icon' => 'document',
            ],
            [
                'id' => 2,
                'title' => 'Privacy Policy',
                'url' => '',
                'icon' => 'policy',
            ],
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function help()
    {
        $items = [
            [
                'id' => 1,
                'title' => 'Help center',
                'icon' => 'help',
                'route_key' => 'help_center',
            ],
            [
                'id' => 2,
                'title' => 'Contact support',
                'icon' => 'question',
                'route_key' => 'contact_support',
            ],
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function privacy(Request $request)
    {
        $user_id = $this->getUserIdFromToken($request);
        if (!$user_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => 'Invalid user.',
            ]);
        }

        $settings = [];
        foreach ($this->privacyKeys as $key) {
            $settings[] = [
                'key' => $key,
                'title' => $this->privacyTitle($key),
                'description' => $this->privacyDescription($key),
                'enabled' => $this->getPrivacyValue($user_id, $key),
                'section' => 'general',
            ];
        }

        $payload = [
            'title' => 'Privacy settings',
            'subtitle' => 'Control how your data is used.',
            'settings' => $settings,
            'actions' => [
                [
                    'key' => 'request_data',
                    'title' => 'Request my data',
                ],
                [
                    'key' => 'delete_account',
                    'title' => 'Delete my account',
                ],
            ],
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $payload,
        ]);
    }

    public function updatePrivacy($key, Request $request)
    {
        if (!in_array($key, $this->privacyKeys, true)) {
            return $this->sendJson([
                'status' => 0,
                'message' => 'Invalid privacy key.',
            ]);
        }

        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }

        $user_id = $this->getUserIdFromToken($request);
        if (!$user_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => 'Invalid user.',
            ]);
        }

        $model = new User();
        $model->updateUserMeta($user_id, 'privacy_' . $key, (bool)$request->get('enabled'));

        return $this->sendJson([
            'status' => 1,
        ]);
    }

    public function requestData(Request $request)
    {
        $user_id = $this->getUserIdFromToken($request);
        if ($user_id) {
            $model = new User();
            $model->updateUserMeta($user_id, 'privacy_request_data', date('Y-m-d H:i:s'));
        }

        return $this->sendJson([
            'status' => 1,
        ]);
    }

    public function requestAccountDeletion(Request $request)
    {
        $user_id = $this->getUserIdFromToken($request);
        if (!$user_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => 'Invalid user.',
            ]);
        }

        $model = new User();
        $model->updateUserMeta($user_id, 'account_delete_requested', date('Y-m-d H:i:s'));

        return $this->sendJson([
            'status' => 1,
        ]);
    }

    protected function getUserIdFromToken(Request $request)
    {
        $token = $request->bearerToken();
        if (empty($token)) {
            return false;
        }

        $model = new User();
        return $model->getUserIDByToken($token);
    }

    protected function getPrivacyValue($user_id, $key)
    {
        $model = new User();
        $meta = $model->getUserMeta($user_id, 'privacy_' . $key);
        if (!$meta || !isset($meta->meta_value)) {
            return false;
        }
        $value = maybe_unserialize($meta->meta_value);
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    protected function privacyTitle($key)
    {
        switch ($key) {
            case 'marketing_emails':
                return 'Marketing emails';
            case 'product_updates':
                return 'Product updates';
            case 'data_sharing':
                return 'Data sharing';
            default:
                return 'Privacy setting';
        }
    }

    protected function privacyDescription($key)
    {
        switch ($key) {
            case 'marketing_emails':
                return 'Receive promotions and special offers.';
            case 'product_updates':
                return 'Get updates about new features.';
            case 'data_sharing':
                return 'Allow sharing usage data to improve the service.';
            default:
                return '';
        }
    }
}
