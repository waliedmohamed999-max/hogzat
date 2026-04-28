<?php

    namespace App\Controllers;

    use App\Http\Controllers\Controller;
    use Cartalyst\Sentinel\Checkpoints\NotActivatedException;
    use Cartalyst\Sentinel\Checkpoints\ThrottlingException;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Support\Facades\Hash;
    use App\Models\User;
    use Illuminate\Support\Facades\Log;
    use Mockery\Exception;
    use Redirect;
    use Sentinel;

    class AuthController extends Controller
    {
        public function subscribeEmail()
        {
            $email = request()->get('email');
            $res = \MailChimpSubscribe::get_inst()->addNewSubscriber($email);
            $this->sendJson($res, true);
        }

        public function _getSignUp()
        {
            return view('dashboard.sign-up', ['bodyClass' => 'authentication-bg authentication-bg-pattern']);
        }

        public function _postSignUp(Request $request)
        {
            $validator = Validator::make($request->all(),
                [
                    'email' => 'required',
                    'password' => 'required|min:6',
                    'term_condition' => 'required'
                ],
                [
                    'email.required' => __('The email is required'),
                    'password.required' => __('The password is required'),
                    'password.min' => __('The password has at least 6 characters'),
                    'term_condition.required' => __('Please agree with the Term and Condition')
                ]
            );
            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => $validator->errors()->first()])->render()
                ]);
            }
            $password = request()->get('password');

            $credentials = [
                'email' => request()->get('email'),
                'password' => $password,
                'first_name' => request()->get('first_name', ''),
                'last_name' => request()->get('last_name', ''),
            ];

            $new_user = create_new_user($credentials);

            if(!$new_user['status']){
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => $new_user['message']])->render()
                ]);
            }else{
                return $this->sendJson([
                    'status' => 1,
                    'message' => view('common.alert', ['type' => 'success', 'message' => $new_user['message']])->render(),
                    'redirect' => url('auth/login')
                ]);
            }
        }

        public function _getResetPassword()
        {
            return view('dashboard.reset-password', ['bodyClass' => 'authentication-bg authentication-bg-pattern']);
        }

        public function _postResetPassword(Request $request)
        {

            $validator = Validator::make($request->all(),
                [
                    'email' => 'required|exists:users,email',
                ],
                [
                    'email.required' => 'The email is required',
                    'email.exists' => 'The email does not exist',
                ]
            );

            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => $validator->errors()->first()])->render()
                ]);
            }

            $credentials = [
                'login' => request()->get('email'),
            ];

            $user = Sentinel::findByCredentials($credentials);
            if (is_null($user)) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => __('The email does not exist')])->render()
                ]);
            } else {
                $password = createPassword(32);
                $credentials = [
                    'password' => $password,
                ];

                $user = Sentinel::update($user, $credentials);

                if (!$user) {
                    return $this->sendJson([
                        'status' => 0,
                        'message' => view('common.alert', ['type' => 'danger', 'message' => __('Can not reset password for this account. Try again!')])->render()
                    ]);
                } else {
                    $subject = sprintf(__('[%s] You have changed the password'), get_option('site_name'));
                    $content = view('frontend.email.reset-password', ['user' => $user, 'password' => $password])->render();
                    $sent = send_mail('', '', $user->email, $subject, $content);
                    if (!$sent) {
                        return $this->sendJson([
                            'status' => 0,
                            'message' => view('common.alert', ['type' => 'danger', 'message' => __('Can not send email.')])->render(),
                        ]);
                    }
                    return $this->sendJson([
                        'status' => 1,
                        'message' => view('common.alert', ['type' => 'success', 'message' => __('Successfully! Please check your email for a new password.')])->render(),
                        'redirect' => auth_url('login')
                    ]);
                }
            }
        }

        public function _getLogin()
        {
            return view('dashboard.login', ['bodyClass' => 'authentication-bg authentication-bg-pattern']);
        }
        
          public function checkMobileUser(Request $request)
        {
          $user=checkUser($request->mobileCheck);
      

          return $this->sendJson([
            'status' => 1,
            'message' => view('common.alert', ['type' => 'success', 'message' => __('checked in successfully. Redirecting ...')])->render(),
            'user' => $user
        ]);
        }

        public function _postLogin(Request $request)
        {
            // Build code; handle reversed input order on some UIs
            $codeForward = request()->digit1 . '' . request()->digit2 . '' . request()->digit3 . '' . request()->digit4;
            $codeReverse = request()->digit4 . '' . request()->digit3 . '' . request()->digit2 . '' . request()->digit1;
            $code = $codeForward;
           
            $mobile = request()->get('mobile');
            Log::info('OTP login attempt', [
                'mobile' => $mobile,
                'digit1' => request()->get('digit1'),
                'digit2' => request()->get('digit2'),
                'digit3' => request()->get('digit3'),
                'digit4' => request()->get('digit4'),
            ]);
            $redirect = $request->checkurl != null ?  get_referer(url('dashboard')) : url()->previous();
            $validator = Validator::make($request->all(),
                [
                    'mobile' => 'required|exists:users,mobile'
                ],
                [
                    'mobile.required' => __('The mobile is required'),
                    'mobile.exists' => __('The mobile does not exist'),
                    'password.required' => __('The code is required'),
                    'password.min' => __('The code has at least 6 characters')
                ]
            );
            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => $validator->errors()->first()])->render()
                ]);
            }
          
            // Manual auth by mobile since Sentinel doesn't resolve mobile as login in this project
            $userModel = new User();
            $userRow = $userModel->getUserWithMobile($mobile);
            Log::info('OTP login user lookup', [
                'mobile' => $mobile,
                'found' => $userRow ? true : false,
                'user_id' => $userRow->id ?? null,
            ]);
            if ($userRow) {
                $sentinelUser = Sentinel::findById($userRow->id);
                $hashOk = $sentinelUser ? Hash::check($code, $sentinelUser->password) : false;
                Log::info('OTP login hash check', [
                    'mobile' => $mobile,
                    'hash_ok' => $hashOk,
                ]);
                $hashOkReverse = false;
                if (!$hashOk && $sentinelUser) {
                    $hashOkReverse = Hash::check($codeReverse, $sentinelUser->password);
                }
                Log::info('OTP login hash check', [
                    'mobile' => $mobile,
                    'hash_ok' => $hashOk,
                    'hash_ok_reverse' => $hashOkReverse,
                ]);
                if ($sentinelUser && ($hashOk || $hashOkReverse)) {
                    Sentinel::login($sentinelUser, request()->has('remember'));
                }
            }
            if (Sentinel::check()) {
                if ($request->showUpdateModal == null) {
                    return $this->sendJson([
                        'status' => 1,
                        'message' => view('common.alert', ['type' => 'success', 'message' => __('Logged in successfully. Redirecting ...')])->render(),
                        'redirect' => $redirect
                    ]);
                } else {
                    return $this->sendJson([
                        'status' => 1,
                        'message' => view('common.alert', ['type' => 'success', 'message' => __('Logged in successfully. Redirecting ...')])->render(),
                        'show_update_modal' => $request->showUpdateModal
                    ]);
                }
            } else {
                return $this->sendJson([
                    'status' => 0,
                    'message' => view('common.alert', ['type' => 'danger', 'message' => __('The input code is incorrect')])->render()
                ]);
            }
        }

        public function _postLogout(Request $request)
        {
            $redirect_url = request()->get('redirect_url');

            Sentinel::logout();

            if (empty($redirect_url)) {
                $redirect_url = url('auth/login');
            }
            return $this->sendJson([
                'status' => 1,
                'title' => 'System Alert',
                'message' => __('Successfully Logged out'),
                'redirect' => $redirect_url
            ]);
        }

        public function _getLogout(Request $request)
        {
            $redirect_url = request()->get('redirect_url');

            Sentinel::logout();

            if (empty($redirect_url)) {
                $redirect_url = url('auth/login');
            }
            return redirect($redirect_url);
        }
    }
