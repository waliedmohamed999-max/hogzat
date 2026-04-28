<?php
	include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
    
    $auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    $space = $_POST['space'];
	$frontLength = $_POST['frontLength'];
	$lessorCity = $_POST['lessorCity'];
	$lessorNeighborhood = $_POST['lessorNeighborhood'];
	$lessorStreet = $_POST['lessorStreet'];
	$lessorBuildingNumber = $_POST['lessorBuildingNumber'];
	$lesseeCity = $_POST['lesseeCity'];
	$lesseeNeighborhood = $_POST['lesseeNeighborhood'];
	$lesseeStreet = $_POST['lesseeStreet'];
	$lesseeBuildingNumber = $_POST['lesseeBuildingNumber'];
	$lessorID = $_POST['lessorID'];
	$lessorPhone = $_POST['lessorPhone'];
	$lesseeID = $_POST['lesseeID'];
	$lesseePhone = $_POST['lesseePhone'];
	$fixedWaterValue = $_POST['fixedWaterValue'];
	$fixedElectricityValue = $_POST['fixedElectricityValue'];
	$central = $_POST['central'];
	$window = $_POST['window'];
	$split = $_POST['split'];
	$contractStartingDate = $_POST['contractStartingDate'];
	$annualRent = $_POST['annualRent'];
	$collateralAmountValue = $_POST['depositValue'];
	$startingPeriod = $_POST['startingPeriod'];
	$terminationPeriod = $_POST['terminationPeriod'];
	$additionalDetails = $_POST['additionalDetails'];
	$units = $_POST['units'];
	$selectedScratchy = $_POST['selectedScratchy'];
	$selectedUnitFloor = $_POST['selectedUnitFloor'];
	$selectedWaterValue = $_POST['selectedWaterValue'];
	$selectedElectricityValue = $_POST['selectedElectricityValue'];
	$selectedRentPaymentCycle = $_POST['selectedRentPaymentCycle'];
	$selectedAqarType = $_POST['selectedAqar'];
	
    $imageSejel = $_FILES['imageSejel']['name'];
    $imagePathSejel = '../../assets/images/rent_contract/'.$imageSejel;
    $tmp_name_Sejel = $_FILES['imageSejel']['tmp_name'];
    move_uploaded_file($tmp_name_Sejel,$imagePathSejel);
    
    $imageSaq = $_FILES['imageSaq']['name'];
    $imagePathSaq = '../../assets/images/rent_contract/'.$imageSaq;
    $tmp_name_saq = $_FILES['imageSaq']['tmp_name'];
    move_uploaded_file($tmp_name_saq,$imagePathSaq);
    
	
	
	
	/*........................*/
	$sql15 = "INSERT INTO `addressPartyContract` (`id_address`, `building_number`, `street`, `city`, `neighborhood`) VALUES (NULL, '".$lesseeBuildingNumber."', '".$lesseeStreet."', '".$lesseeCity."', '".$lesseeNeighborhood."');";
	if (mysqli_query($mysqli, $sql15)) {
  //$id_leasee = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql15 . "<br>" . mysqli_error($mysqli);
}
	
	
	 $sql16 = "SELECT `id_address` FROM `addressPartyContract` ORDER BY `id_address` DESC LIMIT 1";
	 $result16 = mysqli_query($mysqli, $sql16);
	 if (mysqli_num_rows($result16) > 0) {
  while($row16 = mysqli_fetch_assoc($result16)) {
      $id_address_leasee = $row16["id_address"];
  }
} else {
  $id_address_leasee='';
}
	
	/*........................*/
	$sql1 = "INSERT INTO `leasee` (`id_leasee`, `identity_number`, `phone`, `dob`, `id_address`) VALUES (NULL, '".$lesseeID."', '".$lesseePhone."', NULL, '".$id_address_leasee."');";
	if (mysqli_query($mysqli, $sql1)) {
  //$id_leasee = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql1 . "<br>" . mysqli_error($mysqli);
}
	

/*........................*/
	$sql17 = "INSERT INTO `addressPartyContract` (`id_address`, `building_number`, `street`, `city`, `neighborhood`) VALUES (NULL, '".$lessorBuildingNumber."', '".$lessorStreet."', '".$lessorCity."', '".$lessorNeighborhood."');";
	if (mysqli_query($mysqli, $sql17)) {
  //$id_leasee = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql17 . "<br>" . mysqli_error($mysqli);
}
	
	
	 $sql18 = "SELECT `id_address` FROM `addressPartyContract` ORDER BY `id_address` DESC LIMIT 1";
	 $result18 = mysqli_query($mysqli, $sql18);
	 if (mysqli_num_rows($result18) > 0) {
  while($row18 = mysqli_fetch_assoc($result18)) {
      $id_address_leased = $row18["id_address"];
  }
} else {
  $id_address_leasee='';
}


	
	/*........................*/
	$sql2 = "INSERT INTO `leased` (`id_leased`, `identity_number`, `phone`, `dob`, `isAgent`, `isOwner`, `id_address`) VALUES (NULL, '".$lessorID."', '".$lessorPhone."', NULL, '0', '0', '".$id_address_leased."');";
	    if (mysqli_query($mysqli, $sql2)) {
  //$id_leased = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql2 . "<br>" . mysqli_error($mysqli);
}

	/*........................*/
	if(($selectedWaterValue == '0')&&($selectedElectricityValue == '0')) {
	    $sql5 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '1', '1', '".$fixedWaterValue."', '".$fixedElectricityValue."', NULL, NULL, NULL);";
	    if (mysqli_query($mysqli, $sql5)) {
  //$id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql5 . "<br>" . mysqli_error($mysqli);
}
	    
	}
	else if(($selectedWaterValue == '1')&&($selectedElectricityValue == '0')) {
	    $sql6 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '0', '1', NULL, '".$fixedElectricityValue."', NULL, NULL, NULL);";
	    if (mysqli_query($mysqli, $sql6)) {
  //$id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql6 . "<br>" . mysqli_error($mysqli);
}
	    
	}
	else if(($selectedWaterValue == '0')&&($selectedElectricityValue == '1')) {
	    $sql7 = "INSERT INTO `waterElectricity` (`id_water_electricity`, `is_water_fixed_amount`, `is_electricity_fixed_amount`, `water_value`, `electricity_value`, `gas_meter_number`, `water_meter_number`, `electricity_meter_number`) VALUES (NULL, '1', '0', '".$fixedWaterValue."', NULL, NULL, NULL, NULL);";
	    if (mysqli_query($mysqli, $sql7)) {
  //$id_water_electricity = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql7 . "<br>" . mysqli_error($mysqli);
}

	}
	
	
	/*........................*/
	$sql8 = "INSERT INTO `contractAds` (`id_contract_ads`, `aqar_type`, `floor_count`, `is_car_parking`, `car_parking`, `is_elevator`, `elevator_count`, `space`, `front_length`, `is_scratchy`, `unit_floor_number`, `unit_type`, `unit_count`, `room_count`, `lounge_count`, `wc_count`, `central_count`, `window_count`, `split_count`, `is_kitchen`, `is_furnished`, `is_new_furnished`) VALUES (NULL, '".$selectedAqarType."', NULL, NULL, NULL, NULL, NULL, '".$space."', '".$frontLength."', '".$selectedScratchy."', '".$selectedUnitFloor."', NULL, '".$units."', NULL, NULL, NULL, '".$central."', '".$window."', '".$split."', NULL, NULL, NULL);";
	if (mysqli_query($mysqli, $sql8)) {
  //$id_contract_ads = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql8 . "<br>" . mysqli_error($mysqli);
}
	
	
	/*........................*/
	/*........................*/
	
	$sql9 = "SELECT `id_water_electricity` FROM `waterElectricity` ORDER BY `id_water_electricity` DESC LIMIT 1";
	$result9 = mysqli_query($mysqli, $sql9);
	
	if (mysqli_num_rows($result9) > 0) {
  while($row9 = mysqli_fetch_assoc($result9)) {
      $id_water_electricity = $row9["id_water_electricity"];
  }
} else {
  $id_water_electricity='';
}
	
	/*........................*/ 
	 $sql10 = "SELECT `id_contract_ads` FROM `contractAds` ORDER BY `id_contract_ads` DESC LIMIT 1";
	 $result10 = mysqli_query($mysqli, $sql10);
	 if (mysqli_num_rows($result10) > 0) {
  while($row10 = mysqli_fetch_assoc($result10)) {
      $id_contract_ads = $row10["id_contract_ads"];
  }
} else {
  $id_contract_ads='';
}
	 
	 /*........................*/
	 $sql12 = "SELECT `id_leased` FROM `leased` ORDER BY `id_leased` DESC LIMIT 1";
	 $result12 = mysqli_query($mysqli, $sql12);
	 if (mysqli_num_rows($result12) > 0) {
  while($row12 = mysqli_fetch_assoc($result12)) {
      $id_leased = $row12["id_leased"];
  }
} else {
  $id_leased='';
}
	 
	 
	 /*........................*/
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
	$sql14 = "INSERT INTO `rentContract` (`id_RC`, `contract_type`, `contract_start_date`, `rent_payment_cycle`, `disposit_value`, `annual_rent_payment`, `daily_disposit_value`, `specified_period_days_opening`, `specified_period_days_terminating`, `other_datails`, `img_agency`, `img_instrument`, `img_commercial_record`, `id_leasee`, `id_leased`, `id_building_address`, `id_contract_ads`, `id_water_electricity`) VALUES (NULL, '2', '".$contractStartingDate."', '".$selectedRentPaymentCycle."', '".$collateralAmountValue."', '".$annualRent."', NULL, '".$startingPeriod."', '".$terminationPeriod."', '".$additionalDetails."', NULL, '".$imageSaq."', '".$imageSejel."', '".$id_leasee."', '".$id_leased."', NULL, '".$id_contract_ads."', '".$id_water_electricity."');";
	
	if (mysqli_query($mysqli, $sql14)) {
  $id_contract = mysqli_insert_id($mysqli);
} else {
  echo "Error: " . $sql14 . "<br>" . mysqli_error($mysqli);
}
	

} else {
    
}

?>