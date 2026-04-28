<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone = $_POST['phone'];
$idDescription = $_POST['id_description'];

$queryResult=$mysqli->query("


SELECT * FROM favourite WHERE
    id_ads = '".$idDescription."' AND phone_faved_user = '".$phone."';
");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

if($result[0]['isFav'] == '1'){
    echo json_encode(true);
}else{
    echo json_encode(false);
}
// echo json_encode($result);

} else {
    
}

?>

