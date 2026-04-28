<?php

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone = $_POST['phone'];
$other_phone = $_POST['other_phone'];


$queryResult=$mysqli->query("SELECT * FROM `conversations`,`comment` WHERE `conversations`.`id_comment` = `comment`.`id_comment` AND ((`conversations`.`phone_user_sender` = '".$other_phone."' AND `conversations`.`phone_user_recipient` = '".$phone."')) AND `conversations`.`seen_reciever` = '0';");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode(count($result));
// echo json_encode($result);
} else {
    
}
?>