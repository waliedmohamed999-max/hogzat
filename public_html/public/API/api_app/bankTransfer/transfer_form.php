<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$phone = $_POST['phone'];
	$full_name = $_POST['full_name'];
	$reason = $_POST['reason'];
	$ref_number = $_POST['ref_number'];
	$id_payment_type = $_POST['id_payment_type'];
	
	$img_invoice = $_FILES['img_invoice']['name'];
    $image_path_invoice = '../../assets/images/transfers/'.$img_invoice;
    $tmp_name_invoice = $_FILES['img_invoice']['tmp_name'];
    move_uploaded_file($tmp_name_invoice,$image_path_invoice);
	
/*........................*/
$sql = "INSERT INTO `transfers` (`id_transfer`, `phone`, `full_name`, `reason`, `ref_number`, `img_invoice`, `id_payment_type`) VALUES (NULL, '".$phone."', '".$full_name."', '".$reason."', '".$ref_number."', '".$img_invoice."', '".$id_payment_type."');";
	if (mysqli_query($mysqli, $sql)) {
} else {
  echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
}
/*........................*/

} else {
    
}

?>
