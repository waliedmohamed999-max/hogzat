<?php


include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];

$phone = $_POST['phone'];
$other_phone = $_POST['other_phone'];
$msg_type = $_POST['msg_type'];

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
if(!$_FILES['image']) {
    $sql889 = "INSERT INTO `smartend_adsImages` (`id`, `ads_image`, `id_description`) VALUES (NULL, 'logoads.png', '".$id_description."');";
    if (mysqli_query($mysqli, $sql889)) {
    } else {
      //echo "Error: " . $sql33 . "<br>" . mysqli_error($mysqli);
    } 
    
} else {

foreach ($_FILES['image']['tmp_name'] as $key => $tmp_name) {
        $file_name = $key . $_FILES['image']['name'][$key];
        $file_size = $_FILES['image']['size'][$key];
        $file_tmp = $_FILES['image']['tmp_name'][$key];
        $file_type = $_FILES['image']['type'][$key]; 
        
        $imagePath = '../../assets/images/msgs/'.$file_name;
        move_uploaded_file($file_tmp,$imagePath);
        
        $sql33 = "INSERT INTO `comment` (`id_comment`,`msg_type`, `comment`, `image_comment`, `voice_comment`, `timeAdded`) VALUES (NULL, '".$msg_type."',Null ,'".$file_name."' ,Null , CURRENT_TIMESTAMP);";
	if (mysqli_query($mysqli, $sql33)) {
    } else {
      //echo "Error: " . $sql33 . "<br>" . mysqli_error($mysqli);
    } 
    
/*.............................................*/

$sql11 = "SELECT `id_comment` FROM `comment` ORDER BY `id_comment` DESC LIMIT 1";
 $result11 = mysqli_query($mysqli, $sql11);
 if (mysqli_num_rows($result11) > 0) {
while($row11 = mysqli_fetch_assoc($result11)) {
  $id_comment = $row11["id_comment"];
}
} else {
$id_comment='';
}


/*.............................................*/

$sql10 = "INSERT INTO `conversations` (`id_conv`, `state_conv_sender`, `state_conv_receiver`, `seen_sender`, `seen_reciever`, `id_comment`, `phone_user_recipient`, `phone_user_sender`) VALUES (NULL, '1', '1', '1', '0', '".$id_comment."', '".$other_phone."', '".$phone."');";

if (mysqli_query($mysqli, $sql10)) {
} else {
echo "Error: " . $sql10 . "<br>" . mysqli_error($mysqli);
}

    } 
}
}
else{}

?>