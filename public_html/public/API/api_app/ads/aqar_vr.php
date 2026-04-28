<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
    $auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    //$state_aqar = $_POST['state_aqar'];
	$identity_number = $_POST['identity_number'];
	$saq_number = $_POST['saq_number'];
	//$img_saq = $_POST['img_saq'];
	$identity_type = $_POST['identity_type'];
	$id_description = $_POST['vr_id_description'];

    $image_saq = $_FILES['img_saq']['name'];
    $image_saq_path = '../../assets/images/ver_ads/'.$image_saq;
    $tmp_saq_name = $_FILES['img_saq']['tmp_name'];
    move_uploaded_file($tmp_saq_name,$image_saq_path);

	$sql1 = "
	
	INSERT INTO `aqarVR` (`id_aqar_vr`, `state_aqar`, `identity_number`, `saq_number`, `img_saq`, `identity_type`, `vr_id_description`) VALUES (NULL, '0', '".$identity_number."', '".$saq_number."', '".$image_saq."', '".$identity_type."', '".$id_description."');
	
	";
	
	if (mysqli_query($mysqli, $sql1)) {
    } else {
      
    }

}else{}

?>