<?php

use App\Abstracts\Gateways;

class Urway extends Gateways
{
    static $paymentId = 'urway';

    protected $params;

    public function __construct()
    {
        parent::__construct();
    }

    public static function getID()
    {
        return self::$paymentId;
    }

    public static function getName()
    {
        return __('Urway');
    }

    public static function getHtml()
    {
        return '';
    }

    public static function enable()
    {
        // TODO: Implement enable() method.
        $enable = get_option('enable_' . self::$paymentId, 'off');
        return !!($enable == 'on');
    }

    public static function getLogo()
    {
        $img = get_option(self::$paymentId . '_logo');
        if(!$img){
            return asset('/images/Urway.png');
        }
        return get_attachment_url($img, 'full');
    }

    public static function getDescription()
    {
        $desc = get_option(self::$paymentId . '_description');
        return $desc;
    }

    public static function getOptions()
    {
        return [
            'title' => [
                'id' => 'sub_tab_' . self::$paymentId,
                'label' => self::getName()
            ],
            'content' => [
                [
                    'id' => 'enable_' . self::$paymentId,
                    'label' => __('Enable'),
                    'type' => 'on_off',
                    'std' => 'on',
                    'section' => 'sub_tab_' . self::$paymentId
                ],
                [
                    'id' => self::$paymentId . '_logo',
                    'label' => __('Logo'),
                    'type' => 'upload',
                    'translation' => false,
                    'section' => 'sub_tab_' . self::$paymentId
                ],
                [
                    'id' => self::$paymentId . '_description',
                    'label' => __('Description'),
                    'type' => 'textarea',
	                'translation' => true,
                    'section' => 'sub_tab_' . self::$paymentId
                ],
            ]
        ];
    }


    public function setDefaultParams()
    {
        // TODO: Implement setDefaultParams() method.
    }

    public function setParams($params = [])
    {
        // TODO: Implement setParams() method.
        $default = [];
        $params = wp_parse_args($params, $default);
        $this->params = $params;
    }

    public function validation()
    {
        // TODO: Implement validation() method.
        return true;
    }

    public function purchase($booking_id = false, $params = [])
    {
                   $this->setOrderObject($booking_id);

                $idorder = 'PHP_' . rand(1, 1000);//Customer Order ID
        
        
        $terminalId = "blagat";// Will be provided by URWAY
        $password = "blagat@URWAY_753";// Will be provided by URWAY
        $merchant_key = "4aadabc75a409c21b114dfa88586e5493ba62c54b79a6b1d94ddcc85ade1b64d";// Will be provided by URWAY
        
        $currencycode = "SAR";
        $amount = $this->orderObject->total;
        
        function get_server_ip() {
            $ipaddress = '';
            if (getenv('HTTP_CLIENT_IP'))
                $ipaddress = getenv('HTTP_CLIENT_IP');
            else if(getenv('HTTP_X_FORWARDED_FOR'))
                $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
            else if(getenv('HTTP_X_FORWARDED'))
                $ipaddress = getenv('HTTP_X_FORWARDED');
            else if(getenv('HTTP_FORWARDED_FOR'))
                $ipaddress = getenv('HTTP_FORWARDED_FOR');
            else if(getenv('HTTP_FORWARDED'))
               $ipaddress = getenv('HTTP_FORWARDED');
            else if(getenv('REMOTE_ADDR'))
                $ipaddress = getenv('REMOTE_ADDR');
            else
                $ipaddress = 'UNKNOWN';
            return $ipaddress;
        }
        $ipp = get_server_ip();
        //Generate Hash
        $txn_details= $idorder.'|'.$terminalId.'|'.$password.'|'.$merchant_key.'|'.$amount.'|'.$currencycode; 
        $hash=hash('sha256', $txn_details); 
        
        
        $fields = array( 
                    'trackid' => $idorder, 
                    'terminalId' => $terminalId, 
        			'customerEmail' => $this->orderObject->email, 
        			'action' => "1",  // action is always 1 
        			'merchantIp' =>$ipp, 
        			'password'=> $password, 
        			'currency' => $currencycode, 
        			'country'=>"SA", 
        			'amount' => $amount,  
        			 "udf1"              =>"Test1",
                    "udf2"              =>$this->successUrl(),//"http://tttt/thank-you",//Response page URL
                     "udf3"              =>"",
                      "udf4"              =>"",
                    "udf5"              =>"Test5",
        			'requestHash' => $hash  //generated Hash  
                    );    
          $data = json_encode($fields);  
        $ch=curl_init('https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'); // Will be provided by URWAY
         curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST"); 
         curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
         curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
               'Content-Type: application/json', 
               'Content-Length: ' . strlen($data)) 
              ); 
         curl_setopt($ch, CURLOPT_TIMEOUT, 5); 
         curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); 
         //execute post 
         $server_output =curl_exec($ch); 
         //close connection 
         curl_close($ch); 
             $result = json_decode($server_output);
             
                $this->setParams($params);
        do_action('hh_purchase_' . self::$paymentId, $this->params);
          
             if (!empty($result->payid) && !empty($result->targetUrl)) {
                $url = $result->targetUrl . '?paymentid=' .  $result->payid;
          
                // header('Location: '. $url, true, 307);//Redirect to Payment Page
                return [
                    'status' => 'incomplete',
                    'redirectUrl' => $url ,
                    'message' => __('Successful booking')
                ];
               
              
             }else{
        
           print_r($result);
          echo "<br/><br/>";
           print_r($data);
           die();
        
        
             }
    }

    public function completePurchase($booking_id = false, $params = [])
    {
        
        do_action('hh_complete_purchase_' . self::$paymentId, $this->params);
        return [
            'status' => 'incomplete'
        ];
    }


    public static function get_inst()
    {
        static $instance;
        if (is_null($instance)) {
            $instance = new self();
        }

        return $instance;
    }
    public function checkResponce($request)
    {
        
    }
}
