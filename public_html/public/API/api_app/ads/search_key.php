<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$key = $_POST['key'];


$queryResult=$mysqli->query("

SELECT * FROM `smartend_ads` WHERE `id_description`='".$key."'

");

$result1=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result1[]=$fetchData;
}
if(!empty($result1)) {
    echo json_encode($result1);
} else {
    $queryResult=$mysqli->query("

    SELECT * FROM `smartend_user` WHERE `phone` = '".$key."'
    
    ");
    
    $result2=array();
    
    while($fetchData=$queryResult->fetch_assoc()){
    	$result2[]=$fetchData;
    }
    
    if(!empty($result2)) {
        echo json_encode($result2);
    } else {
        echo json_encode("false");
        
    }
    
}

}else {
    
}

?>