<?php

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone = $_POST['phone'];
$other_phone = $_POST['other_phone'];


$queryResult=$mysqli->query("

UPDATE conversations
SET conversations.seen_reciever = 1
WHERE conversations.id_conv IN
(SELECT c.id_conv FROM (SELECT id_conv FROM conversations WHERE phone_user_sender = '".$other_phone."' AND phone_user_recipient = '".$phone."' AND seen_reciever = '0') AS c)
 ");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo 'done';

} else {
    
}
?>