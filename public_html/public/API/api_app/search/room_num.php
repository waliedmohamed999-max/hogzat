<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$rooms = $_POST['rooms'];

$queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id_description, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id_ads_images, i.ads_image, i.id_description,
     a.id_ads, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description, a.id_city,
     u.id_user, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id_ads_images`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id_ads_images` 
           
INNER JOIN adsDescription AS d
           ON i.id_description = d.id_description 
           
INNER JOIN quantityFeatureAqar AS qf
           ON i.id_description = qf.id_description
           AND qf.id_QFAT = '9'
           AND qf.quantity = '".$rooms."'
           
INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           
INNER JOIN user AS u
           ON u.id_user = a.id_user
  
");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);

} else {
    
}

?>