<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$id_ads = $_POST['id_ads'];
	
	$sql = "
	
	UPDATE `smartend_ads` SET `timeUpdated` = CURRENT_TIMESTAMP WHERE `smartend_ads`.`id_description` ='".$id_ads."';
	
	
	";
	if (mysqli_query($mysqli, $sql)) {
    } else {
      //echo "Error: " . $sql1 . "<br>" . mysqli_error($mysqli);
    }
    
    
}else {
    
}

?>