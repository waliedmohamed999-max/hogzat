<?php

namespace App\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\TermRelation;
use App\Models\User;
use App\Models\Media;
use App\Models\RoleUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Sentinel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
class UserController extends Controller
{
    protected $model;  

    public function __construct()
    {
        parent::__construct();
        $this->model = new User();
    }

    public function updateProfile(Request $request){
        $token = $request->bearerToken();
        $user_id = $this->model->getUserIDByToken($token);
        if($user_id){
            $args = [
                'first_name' => $request->post('first_name'),
                'last_name' => $request->post('last_name'),
                'mobile' => $request->post('mobile'),
                'email' => $request->post('email'),
                'location' => $request->post('location'),
                'address' => $request->post('address'),
                'description' => $request->post('description'),
            ];

            $user_model = new User();
            $updated = $user_model->updateUser($user_id, $args);
            if($request->image!=null){
                $id_media=app(\App\Controllers\MediaController::class)->_addMediaApi($request->image,$user_id);
            $updated = $user_model->updateUser($user_id, ['avatar' =>$id_media ]);
            }
            if (!is_null($updated)) {
                return $this->sendJson([
                    'status' => 1,
                    'message' => __('Updated successfully')
                ]);
            } else {
                return $this->sendJson([
                    'status' => 0,
                    'message' => __('Can not update this user. Try again!')
                ]);
            }
        }
        return $this->sendJson([
            'status' => 0,
            'message' => __('This user is invalid')
        ]);
    }

    public function getCurrentUser(Request $request){
        $token = $request->bearerToken();
        $user_id = $this->model->getUserIDByToken($token);
        if($user_id){
            $user = get_user_by_id($user_id)->toArray();
            $user=User::find($user_id);
            $avatar=Media::where('media_id','=',$user->avatar)->first();
            if($avatar!=null){
            $user['avatar']= $avatar->media_url;
                
            }
            else{$user['avatar']=null;}
	        $user['meta'] = $this->model->getUserAllMeta($user_id)->toArray();
	        $user['username']= get_username($user_id);
	         $role=RoleUsers::where('user_id','=',$user_id)->first();
                if($role!=null && $role->role_id!=3 )
                {
                    $user['mem'] =true;
                }
                else
                {
                    $user['mem'] =false;
                    
                }
            return $this->sendJson([
                  'status' => 1,
                'message' => __('Success'),
                'data' => $user
            ]);
        }
        return $this->sendJson([
            'status' => 0,
            'message' => __('Data is invalid')
        ]);
    }

    public function changePassword(Request $request){
        $token = $request->bearerToken();
        $user_id = $this->model->getUserIDByToken($token);

        if($user_id) {
            $user = get_user_by_id($user_id);
            if (!$user) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => __('This user does not exist')
                ]);
            }

            $validator = Validator::make($request->all(), [
                'password' => ['required', 'string', 'min:6'],
            ]);

            if ($validator->fails()) {
                return $this->sendJson([
                    'status' => 0,
                    'message' => $validator->errors()
                ]);
            } else {
                $password = trim($request->post('password'));
                $credentials = [
                    'password' => $password,
                ];
                Sentinel::update($user, $credentials);
                return $this->sendJson([
                    'status' => 1,
                    'message' => __('Updated password successfully')
                ]);
            }
        }
        return $this->sendJson([
            'status' => 0,
            'message' => __('Data is invalid')
        ]);
    }

    public function resetPassword(Request $request){
        $validator = Validator::make($request->all(),
            [
                'email' => 'required|exists:users,email',
            ],
            [
                'email.required' => __('The email is required'),
                'email.exists' => __('The email does not exist'),
            ]
        );

        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors()
            ]);
        }

        $credentials = [
            'login' => request()->get('email'),
        ];

        $user = Sentinel::findByCredentials($credentials);

        if (is_null($user)) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('The email does not exist')
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
                    'message' => __('Can not reset password for this account. Try again!')
                ]);
            } else {
                $subject = sprintf(__('[%s] You have changed the password'), get_option('site_name'));
                $content = view('frontend.email.reset-password', ['user' => $user, 'password' => $password])->render();
                $sent = send_mail('', '', $user->email, $subject, $content);
                if (!$sent) {
                    return $this->sendJson([
                        'status' => 0,
                        'message' => __('Can not send email.')
                    ]);
                }
                return $this->sendJson([
                    'status' => 1,
                    'message' => __('Success! Please check your email for a new password.')
                ]);
            }
        }
    }

    public function logout(Request $request){
		$token = $request->bearerToken();
        $this->model->deleteUserMetaByWhere([
            'meta_key' => 'access_token',
            'meta_value' => $token
        ]);
        return $this->sendJson([
            'status' => 1,
            'message' => __('Successfully logged out')
        ]);
    }

    public function register(Request $request){
        $rules = [
            'first_name' => 'required',
            'last_name' => 'required',
            'mobile' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors()
            ]);
        }

	    $credentials = [
		    'email' => $request->post('email'),
		    'password' => $request->post('password'),
		    'first_name' => $request->post('first_name'),
		    'last_name' => $request->post('last_name'),
		    'mobile' => $request->post('mobile'),
	    ];

	    $new_user = create_new_user($credentials);

	    if(!$new_user['status']){
		    return $this->sendJson([
			    'status' => 0,
			    'message' => __('Can not create new user')
		    ]);
	    }else{
	        $user=User::find($new_user['user']['id']);
	        $user->mobile=$request->post('mobile');
	        $user->save();
		    return $this->sendJson([
			    'status' => 1,
			    'message' => __('Registered successfully'),
		    ]);
	    }
    }
    public function status_role($id)
    {
        $role=RoleUsers::where('user_id','=',$id)->first();
        if($role!=null && $role->role_id!=3 )
        return $this->sendJson([
			    'status' => 1,
			  
		    ]);
     return $this->sendJson([
			    'status' => 0,
		    ]);
        
    }
    public function SendCode(Request $request){
        $verCode = mt_rand(1000, 9999);
         $msg = "  ب�اجات ت�ب�` ا�إحت�`اجات \r\n ْ��د ا�تفع�`�: ".$verCode;
         $a=  Http::post("https://www.msegat.com/gw/sendsms.php", [
          "userName"=> "ب�اجات",
          "numbers"=> $request->phone,
          "userSender" => "Labayh",
          "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
          "msg"=> "$msg"
      ]);
           if($a['code']!=1){
          return $this->sendJson([
			    'status' => 0,
		    ]); 
               
           }
        $user=User::where('mobile','=',$request->phone)->first();
        if($user!=null){
           
            // if($request->phone=='0581333357'){
            //     $user->password=1234;
            // }
            // else{
                
            //     $user->password=$verCode;
            // }
             $user->password=$verCode;
             $user->save();
             return $this->sendJson([
			    'status' => 1,
		    ]);
            
        }
        else{
            
            $newUser=new User;
            $newUser->mobile=$request->phone;
            $newUser->password=$verCode;
            $newUser->email=$verCode;
            $newUser->save();
             DB::table('role_users')->where('user_id', $newUser->id)->delete();
             $user = get_user_by_id($newUser->id);
              $role = Sentinel::findRoleById(3);
              $role->users()->attach($user);
             return $this->sendJson([
			    'status' => 1,
		    ]);
        }
     
        
    }
    public function verifie(Request $request)
    {
    

        try {
           $user=User::where('mobile','=',$request->phone)->where('password','=',$request->code)->first();
            

        } catch (NotActivatedException $e) {
            return $this->sendJson([
                'status' => 0,
                'message' => $e->getMessage()
            ]);

        } catch (ThrottlingException $e) {
            return $this->sendJson([
                'status' => 0,
                'message' => $e->getMessage()
            ]);

        }

        if (isset($user) && is_object($user)) {
              if($user->isNew==0)
              {
                  return $this->sendJson([
                'status' => 2,
                
            ]);
                  
              }
              else{
                  $user->last_login=date('Y-m-d H:i:s');
                  $user->save();
                  
                  $token = create_api_token($user->id);
                  update_user_meta($user->id, 'access_token', $token);

            return $this->sendJson([
                'status' => 1,
                'message' => __('Logged in successfully.'),
                'token_code' => $token
            ]);
              }
            
        } else {
            return $this->sendJson([
                'status' => 0,
                'message' => __('The email or password is incorrect')
            ]);
        }
        
    }
     public function UserInfo(Request $request)
    {
        
        $user=User::where('mobile','=',$request->phone)->first();
        $user->first_name=$request->first_name;
         $user->last_name=$request->last_name;
         $user->email=$request->email;
         $user->isNew=1;
         $user->last_login=date('Y-m-d H:i:s');
         $user->save();
         DB::insert('insert into activations (user_id,code,completed) values (?, ?,?)', [$user->id,'DrIhXieIZBCLLML8YvwWvVZXU6IVJcDh','1']);
          $token = create_api_token($user->id);
                  update_user_meta($user->id, 'access_token', $token);

            return $this->sendJson([
                'status' => 1,
                'message' => __('Logged in successfully.'),
                'token_code' => $token
            ]);
         
    }
    public function login(Request $request)
    {
        $rules = [
            'email' => 'required|email',
            'password' => 'required|min:6',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors()
            ]);
        }
        $data = parse_request($request, array_keys($rules));

        try {

            $user = Sentinel::authenticate($data, true);

        } catch (NotActivatedException $e) {
            return $this->sendJson([
                'status' => 0,
                'message' => $e->getMessage()
            ]);

        } catch (ThrottlingException $e) {
            return $this->sendJson([
                'status' => 0,
                'message' => $e->getMessage()
            ]);

        }

        if (isset($user) && is_object($user)) {

            $token = create_api_token($user->getUserId());
            update_user_meta($user->getUserId(), 'access_token', $token);

            return $this->sendJson([
                'status' => 1,
                'message' => __('Logged in successfully.'),
                'token_code' => $token
            ]);
        } else {
            return $this->sendJson([
                'status' => 0,
                'message' => __('The email or password is incorrect')
            ]);
        }
    }
}

