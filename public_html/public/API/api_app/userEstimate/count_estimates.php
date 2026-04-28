<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone_user_estimated = $_POST['phone'];

$queryResult=$mysqli->query("

SELECT COUNT(`rate`) 
FROM `userEstimate` 
WHERE `phone_user_estimated`='".$phone_user_estimated."'

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}

?>