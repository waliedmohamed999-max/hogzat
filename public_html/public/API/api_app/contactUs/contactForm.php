<?php

	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$name = $_POST['name'];
	$mobile = $_POST['mobile'];
	$title = $_POST['title'];
	$description= $_POST['details'];
	
	
	
	$sql = "
	
	
	INSERT INTO `contactUs` (`id_contact`, `name`, `mobile`, `title`, `description`) VALUES (NULL, '".$name."', '".$mobile."', '".$title."', '".$description."');
	
	";
	if (mysqli_query($mysqli, $sql)) {
	    echo json_encode("true");
    } else {
      echo json_encode("false");
    }
	
} else {
    
}	  
	

?>