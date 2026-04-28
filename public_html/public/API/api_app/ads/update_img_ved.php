<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
    $auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    $deletedImagesNames = $_POST['deleted_image_names'];

    
    $id_description = $_POST['id_description'];
    $ImagePath = '../../assets/images/ads/';
    
    
    foreach ($deletedImagesNames as $value) {
        
        unlink($ImagePath.$value);
        $sql1 = " DELETE FROM `smartend_adsImages` WHERE `ads_image` = '".$value."' ";
        mysqli_query($mysqli, $sql1);
    }
    

    
    
    $video = $_FILES['video']['name'];
    $videoPath = '../../assets/videos/'.$video;
    $tmp_name_video = $_FILES['video']['tmp_name'];
    move_uploaded_file($tmp_name_video,$videoPath);
    
    
    
    
    $sql2 = "
      UPDATE `smartend_adsDescription` SET `video` = '".$video."' WHERE `smartend_adsDescription`.`id` = '".$id_description."';
    ";

    if (mysqli_query($mysqli, $sql2)) {
    
         // echo "Done";
    } else {
          //echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
    }
    
    
    


    foreach ($_FILES['image']['tmp_name'] as $key => $tmp_name) {
            $file_name = $key . $_FILES['image']['name'][$key];
            $file_size = $_FILES['image']['size'][$key];
            $file_tmp = $_FILES['image']['tmp_name'][$key];
            $file_type = $_FILES['image']['type'][$key]; 
            
            $imagePath = '../../assets/images/ads/'.$file_name;
            move_uploaded_file($file_tmp,$imagePath);
            
            $sql33 = "INSERT INTO `smartend_adsImages` (`id`, `ads_image`, `id_description`) VALUES (NULL, '".$file_name."', '".$id_description."');";
    	if (mysqli_query($mysqli, $sql33)) {
        } else {
          echo "Error: " . $sql33 . "<br>" . mysqli_error($mysqli);
        } 
    
    
    }
    
    
    
} else {
    
}



?>