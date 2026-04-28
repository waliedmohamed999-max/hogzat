<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    

$image = $_FILES['image']['name'];
$phone = $_POST['phone'];
$CRNumber = $_POST['CRNumber'];
$officeName = $_POST['officeName'];
$lat = $_POST['lat'];
$lng = $_POST['lng'];



$imagePath = '../../assets/images/offices/'.$image;

$tmp_name = $_FILES['image']['tmp_name'];

move_uploaded_file($tmp_name,$imagePath);

$sql2 = "INSERT INTO `smartend_officesAqar` (`id_offices`, `office_name`, `office_lat`, `office_lng`, `sejel`, `sejel_image`, `state`, `phone_user`) VALUES (NULL, '".$officeName."', '".$lat."', '".$lng."', '".$CRNumber."', '".$image."', '0', '".$phone."');";
if (mysqli_query($mysqli, $sql2)) {
	    
} else {
  echo "Error: " . $sql2 . "<br>" . mysqli_error($mysqli);
}



} else {
    
}


?>