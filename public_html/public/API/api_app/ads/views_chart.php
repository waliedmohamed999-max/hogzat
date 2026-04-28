<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$id_description = $_POST['id_description'];


$queryResult=$mysqli->query("

SELECT * FROM `smartend_viewsChart`, `weekDays` 
WHERE `smartend_viewsChart`.`id_description` = '".$id_description."' 
AND `smartend_viewsChart`.`day` = `weekDays`.`day`
           
");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}


?>

