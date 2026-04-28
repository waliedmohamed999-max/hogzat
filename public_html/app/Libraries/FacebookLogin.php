<?php

use Cartalyst\Sentinel\Native\Facades\Sentinel;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Provider\Facebook;

class FacebookLogin
{
    public $path;
    private $provider;
    private $accessToken;

    public function __construct()
    {

    }

    public function config()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        $this->provider = new Facebook([
            'clientId' => get_option('facebook_api'),
            'clientSecret' => get_option('facebook_secret'),
            'redirectUri' => url('/social-login/facebook'),
            'graphApiVersion' => 'v19.0',
        ]);
    }

    public function getLoginUrl()
    {
        if (social_enable('facebook')) {
            $this->config();
            $loginUrl = $this->provider->getAuthorizationUrl([
                'scope' => ['email'],
            ]);
            $_SESSION['facebook_oauth_state'] = $this->provider->getState();
            return $loginUrl;
        } else {
            return '';
        }
    }

    public function checkLogin()
    {
        if (social_enable('facebook')) {
            $this->config();
            $state = request()->get('state');
            $code = request()->get('code');
            if (empty($code)) {
                $error = request()->get('error');
                $errorDescription = request()->get('error_description');
                if (!empty($error)) {
                    return [
                        'status' => 0,
                        'message' => 'Error: ' . $error . ' ' . $errorDescription
                    ];
                }
                return [
                    'status' => 0,
                    'message' => 'Bad request'
                ];
            }
            if (empty($state) || !isset($_SESSION['facebook_oauth_state']) || ($state !== $_SESSION['facebook_oauth_state'])) {
                unset($_SESSION['facebook_oauth_state']);
                return [
                    'status' => 0,
                    'message' => 'Invalid OAuth state'
                ];
            }
            try {
                $this->accessToken = $this->provider->getAccessToken('authorization_code', [
                    'code' => $code
                ]);
                $_SESSION['facebook_access_token'] = $this->accessToken->getToken();
                $owner = $this->provider->getResourceOwner($this->accessToken);
                $profile = $owner->toArray();
            } catch (IdentityProviderException $e) {
                return [
                    'status' => 0,
                    'message' => 'Facebook OAuth error: ' . $e->getMessage()
                ];
            }

            $fbid = $profile['id'];
            $email = isset($profile['email']) ? $profile['email']: createEmail($fbid);
            $first_name = $profile['first_name'] ?? '';
            $last_name = $profile['last_name'] ?? '';

            $user = get_user_by_email($email);

            if (!$user) {
                $user_model = new \App\Models\User();
                $password = createPassword(32);
                $credentials = [
                    'email' => $email,
                    'password' => $password,
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                ];
                $user = Sentinel::registerAndActivate($credentials);
                $role = $user_model->getRoleByName('customer');
                $user_model->updateUserRole($user->getUserId(), $role->id);

                $content = view('frontend.email.welcome-user', ['user' => $user, 'password' => $password])->render();
                $admin = get_admin_user();
                $subject = sprintf(__("[%s] You have registered a new account"), get_option('site_name'));
                send_mail($admin->email, '', $user->email, $subject, $content);
            }
            if ($user) {
                return [
                    'status' => 1,
                    'user' => $user
                ];
            } else {
                return [
                    'status' => 0,
                    'message' => 'Some problem occurred, please try again.'
                ];
            }
        } else {
            return [
                'status' => 0,
                'message' => 'Facebook login is not supported'
            ];
        }
    }

    public static function get_inst()
    {
        static $instance;
        if (is_null($instance)) {
            $instance = new self();
        }

        return $instance;
    }
}

FacebookLogin::get_inst();
