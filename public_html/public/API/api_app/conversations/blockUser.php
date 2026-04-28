<?php

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$blockedUserPhone = $_POST['blockedUserPhone'];
$userPhone = $_POST['userPhone'];

$sql = "insert into smartend_blackList(userPhone, blockedUserPhone) 
            values ('".$userPhone."', '".$blockedUserPhone."')";
      
if( $mysqli->query($sql)){
    echo json_encode('successful');
}else{
    echo json_encode('error');
}


