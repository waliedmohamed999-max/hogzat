<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone_user = $_POST['phone_user'];
$id_notification = $_POST['id_notification'];

$queryResult=$mysqli->query("

UPDATE `user_notification` 
SET `seen` = '1' 
WHERE `user_notification`.`id_notification` = '".$id_notification."'
AND `user_notification`.`phone_user` = '".$phone_user."'

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}
?>