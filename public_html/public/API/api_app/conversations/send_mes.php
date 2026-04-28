<?php

// include("/home/tadawlstore/public_html/core/app/Events/MessageSent.php");

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone = $_POST['phone'];
$other_phone = $_POST['other_phone'];
$message = $_POST['message'];
$msg_type = $_POST['msg_type'];
$voice_duration = $_POST['voice_duration'];


$voice = $_FILES['voice']['name'];
$voicePath = '../../assets/voices/'.$voice;
$tmp_name_voice = $_FILES['voice']['tmp_name'];
move_uploaded_file($tmp_name_voice,$voicePath);

$blocked = 0;

$sql = "select * from blackList where userPhone = '".$other_phone."' 
        and blockedUserPhone = '".$phone."'";

$result = mysqli_query($mysqli, $sql);

if(mysqli_num_rows($result) > 0){
  $blocked = 1;
}
/*..............................................*/


$sql9 = "INSERT INTO `comment` (`id_comment`,`msg_type`, `comment`, `image_comment`, `voice_comment`, `voice_duration` , `timeAdded`) VALUES (NULL, '".$msg_type."','".$message."',NULL ,'".$voice."' ,'".$voice_duration."' , CURRENT_TIMESTAMP);";



	
if (mysqli_query($mysqli, $sql9)) {
} else {
echo "Error: " . $sql9 . "<br>" . mysqli_error($mysqli);
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

$sql10 = "INSERT INTO `conversations` (`id_conv`, `state_conv_sender`, `state_conv_receiver`,`seen_sender`, `seen_reciever`, `id_comment`, `phone_user_recipient`,`phone_user_sender`, `blocked`)VALUES (NULL, '1', '1', '1', '0', '".$id_comment."','".$other_phone."', '".$phone."', '".$blocked."');";
	
// if (mysqli_query($mysqli, $sql10)) {
// } else {
//   echo "Error: " . $sql10 . "<br>" . mysqli_error($mysqli);
// }


// $sql10 = "INSERT INTO `conversations` (`id_conv`, `state_conv_sender`, `state_conv_receiver`, `seen_sender`, `seen_reciever`, `id_comment`, `phone_user_recipient`, `phone_user_sender`) VALUES (NULL, '1', '1', '1', '0', '".$id_comment."', '".$other_phone."', '".$phone."');";

if (mysqli_query($mysqli, $sql10)) {
    $user = "SELECT * FROM `smartend_user` WHERE `phone` = '".$phone."'";
    $message = $message;
     broadcast(new home/tadawlstore/public_html/core/app/Events/MessageSent($user, $message))->toOthers();
} else {
echo "Error: " . $sql10 . "<br>" . mysqli_error($mysqli);
}


} else {
    
}

?>