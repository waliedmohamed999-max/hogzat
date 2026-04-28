<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$lessorID = $_POST['lessorID'];
	$lessorPhone = $_POST['lessorPhone'];
	$lesseeID = $_POST['lesseeID'];
	$lesseePhone = $_POST['lesseePhone'];
	$buildingNumber = $_POST['buildingNumber'];
	$buildingPostalCode = $_POST['buildingPostalCode'];
	$buildingAdditionalNumber = $_POST['buildingAdditionalNumber'];
	$fixedWaterValue = $_POST['fixedWaterValue'];
	$fixedElectricityValue = $_POST['fixedElectricityValue'];
	$central = $_POST['central'];
	$window = $_POST['window'];
	$split = $_POST['split'];
	$dobLessor = $_POST['dobLessor'];
	$dobLessee = $_POST['dobLessee'];
	$contractStartingDate = $_POST['contractStartingDate'];
	$annualRent = $_POST['annualRent'];
	$dailyFineValue = $_POST['dailyFineValue'];
	$collateralAmountValue = $_POST['collateralAmountValue'];
	$startingPeriod = $_POST['startingPeriod'];
	$terminationPeriod = $_POST['terminationPeriod'];
	$waterMeter = $_POST['waterMeter'];
	$electricMeter = $_POST['electricMeter'];
	$gasMeter = $_POST['gasMeter'];
	$additionalDetails = $_POST['additionalDetails'];
	$units = $_POST['units'];
	$carParkings = $_POST['carParkings'];
	$selectedLessorType = $_POST['selectedLessorType'];
	$selectedScratchy = $_POST['selectedScratchy'];
	$selectedUnitFloor = $_POST['selectedUnitFloor'];
	$selectedWaterValue = $_POST['selectedWaterValue'];
	$selectedElectricityValue = $_POST['selectedElectricityValue'];
	$selectedRentPaymentCycle = $_POST['selectedRentPaymentCycle'];
	$selectedAqarType = $_POST['selectedAqarType'];
	$selectedFloors = $_POST['selectedFloors'];
	$selectedIsCarParking = $_POST['selectedIsCarParking'];
	$selectedIsElevators = $_POST['selectedIsElevators'];
	$selectedElevators = $_POST['selectedElevators'];
	$selectedUnitType = $_POST['selectedUnitType'];
	$selectedRooms = $_POST['selectedRooms'];
	$selectedLounges = $_POST['selectedLounges'];
	$selectedWCs = $_POST['selectedWCs'];
	$selectedIsReadyKitchen = $_POST['selectedIsReadyKitchen'];
	$selectedIsFurnished = $_POST['selectedIsFurnished'];
	$selectedIsNewFurnished = $_POST['selectedIsNewFurnished'];
	
    $imageWakala = $_FILES['imageWakala']['name'];
    $imagePathWakala = '../../assets/images/rent_contract/'.$imageWakala;
    $tmp_name_wakala = $_FILES['imageWakala']['tmp_name'];
    move_uploaded_file($tmp_name_wakala,$imagePathWakala);
    
    $imageSaq = $_FILES['imageSaq']['name'];
    $imagePathSaq = '../../assets/images/rent_contract/'.$imageSaq;
    $tmp_name_saq = $_FILES['imageSaq']['tmp_name'];
    move_uploaded_file($tmp_name_saq,$imagePathSaq);
    
	
	/*........................*/
	$sql1 = "INSERT INTO `leasee` (`id_leasee`, `identity_number`, `phone`, `dob`, `id_address`) VALUES (NULL, '".$lesseeID."', '".$lesseePhone."', '".$dobLessee."', NULL);";
	if (mysqli_query($mysqli, $sql1)) {
  $id_leasee = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql1 . "<br>" . mysqli_error($mysqli);
}
	
	
	
	//$mysqli->multi_query();
	//$id_leasee = $mysqli->lastInsertId();
	
	/*........................*/
	if($selectedLessorType == '0') {
	    $sql2 = "INSERT INTO `leased` (`id_leased`, `identity_number`, `phone`, `dob`, `isAgent`, `isOwner`, `id_address`) VALUES (NULL, '".$lessorID."', '".$lessorPhone."', '".$dobLessor."', '0', '1', NULL);";
	    if (mysqli_query($mysqli, $sql2)) {
  $id_leased = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql2 . "<br>" . mysqli_error($mysqli);
}
	    
	    
	    
	//$mysqli->multi_query();
	//$id_leased = $mysqli->lastInsertId();
	}
	else if($selectedLessorType == '1') {
	    $sql3 = "INSERT INTO `leased` (`id_leased`, `identity_number`, `phone`, `dob`, `isAgent`, `isOwner`, `id_address`) VALUES (NULL, '".$lessorID."', '".$lessorPhone."', '".$dobLessor."', '1', '0', NULL);";
	    if (mysqli_query($mysqli, $sql3)) {
  $id_leased = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql3 . "<br>" . mysqli_error($mysqli);
}
	    
	    
	    
	//$mysqli->multi_query();
	//$id_leased = $mysqli->lastInsertId();
	}
	
	
	/*........................*/
	$sql4 = "INSERT INTO `buildingAddress` (`id_building_address`, `building_number`, `postal_code`, `additional_number`) VALUES (NULL, '".$buildingNumber."', '".$buildingPostalCode."', '".$buildingAdditionalNumber."');";
	if (mysqli_query($mysqli, $sql4)) {
  $id_building_address = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql4 . "<br>" . mysqli_error($mysqli);
}
	
	
	
	//$mysqli->multi_query();
	//$id_building_address = $mysqli->lastInsertId();
	
	/*........................*/
	if(($selectedWaterValue == '0')&&($selectedElectricityValue == '0')) {
	    $sql5 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '1', '1', '".$fixedWaterValue."', '".$fixedElectricityValue."', '".$gasMeter."', '".$waterMeter."', '".$electricMeter."');";
	    if (mysqli_query($mysqli, $sql5)) {
  $id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql5 . "<br>" . mysqli_error($mysqli);
}
	    
	    
	    
	//$mysqli->multi_query();
	//$id_water_electricity = $mysqli->lastInsertId();
	}
	else if(($selectedWaterValue == '1')&&($selectedElectricityValue == '0')) {
	    $sql6 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '0', '1', NULL, '".$fixedElectricityValue."', '".$gasMeter."', '".$waterMeter."', '".$electricMeter."');";
	    if (mysqli_query($mysqli, $sql6)) {
  $id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql6 . "<br>" . mysqli_error($mysqli);
}
	    
	    
	//$mysqli->multi_query();
	//$id_water_electricity = $mysqli->lastInsertId();
	}
	else if(($selectedWaterValue == '0')&&($selectedElectricityValue == '1')) {
	    $sql7 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '1', '0', '".$fixedWaterValue."', NULL, '".$gasMeter."', '".$waterMeter."', '".$electricMeter."');";
	    if (mysqli_query($mysqli, $sql7)) {
  $id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql7 . "<br>" . mysqli_error($mysqli);
}
	    
	    
	//$mysqli->multi_query();
	//$id_water_electricity = $mysqli->lastInsertId();
	}
	
	
	/*........................*/
	$sql8 = "INSERT INTO `contractAds` (`id_contract_ads`, `aqar_type`, `floor_count`, `is_car_parking`, `car_parking`, `is_elevator`, `elevator_count`, `unit_floor_number`, `unit_type`, `unit_count`, `room_count`, `lounge_count`, `wc_count`, `central_count`, `window_count`, `split_count`, `is_kitchen`, `is_furnished`, `is_new_furnished`) VALUES (NULL, '".$selectedAqarType."', '".$selectedFloors."', '".$selectedIsCarParking."', '".$carParkings."', '".$selectedIsElevators."', '".$selectedElevators."', '".$selectedUnitFloor."', '".$selectedUnitType."', '".$units."', '".$selectedRooms."', '".$selectedLounges."', '".$selectedWCs."', '".$central."', '".$window."', '".$split."', '".$selectedIsReadyKitchen."', '".$selectedIsFurnished."', '".$selectedIsNewFurnished."');";
	if (mysqli_query($mysqli, $sql8)) {
  $id_contract_ads = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql8 . "<br>" . mysqli_error($mysqli);
}
	
	
	//$mysqli->multi_query();
	//$id_contract_ads = $mysqli->lastInsertId();
	
	
	
	$sql9 = "SELECT `id_water_electricity` FROM `waterElectricity` ORDER BY `id_water_electricity` DESC LIMIT 1";
	$result9 = mysqli_query($mysqli, $sql9);
	
	if (mysqli_num_rows($result9) > 0) {
  while($row9 = mysqli_fetch_assoc($result9)) {
      $id_water_electricity = $row9["id_water_electricity"];
  }
} else {
  $id_water_electricity='';
}
	
	 
	 $sql10 = "SELECT `id_contract_ads` FROM `contractAds` ORDER BY `id_contract_ads` DESC LIMIT 1";
	 $result10 = mysqli_query($mysqli, $sql10);
	 if (mysqli_num_rows($result10) > 0) {
  while($row10 = mysqli_fetch_assoc($result10)) {
      $id_contract_ads = $row10["id_contract_ads"];
  }
} else {
  $id_contract_ads='';
}


$sql11 = "SELECT `id_building_address` FROM `buildingAddress` ORDER BY `id_building_address` DESC LIMIT 1";
	 $result11 = mysqli_query($mysqli, $sql11);
	 if (mysqli_num_rows($result11) > 0) {
  while($row11 = mysqli_fetch_assoc($result11)) {
      $id_building_address = $row11["id_building_address"];
  }
} else {
  $id_building_address='';
}
	 
	 
	 $sql12 = "SELECT `id_leased` FROM `leased` ORDER BY `id_leased` DESC LIMIT 1";
	 $result12 = mysqli_query($mysqli, $sql12);
	 if (mysqli_num_rows($result12) > 0) {
  while($row12 = mysqli_fetch_assoc($result12)) {
      $id_leased = $row12["id_leased"];
  }
} else {
  $id_leased='';
}
	 
	 
	 
	 $sql13 = "SELECT `id_leasee` FROM `leasee` ORDER BY `id_leasee` DESC LIMIT 1";
	 $result13 = mysqli_query($mysqli, $sql13);
	 if (mysqli_num_rows($result13) > 0) {
  while($row13 = mysqli_fetch_assoc($result13)) {
      $id_leasee = $row13["id_leasee"];
  }
} else {
  $id_leasee='';
}
	 
	 
	 
	 
	
	
	
	
	
	
	/*........................*/
	/*........................*/
	$sql10 = "INSERT INTO `rentContract` (`id_RC`, `contract_type`, `contract_start_date`, `rent_payment_cycle`, `disposit_value`, `annual_rent_payment`, `daily_disposit_value`, `specified_period_days_opening`, `specified_period_days_terminating`, `other_datails`, `img_agency`, `img_instrument`, `img_commercial_record`, `id_leasee`, `id_leased`, `id_building_address`, `id_contract_ads`, `id_water_electricity`) VALUES (NULL, '1', '".$contractStartingDate."', '".$selectedRentPaymentCycle."', '".$collateralAmountValue."', '".$annualRent."', '".$dailyFineValue."', '".$startingPeriod."', '".$terminationPeriod."', '".$additionalDetails."', '".$imageWakala."', '".$imageSaq."', NULL, '".$id_leasee."', '".$id_leased."', '".$id_building_address."', '".$id_contract_ads."', '".$id_water_electricity."');";
	
	if (mysqli_query($mysqli, $sql10)) {
  $id_contract = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql10 . "<br>" . mysqli_error($mysqli);
}
	
	//$mysqli->multi_query($sql);
	//$id_leasee .. $id_leased .. $id_building_address .. $id_contract_ads .. $id_water_electricity
	
	//$mysqli->multi_query();
	


} else {
    
}



?>