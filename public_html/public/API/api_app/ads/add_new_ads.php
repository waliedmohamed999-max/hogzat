<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    

	$auth_key = $_POST['auth_key'];
$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    
	$detailsAqar = $_POST['detailsAqar'];
	$isFootballCourt = $_POST['isFootballCourt'];
	$isVolleyballCourt = $_POST['isVolleyballCourt'];
	$isAmusementPark = $_POST['isAmusementPark'];
	$isFamilyPartition = $_POST['isFamilyPartition'];
	$isVerse = $_POST['isVerse'];
	$isCellar = $_POST['isCellar'];
	$isMaidRoom = $_POST['isMaidRoom'];
	$isSwimmingPool = $_POST['isSwimmingPool'];
	$isDriverRoom = $_POST['isDriverRoom'];
	$isDuplex = $_POST['isDuplex'];
	$isHallStaircase = $_POST['isHallStaircase'];
	$isConditioner = $_POST['isConditioner'];
	$isElevator = $_POST['isElevator'];
	$isCarEntrance = $_POST['isCarEntrance'];
	$isAppendix = $_POST['isAppendix'];
	$isKitchen = $_POST['isKitchen'];
	$isFurnished = $_POST['isFurnished'];
	$isYard = $_POST['isYard'];
	$StreetWidth = $_POST['StreetWidth'];
	$Floor = $_POST['Floor'];
	$Trees = $_POST['Trees'];
	$Wells = $_POST['Wells'];
	$Stores = $_POST['Stores'];
	$Apartments = $_POST['Apartments'];
	$AgeOfRealEstate = $_POST['AgeOfRealEstate'];
	$Rooms = $_POST['Rooms'];
	$Toilets = $_POST['Toilets'];
	$Lounges = $_POST['Lounges'];
	$selectedTypeAqar = $_POST['selectedTypeAqar'];
	$selectedFamily = $_POST['selectedFamily'];
	$interfaceSelected = $_POST['interfaceSelected'];
	$totalSpace = $_POST['totalSpace'];
	$totalPrice = $_POST['totalPrice'];
	$selectedPlan = $_POST['selectedPlan'];
	$id_category = $_POST['id_category'];
	$ads_cordinates_lat = $_POST['ads_cordinates_lat'];
	$ads_cordinates_lng = $_POST['ads_cordinates_lng'];
	$selectedAdderRelation = $_POST['selectedAdderRelation'];
	$selectedMarketerRelation = $_POST['selectedMarketerRelation'];
	$phone = $_POST['_phone'];
	
	$ads_city = $_POST['ads_city'];
	$ads_neighborhood = $_POST['ads_neighborhood'];
	$ads_road = $_POST['ads_road'];
	
	/* ****************** */
	
	
// 	echo json_encode($_POST) ;

	/***********************/
	

   
      $video = $_FILES['video']['name'];
      $videoPath = '../../assets/videos/'.$video;
      $tmp_name_video = $_FILES['video']['tmp_name'];
      move_uploaded_file($tmp_name_video,$videoPath);
      
    
    
	
	/*...........adsDescription.............*/
	
	
	
	
// 	$sqlDescriptionId = 'select max(id) from smartend_adsDescription';
// 	$result2 = mysqli_query($mysqli, $sqlDescriptionId);
// 	$x = mysqli_fetch_assoc($result2);
// 	echo json_encode($x);
	
// 	$id_description = intval($x['max(id)']) + 1;
// // 	echo json_encode($id_description);
	
	
	$sql1 = "INSERT INTO `smartend_adsDescription` (`id`, `lat`, `lng`,  `ads_city`, `ads_neighborhood`, `ads_road`, `video`, `space`, `price`, `description`, `id_typeRes`, `id_type_aqar`, `id_interface`, `id_adder_relation`, `id_marketer_relation`) VALUES (NULL, '".$ads_cordinates_lat."', '".$ads_cordinates_lng."', '".$ads_city."', '".$ads_neighborhood."', '".$ads_road."', '".$video."', '".$totalSpace."', '".$totalPrice."', '".$detailsAqar."', '".$selectedPlan."', '".$selectedTypeAqar."', '".$interfaceSelected."', '".$selectedAdderRelation."', '".$selectedMarketerRelation."');";
	if (mysqli_query($mysqli, $sql1)) {
    } else {
      
    }
    $sql2 = "SELECT `id` FROM `smartend_adsDescription` ORDER BY `id` DESC LIMIT 1";
	$result2 = mysqli_query($mysqli, $sql2);
	
	if (mysqli_num_rows($result2) > 0) {
      while($row2 = mysqli_fetch_assoc($result2)) {
         $id_description = $row2["id"];
      }
    } else {
      $id_description='';
    }
	
	/*.........end adsDescription...................*/
	


if(!$_FILES['image']) {
    $sql889 = "INSERT INTO `smartend_adsImages` (`id`, `ads_image`, `id_description`) VALUES (NULL, 'APIadsImage.png', '".$id_description."');";
    if (mysqli_query($mysqli, $sql889)) {
    } else {
      echo "Error: " . $sql889 . "<br>" . mysqli_error($mysqli);
    } 
    
} else {

foreach ($_FILES['image']['tmp_name'] as $key => $tmp_name) {
        $file_name = 'API'.rand(0,99999999).$key . $_FILES['image']['name'][$key];
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
}





	/*..........booleanFeatureAqar..................*/
	$sql3 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isFootballCourt."', '".$id_description."', '21');";
	if (mysqli_query($mysqli, $sql3)) {
    } else {
      echo "Error: " . $sql3 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql4 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isVolleyballCourt."', '".$id_description."', '22');";
	if (mysqli_query($mysqli, $sql4)) {
    } else {
      echo "Error: " . $sql4 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql5 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isAmusementPark."', '".$id_description."', '23');";
	if (mysqli_query($mysqli, $sql5)) {
    } else {
      echo "Error: " . $sql5 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql6 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isFamilyPartition."', '".$id_description."', '3');";
	if (mysqli_query($mysqli, $sql6)) {
    } else {
      echo "Error: " . $sql6 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql7 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isVerse."', '".$id_description."', '24');";
	if (mysqli_query($mysqli, $sql7)) {
    } else {
      echo "Error: " . $sql7 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql8 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isCellar."', '".$id_description."', '16');";
	if (mysqli_query($mysqli, $sql8)) {
    } else {
      echo "Error: " . $sql8 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql9 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isMaidRoom."', '".$id_description."', '19');";
	if (mysqli_query($mysqli, $sql9)) {
    } else {
      echo "Error: " . $sql9 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql10 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isSwimmingPool."', '".$id_description."', '20');";
	if (mysqli_query($mysqli, $sql10)) {
    } else {
      echo "Error: " . $sql10 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql11 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isDriverRoom."', '".$id_description."', '18');";
	if (mysqli_query($mysqli, $sql11)) {
    } else {
      echo "Error: " . $sql11 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql12 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isDuplex."', '".$id_description."', '25');";
	if (mysqli_query($mysqli, $sql12)) {
    } else {
      echo "Error: " . $sql12 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql13 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isHallStaircase."', '".$id_description."', '26');";
	if (mysqli_query($mysqli, $sql13)) {
    } else {
      echo "Error: " . $sql13 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql14 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isConditioner."', '".$id_description."', '27');";
	if (mysqli_query($mysqli, $sql14)) {
    } else {
      echo "Error: " . $sql14 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql15 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isElevator."', '".$id_description."', '7');";
	if (mysqli_query($mysqli, $sql15)) {
    } else {
      echo "Error: " . $sql15 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql16 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isCarEntrance."', '".$id_description."', '5');";
	if (mysqli_query($mysqli, $sql16)) {
    } else {
      echo "Error: " . $sql16 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql17 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isAppendix."', '".$id_description."', '12');";
	if (mysqli_query($mysqli, $sql17)) {
    } else {
      echo "Error: " . $sql17 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql18 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isKitchen."', '".$id_description."', '2');";
	if (mysqli_query($mysqli, $sql18)) {
    } else {
      echo "Error: " . $sql18 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql19 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isFurnished."', '".$id_description."', '1');";
	if (mysqli_query($mysqli, $sql19)) {
    } else {
      echo "Error: " . $sql19 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql2222 = "INSERT INTO `smartend_booleanFeatureAqar` (`id_BF_aqar`, `state`, `id_description`, `id_BFAT`) VALUES (NULL, '".$isYard."', '".$id_description."', '17');";
	if (mysqli_query($mysqli, $sql2222)) {
    } else {
      echo "Error: " . $sql2222 . "<br>" . mysqli_error($mysqli);
    }
    
    /*............end booleanFeatureAqar.............*/
    
	
	/*...........quantityFeatureAqar................*/
	$sql20 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$StreetWidth."', '".$id_description."', '13');";
	if (mysqli_query($mysqli, $sql20)) {
    } else {
      echo "Error: " . $sql20 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql22 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Floor."', '".$id_description."', '10');";
	if (mysqli_query($mysqli, $sql22)) {
    } else {
      echo "Error: " . $sql22 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql23 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Trees."', '".$id_description."', '14');";
	if (mysqli_query($mysqli, $sql23)) {
    } else {
      echo "Error: " . $sql23 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql24 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Wells."', '".$id_description."', '15');";
	if (mysqli_query($mysqli, $sql24)) {
    } else {
      echo "Error: " . $sql24 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql25 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Stores."', '".$id_description."', '16');";
	if (mysqli_query($mysqli, $sql25)) {
    } else {
      echo "Error: " . $sql25 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql26 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Apartments."', '".$id_description."', '12');";
	if (mysqli_query($mysqli, $sql26)) {
    } else {
      echo "Error: " . $sql26 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql27 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$AgeOfRealEstate."', '".$id_description."', '11');";
	if (mysqli_query($mysqli, $sql27)) {
    } else {
      echo "Error: " . $sql27 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql28 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Rooms."', '".$id_description."', '9');";
	if (mysqli_query($mysqli, $sql28)) {
    } else {
      echo "Error: " . $sql28 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql29 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Toilets."', '".$id_description."', '8');";
	if (mysqli_query($mysqli, $sql29)) {
    } else {
      echo "Error: " . $sql29 . "<br>" . mysqli_error($mysqli);
    }
    
    $sql30 = "INSERT INTO `smartend_quantityFeatureAqar` (`id_QF_aqar`, `quantity`, `id_description`, `id_QFAT`) VALUES (NULL, '".$Lounges."', '".$id_description."', '7');";
	if (mysqli_query($mysqli, $sql30)) {
    } else {
      echo "Error: " . $sql30 . "<br>" . mysqli_error($mysqli);
    }
    
    /*..........end quantityFeatureAqar..............*/
	
	/*............user...............................*/ 
	 
	$sql31 = "SELECT * FROM `smartend_user` WHERE `phone`='".$phone."';";
	$result31 = mysqli_query($mysqli, $sql31);
	if (mysqli_num_rows($result31) > 0) {
      while($row31 = mysqli_fetch_assoc($result31)) {
        $id_user = $row31["id"];
      }
    } else {
      $id_user='';
    }
	 
	/*..........end user..........................*/
	/*............title...............................*/ 
	 
	$sql34 = "SELECT * FROM `smartend_categoryAqar` WHERE `id`='".$id_category."';";
	$result34 = mysqli_query($mysqli, $sql34);
	if (mysqli_num_rows($result34) > 0) {
      while($row34 = mysqli_fetch_assoc($result34)) {
        $title = $row34["name"];
      }
    } else {
      $title='';
    }
	 
	/*..........end title..........................*/
	/*...........final............................*/
	$sql32 = "INSERT INTO `smartend_ads` (`id`, `title`, `timeAdded`, `timeUpdated`, `time_update_ad`, `updated_at`, `views`, `id_special`, `id_category`, `id_user`, `id_description`) VALUES (NULL, '".$title."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '3', '0', '".$id_category."', '".$id_user."', '".$id_description."');";
	
	if (mysqli_query($mysqli, $sql32)) {
    } else {
      echo "Error: " . $sql32 . "<br>" . mysqli_error($mysqli);
    }
    /*...........end final.......................*/
} else {
    
}
?>