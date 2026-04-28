<?php

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$phone = $_POST['phone'];
$other_phone = $_POST['other_phone'];


/*............user...............................*/ 
	 
//	$sql31 = "SELECT * FROM `user` WHERE `phone`='".$phone."';";
//	$result31 = mysqli_query($mysqli, $sql31);
//	if (mysqli_num_rows($result31) > 0) {
 //     while($row31 = mysqli_fetch_assoc($result31)) {
 //       $id_user = $row31["id_user"];
 //     }
 //   } else {
 //     $id_user='';
 //   }
	 
/*..........end user............................*/

$queryResult=$mysqli->query("SELECT * FROM `conversations`,`comment` 
                            WHERE `conversations`.`id_comment` = `comment`.`id_comment` 
                            AND (   
                                    (`conversations`.`phone_user_sender` = '".$phone."' AND `conversations`.`phone_user_recipient` = '".$other_phone."' and conversations.state_conv_sender = 1) 
                                     OR
                                     (`conversations`.`phone_user_sender` = '".$other_phone."' AND `conversations`.`phone_user_recipient` = '".$phone."' and `conversations`.`blocked` = 0 and conversations.state_conv_receiver = 1)
                                )
                            ");
           

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}
?>