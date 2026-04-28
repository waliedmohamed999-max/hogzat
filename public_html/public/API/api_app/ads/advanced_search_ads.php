<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {

$selectedTypeAqar = $_POST['selectedTypeAqar'];
$interfaceSelected = $_POST['interfaceSelected'];
$streetWidthSelected = $_POST['streetWidthSelected'];
$ageOfRealEstateSelected = $_POST['ageOfRealEstateSelected'];
$maxPrice = $_POST['maxPrice'];
$minPrice = $_POST['minPrice'];
$maxSpace = $_POST['maxSpace'];
$minSpace = $_POST['minSpace'];
$selectedLounges = $_POST['selectedLounges'];
$selectedToilets = $_POST['selectedToilets'];
$selectedRooms = $_POST['selectedRooms'];
$selectedApartments = $_POST['selectedApartments'];
$selectedPlan = $_POST['selectedPlan'];
$storesSelected = $_POST['storesSelected'];
$floorSelected = $_POST['floorSelected'];
$selectedFamilyType = $_POST['selectedFamilyType'];
$treesSelected = $_POST['treesSelected'];
$wellsSelected = $_POST['wellsSelected'];
$isHallStaircase = $_POST['isHallStaircase'];
$isDriverRoom = $_POST['isDriverRoom'];
$isMaidRoom = $_POST['isMaidRoom'];
$isSwimmingPool = $_POST['isSwimmingPool'];
$isFurnished = $_POST['isFurnished'];
$isVerse = $_POST['isVerse'];
$isMonsters = $_POST['isMonsters'];
$isKitchen = $_POST['isKitchen'];
$isAppendix = $_POST['isAppendix'];
$isCarEntrance = $_POST['isCarEntrance'];
$isCellar = $_POST['isCellar'];
$isElevator = $_POST['isElevator'];
$isDuplex = $_POST['isDuplex'];
$isFootballCourt = $_POST['isFootballCourt'];
$isVolleyballCourt = $_POST['isVolleyballCourt'];
$isAmusementPark = $_POST['isAmusementPark'];
$isFamilyPartition = $_POST['isFamilyPartition'];
$isConditioner = $_POST['isConditioner'];



$queryResult=$mysqli->query("
SELECT DISTINCT  
     d.id_description, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id_ads_images, i.ads_image, i.id_description,
     a.id_ads, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description, a.id_city,
     u.id_user, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM smartend_adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id_ads_images`) 'max_id' FROM smartend_adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id_ads_images` 
           
INNER JOIN smartend_adsDescription AS d
           ON i.id_description = d.id_description 
           
INNER JOIN smartend_ads AS a
           ON i.id_description = a.id_description 
           
INNER JOIN smartend_user AS u
           ON u.id_user = a.id_user   
  
");

$result=array();
//$filteredResult=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}



//while($fetchFilterData = $result->fetch_assoc()){
    
 //   if($selectedTypeAqar !== '0') {
        
  //      if($fetchFilterData['id_type_aqar']==$selectedTypeAqar) {
  //          $filteredResult[]=$fetchFilterData;
   //     }
 //       
  //  }
   
    
//}



echo json_encode($result);

}else {
    
}



?>





