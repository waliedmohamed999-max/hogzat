<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$phone_user = $_POST['phone_user'];
	$phone_user_estimated = $_POST['phone_user_estimated'];
	$rate = $_POST['rate'];
	$comment = $_POST['comment'];
	
	$sql = "INSERT INTO `userEstimate` (`id_UE`, `phone_user`, `phone_user_estimated`, `rate`, `comment`) VALUES (NULL, '".$phone_user."', '".$phone_user_estimated."', '".$rate."', '".$comment."')";
	
	if (mysqli_query($mysqli, $sql)) {
	    echo json_encode("true");
    } else {
        echo json_encode("false");
      
    }
  
} else {
    
}  

?>