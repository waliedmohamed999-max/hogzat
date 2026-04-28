<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
    
    
    $video = $_FILES['video']['name'];
    $videoPath = '../../assets/videos/'.$video;
    $tmp_name_video = $_FILES['video']['tmp_name'];
    move_uploaded_file($tmp_name_video,$videoPath);
    
    
    $sql2 = "SELECT `id` FROM `smartend_adsDescription` ORDER BY `id` DESC LIMIT 1";
	$result2 = mysqli_query($mysqli, $sql2);
	
	if (mysqli_num_rows($result2) > 0) {
      while($row2 = mysqli_fetch_assoc($result2)) {
         $id_description = $row2["id"];
      }
    } else {
      $id_description='';
    }
    
    $sql32 = "
    
    UPDATE `smartend_adsDescription` SET `video` = '".$video."' WHERE `smartend_adsDescription`.`id` = '".$id_description."';
    
    ";
	
	if (mysqli_query($mysqli, $sql32)) {
    } else {
    }
    
    
    
?> 