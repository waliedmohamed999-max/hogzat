<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone_user = $_POST['phone_user'];

$queryResult=$mysqli->query("

SELECT un.`id_user_notification`, un.`id_notification` , un.`phone_user`, un.`seen`, 
n.`id_notification`, n.`title`, n.`body`, n.`state`, n.`response_phone_user`
FROM `user_notification` AS un
INNER JOIN `notifications`  AS n
ON un.`id_notification` = n.`id_notification`
AND un.`phone_user` = n.`response_phone_user`
AND un.`phone_user` = '".$phone_user."'

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}
?>