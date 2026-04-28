<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
    $auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    
    $id_description = $_POST['id_description'];
    
	
	$sql1 = "
       DELETE FROM `smartend_ads` WHERE `id_description` = '".$id_description."'
    ";

    if (mysqli_query($mysqli, $sql1)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    $sql2 = "
       DELETE FROM `smartend_adsDescription` WHERE `id` = '".$id_description."'
    ";

    if (mysqli_query($mysqli, $sql2)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    $sql3 = "
       DELETE FROM `smartend_adsImages` WHERE `id_description` = '".$id_description."'
    ";

    if (mysqli_query($mysqli, $sql3)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    $sql4 = "
       DELETE FROM `smartend_booleanFeatureAqar` WHERE `id_description` = '".$id_description."'
    ";

    if (mysqli_query($mysqli, $sql4)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    $sql5 = "
       DELETE FROM `smartend_quantityFeatureAqar` WHERE `id_description` = '".$id_description."'
    ";

    if (mysqli_query($mysqli, $sql5)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    
} else{
    
}  
    

?>