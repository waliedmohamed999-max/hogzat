<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$phone = $_POST['phone'];
	//$password = $_POST['password'];
	//$rePassword = $_POST['rePassword'];
	$verCode = $_POST['verCode'];

    $queryResult=$mysqli->query("SELECT * FROM smartend_user Where phone='".$phone."'");
    
    $result=array();
    
    while($fetchData=$queryResult->fetch_assoc()){
    	$result[]=$fetchData;
    	
    }
    
    if($result[0]>1) {
        foreach ($result as $res)  {
            if($res['verCode'] != $verCode) {
                echo json_encode("false");
            }
            else {
            $mysqli->query("UPDATE smartend_user SET verified='1' WHERE phone=". $phone);
        
            echo json_encode("successful");
            }
        
      
        }  
        
    }
    else {
        echo json_encode("error");
    }
	
	

} else {
    
}	
	

?>