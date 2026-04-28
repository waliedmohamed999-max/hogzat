<?php
    include("../../include/config.php");
    
    $auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    $phone_user_recipient=$_POST['phone_user_recipient'];
    $phone_user_sender=$_POST['phone_user_sender'];
    
          
	$queryResult=$mysqli->query("
	
	
	
	
	UPDATE `conversations` 
	SET `state_conv_sender` = '0' 
	WHERE (phone_user_recipient='".$phone_user_recipient."' 
	AND 	phone_user_sender='".$phone_user_sender."' )
	
	OR (phone_user_recipient='".$phone_user_sender."' 
	AND 	phone_user_sender='".$phone_user_recipient."' )
	
	
	
	
	

	
	");
	
	if(!$queryResult) {
	    echo json_encode("false");
	} else {
	    echo json_encode("done");
	}
	
	
	
	
	/*
	
		
	DELETE FROM conversations WHERE 
	(phone_user_recipient='".$phone_user_recipient."' 
	AND 	phone_user_sender='".$phone_user_sender."' )
	
	OR (phone_user_recipient='".$phone_user_sender."' 
	AND 	phone_user_sender='".$phone_user_recipient."' )
	
	
	
	*/
	
	
} else {
    
}

?>