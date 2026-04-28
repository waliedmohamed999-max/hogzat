<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
	$auth_key = $_POST['auth_key'];
	$phone = $_POST['phone'];
	
if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    $time = date('Y-m-d H:i:s');
    
    
    $sql = "UPDATE smartend_user SET lastActive='".$time."' WHERE phone='".$phone."' ";
    	if(mysqli_query($mysqli, $sql)) {
            echo json_encode("successful");
        }
        else {
            echo json_encode("error");
        }
}
    
?>