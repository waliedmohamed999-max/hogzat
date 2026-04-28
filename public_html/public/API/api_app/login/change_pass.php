<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$phone = $_POST['phone'];
	$newPass = $_POST['newPass'];
	$reNewPass = $_POST['reNewPass'];
	
	if($newPass != $reNewPass) {
        echo json_encode("nomatch");
        
    }
    else {
        $hashedPass = password_hash($newPass, PASSWORD_BCRYPT);
        $sql = "UPDATE smartend_user SET password='".$hashedPass."', rePassword='".$hashedPass."' WHERE phone='".$phone."' ";
	
    	if(mysqli_query($mysqli, $sql)) {
            echo json_encode("successful");
            
        }
        else {
            echo json_encode("error");
        }
        
    }
    


?>