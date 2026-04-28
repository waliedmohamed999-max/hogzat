<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Jenssegers\Agent\Agent;
class SendMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
   
    {
     return view("dashboard.screens.administrator.send-message", [ 'bodyClass' => 'hh-dashboard']);


    }
    public function specificMessage()
   
    {
     return view("dashboard.screens.administrator.send-message-specific", [ 'bodyClass' => 'hh-dashboard']);


    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function SendMessage(Request $request)
    {
            $user=User::all();
            $phone='';
            foreach($user as $u)
             { if($u['mobile']!=null)
                $phone=$phone.$u['mobile'].',';
                
            }
             $msg=''.$request->message.'';
            $x=   Http::post("https://www.msegat.com/gw/sendsms.php", [
                "userName"=> "Labayh",
                "numbers"=> $phone,
                "userSender" => "Labayh",
                "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
                "msg"=> "$msg"
            ]);
            if($x['code']==1)
            {
                return  redirect('/dashboard/Send-message')->with('status', __('Message Send successfully'));
            }
            else{
                
                 return  redirect('/dashboard/Send-message')->with('erorr', __('Message Not Sended!'));
            }
       
        
    }
   public function SendSpecific(Request $request)
    {
           
             $msg=''.$request->message.'';
            $x=   Http::post("https://www.msegat.com/gw/sendsms.php", [
                "userName"=> "Labayh",
                "numbers"=> $request->mobile,
                "userSender" => "Labayh",
                "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
                "msg"=> "$msg"
            ]);
            if($x['code']==1)
            {
                return  redirect('/dashboard/Send-message-specific')->with('status', __('Message Send successfully'));
            }
            else{
                
                 return  redirect('/dashboard/Send-message-specific')->with('erorr', __('Message Not Sended!'));
            }
       
        
    }

public function downloadApp(){
        $agent = new Agent();
        if($agent->is('windows') || $agent->isAndroidOS()){
            return redirect('https://play.google.com/store/apps/details?id=com.labayh.app');

        }
        else if($agent->isiPhone() || $agent->isiOS() || $agent->isiPad() || $agent->isiPadOS() || $agent->isSafari()){
            return redirect('https://apps.apple.com/app/labayh/id0000000000');
        }
        else{
            return redirect('https://play.google.com/store/apps/details?id=com.labayh.app');
        }
    }
    
      public function SendDownloadLink(Request $request)
    {
        $msg = "منصة لبية\r\nيمكنك تحميل تطبيق لبية من خلال الرابط التالي: https://labayh.sa/download";
            if($request->mobile==null){
                 return $this->sendJson([
                                'status' => 0,
                                'message' => view('common.alert', ['type' => 'danger', 'message' =>  __('ر��& ا�ج��ا� �&ط���ب')])->render()
                                
                            ]);
                
            }
            $x=   Http::post("https://www.msegat.com/gw/sendsms.php", [
                "userName"=> "Labayh",
                "numbers"=> $request->mobile,
                "userSender" => "Labayh",
                "apiKey"=> "2e02b50ebe8e11e93c532c0b1b5cbdcf",
                "msg"=> "$msg"
            ]);
            if($x['code']==1)
            {
                 return $this->sendJson([
                    'status' => 1,
                    'message' => view('common.alert', ['type' => 'success', 'message' =>  __('Message Send successfully')])->render()
                    
                ]);
            }
            else{
            return $this->sendJson([
                    'status' => 0,
                    'code'=>$x['code'],
                    'message' => view('common.alert', ['type' => 'danger', 'message' =>  __('Message Not Sended!')])->render()
                    
                ]);

            }



    }
}

