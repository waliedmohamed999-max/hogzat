<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$id_description = $_POST['id_description'];
	$ads_city = $_POST['ads_city'];
	$ads_neighborhood = $_POST['ads_neighborhood'];
	$ads_road = $_POST['ads_road'];
	$lat = $_POST['lat'];
	$lng = $_POST['lng'];




    $sql = "UPDATE `smartend_adsDescription` SET `lat` = '".$lat."', `lng` = '".$lng."', `ads_city` = '".$ads_city."', `ads_neighborhood` = '".$ads_neighborhood."', `ads_road` = '".$ads_road."' WHERE `id` = '".$id_description."';";
    
	if (mysqli_query($mysqli, $sql)) {
    } else {
     
    }
    
  
}else {
    
}  

?>