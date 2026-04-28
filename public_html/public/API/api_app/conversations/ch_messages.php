<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
$type = $_POST['type'];
$from_id = $_POST['from_id'];
$to_id = $_POST['to_id'];
$body = $_POST['body'];

//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
// $queryResult=$mysqli->query("SELECT * FROM `smartend_ch_messages` where `from_id`=$id ORDER BY `created_at`");
//

$sql9 = "INSERT INTO `smartend_ch_messages` (`id`,`type`, `from_id`, `to_id`, `body`, `attachment` , `seen`, `created_at`, `updated_at`) VALUES (RAND(), '".$type."','".$from_id."','".$to_id."' ,'".$body."' ,NULL ,0, CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);";


}
if (mysqli_query($mysqli, $sql9)) {
} else {
echo "Error: " . $sql9 . "<br>" . mysqli_error($mysqli);
}

?>
