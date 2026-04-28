<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$category = $_POST['category'];
$min_price = $_POST['min_price'];
$max_price = $_POST['max_price'];
$min_space = $_POST['min_space'];
$max_space = $_POST['max_space'];
$type_aqar = $_POST['type_aqar'];
$interface = $_POST['interface'];
$plan = $_POST['plan'];
$bool_feature1 = $_POST['bool_feature1'];
$bool_feature2 = $_POST['bool_feature2'];
$bool_feature3 = $_POST['bool_feature3'];
$bool_feature4 = $_POST['bool_feature4'];
$bool_feature5 = $_POST['bool_feature5'];
$bool_feature6 = $_POST['bool_feature6'];
$bool_feature7 = $_POST['bool_feature7'];
//$bool_feature8 = $_POST['bool_feature8'];
$bool_feature9 = $_POST['bool_feature9'];
$bool_feature10 = $_POST['bool_feature10'];
$bool_feature11 = $_POST['bool_feature11'];
$bool_feature12 = $_POST['bool_feature12'];
$bool_feature13 = $_POST['bool_feature13'];
$bool_feature14 = $_POST['bool_feature14'];
$bool_feature15 = $_POST['bool_feature15'];
$bool_feature16 = $_POST['bool_feature16'];
$bool_feature17 = $_POST['bool_feature17'];
$bool_feature18 = $_POST['bool_feature18'];
$age_of_real_estate = $_POST['age_of_real_estate'];
$apartements = $_POST['apartements'];
$floor = $_POST['floor'];
$lounges = $_POST['lounges'];
$rooms = $_POST['rooms'];
$stores = $_POST['stores'];
$street_width = $_POST['street_width'];
$toilets = $_POST['toilets'];
$trees = $_POST['trees'];
$wells = $_POST['wells'];


//..............................................................................
if($category == '0') {
        $queryResult=$mysqli->query("SELECT DISTINCT  
                          d.id as 'id_description', d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
                          i.id as 'image_id', i.ads_image,
                          a.id as 'ads_id', a.title, a.timeAdded, a.timeUpdated, a.time_update_ad, a.views, a.id_special, a.id_category,
                          u.id as 'user_id', u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                          
                  from smartend_adsDescription d 
                    inner join  smartend_adsImages i on d.id = i.id_description
                    inner join  smartend_ads a on d.id_description = a.id_description
                    inner join  smartend_user u on a.id_user = u.id
           
                  ");


// SELECT DISTINCT  
//      d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
//      i.id, i.ads_image, i.id_description,
//      a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
//      u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
// FROM adsImages AS i

// INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
//           ON x.`id_description` = i.`id_description` 
//           AND x.max_id = i.`id` 

// INNER JOIN adsDescription AS d
//           ON i.id_description = d.id 
           
// INNER JOIN user AS u
//           ON u.id = a.id_user  

// ");

$result=[];
// echo json_encode($fetchData=$queryResult->fetch_assoc()) ;
while($fetchData=$queryResult->fetch_assoc()){
        
        echo json_encode($fetchData);
      
	   // array_push($result, $fetchData);
}
// echo json_encode($fetchData);
// echo json_encode($result);
    
} 
// ................ all ...........................
else if($category == '1') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '1'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf2
           ON i.id_description = qf2.id_description
           AND qf2.id_QFAT = '12'
           AND IF('".$apartements."' <> '0', qf2.quantity = '".$apartements."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 


INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf4
           ON i.id_description = bf4.id_description
           AND (bf4.id_BFAT = '7' AND IF('".$bool_feature12."' <> 'false', bf4.state = 'true', 1=1) )


INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf6
           ON i.id_description = bf6.id_description
           AND (bf6.id_BFAT = '12' AND IF('".$bool_feature9."' <> 'false', bf6.state = 'true', 1=1))
                  
INNER JOIN booleanFeatureAqar AS bf7 
           ON i.id_description = bf7.id_description 
           AND (bf7.id_BFAT = '16' AND IF('".$bool_feature11."' <> 'false', bf7.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf9 
           ON i.id_description = bf9.id_description 
           AND (bf9.id_BFAT = '18' AND IF('".$bool_feature2."' <> 'false', bf9.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf10 
           ON i.id_description = bf10.id_description 
           AND (bf10.id_BFAT = '19' AND IF('".$bool_feature3."' <> 'false', bf10.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf11 
           ON i.id_description = bf11.id_description 
           AND (bf11.id_BFAT = '20' AND IF('".$bool_feature4."' <> 'false', bf11.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf16 
           ON i.id_description = bf16.id_description 
           AND (bf16.id_BFAT = '25' AND IF('".$bool_feature13."' <> 'false', bf16.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf17 
           ON i.id_description = bf17.id_description 
           AND (bf17.id_BFAT = '26' AND IF('".$bool_feature1."' <> 'false', bf17.state = 'true', 1=1) )
           
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... villa for sale ................
else if($category == '2') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '2'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 
           
INNER JOIN adsDescription AS d1
           ON i.id_description = d1.id
           AND IF('".$type_aqar."' <> '0', d1.id_type_aqar = '".$type_aqar."', 1=1)

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... land for sale ................
else if($category == '3') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '3'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id
           
INNER JOIN adsDescription AS d1
           ON i.id_description = d1.id 
           AND IF('".$type_aqar."' <> '0', d1.id_type_aqar = '".$type_aqar."', 1=1)

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf2
           ON i.id_description = qf2.id_description
           AND qf2.id_QFAT = '12'
           AND IF('".$apartements."' <> '0', qf2.quantity = '".$apartements."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf6
           ON i.id_description = qf6.id_description
           AND qf6.id_QFAT = '16'
           AND IF('".$stores."' <> '0', qf6.quantity = '".$stores."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... building for sale ................
else if($category == '4') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '4'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf6
           ON i.id_description = bf6.id_description
           AND (bf6.id_BFAT = '12' AND IF('".$bool_feature9."' <> 'false', bf6.state = 'true', 1=1))

INNER JOIN booleanFeatureAqar AS bf9 
           ON i.id_description = bf9.id_description 
           AND (bf9.id_BFAT = '18' AND IF('".$bool_feature2."' <> 'false', bf9.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf10 
           ON i.id_description = bf10.id_description 
           AND (bf10.id_BFAT = '19' AND IF('".$bool_feature3."' <> 'false', bf10.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... house for sale ................
else if($category == '5') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '5'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 
           
INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf3
           ON i.id_description = bf3.id_description
           AND (bf3.id_BFAT = '3' AND IF('".$bool_feature17."' <> 'false', bf3.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf11 
           ON i.id_description = bf11.id_description 
           AND (bf11.id_BFAT = '20' AND IF('".$bool_feature4."' <> 'false', bf11.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf12 
           ON i.id_description = bf12.id_description 
           AND (bf12.id_BFAT = '21' AND IF('".$bool_feature14."' <> 'false', bf12.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf13 
           ON i.id_description = bf13.id_description 
           AND (bf13.id_BFAT = '22' AND IF('".$bool_feature15."' <> 'false', bf13.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf14 
           ON i.id_description = bf14.id_description 
           AND (bf14.id_BFAT = '23' AND IF('".$bool_feature18."' <> 'false', bf14.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... rest for sale ................
else if($category == '6') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '6'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf9
           ON i.id_description = qf9.id_description
           AND qf9.id_QFAT = '14'
           AND IF('".$trees."' <> '0', qf9.quantity <= '".$trees."', 1=1)

INNER JOIN quantityFeatureAqar AS qf10
           ON i.id_description = qf10.id_description
           AND qf10.id_QFAT = '15'
           AND IF('".$wells."' <> '0', qf10.quantity = '".$wells."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... farm for sale ................
else if($category == '7') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '7'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id
           
INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... warehouse for sale ................
else if($category == '8') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '8'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf3
           ON i.id_description = qf3.id_description
           AND qf3.id_QFAT = '10'
           AND IF('".$floor."' <> '0', qf3.quantity = '".$floor."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf4
           ON i.id_description = bf4.id_description
           AND (bf4.id_BFAT = '7' AND IF('".$bool_feature12."' <> 'false', bf4.state = 'true', 1=1) )


INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf6
           ON i.id_description = bf6.id_description
           AND (bf6.id_BFAT = '12' AND IF('".$bool_feature9."' <> 'false', bf6.state = 'true', 1=1))
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... flat for sale ................
else if($category == '9') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '9'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf4
           ON i.id_description = bf4.id_description
           AND (bf4.id_BFAT = '7' AND IF('".$bool_feature12."' <> 'false', bf4.state = 'true', 1=1) )


INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf6
           ON i.id_description = bf6.id_description
           AND (bf6.id_BFAT = '12' AND IF('".$bool_feature9."' <> 'false', bf6.state = 'true', 1=1))
                  
INNER JOIN booleanFeatureAqar AS bf7 
           ON i.id_description = bf7.id_description 
           AND (bf7.id_BFAT = '16' AND IF('".$bool_feature11."' <> 'false', bf7.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf9 
           ON i.id_description = bf9.id_description 
           AND (bf9.id_BFAT = '18' AND IF('".$bool_feature2."' <> 'false', bf9.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf10 
           ON i.id_description = bf10.id_description 
           AND (bf10.id_BFAT = '19' AND IF('".$bool_feature3."' <> 'false', bf10.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf11 
           ON i.id_description = bf11.id_description 
           AND (bf11.id_BFAT = '20' AND IF('".$bool_feature4."' <> 'false', bf11.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf16 
           ON i.id_description = bf16.id_description 
           AND (bf16.id_BFAT = '25' AND IF('".$bool_feature13."' <> 'false', bf16.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf17 
           ON i.id_description = bf17.id_description 
           AND (bf17.id_BFAT = '26' AND IF('".$bool_feature1."' <> 'false', bf17.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf18 
           ON i.id_description = bf18.id_description 
           AND (bf18.id_BFAT = '27' AND IF('".$bool_feature16."' <> 'false', bf18.state = 'true', 1=1) )
           
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... villa for rent ................
else if($category == '10') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '10'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 
           
INNER JOIN adsDescription AS d1
           ON i.id_description = d1.id 
           AND IF('".$type_aqar."' <> '0', d1.id_type_aqar = '".$type_aqar."', 1=1)

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... land for rent ................
else if($category == '11') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '11'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 
           
INNER JOIN adsDescription AS d1
           ON i.id_description = d1.id 
           AND IF('".$type_aqar."' <> '0', d1.id_type_aqar = '".$type_aqar."', 1=1)

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf2
           ON i.id_description = qf2.id_description
           AND qf2.id_QFAT = '12'
           AND IF('".$apartements."' <> '0', qf2.quantity = '".$apartements."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf6
           ON i.id_description = qf6.id_description
           AND qf6.id_QFAT = '16'
           AND IF('".$stores."' <> '0', qf6.quantity = '".$stores."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... building for rent ................
else if($category == '12') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '12'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d3
           ON i.id_description = d3.id 
           AND IF('".$plan."' <> '0', d3.id_typeRes = '".$plan."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf3
           ON i.id_description = bf3.id_description
           AND (bf3.id_BFAT = '3' AND IF('".$bool_feature17."' <> 'false', bf3.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf11 
           ON i.id_description = bf11.id_description 
           AND (bf11.id_BFAT = '20' AND IF('".$bool_feature4."' <> 'false', bf11.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf12 
           ON i.id_description = bf12.id_description 
           AND (bf12.id_BFAT = '21' AND IF('".$bool_feature14."' <> 'false', bf12.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf13 
           ON i.id_description = bf13.id_description 
           AND (bf13.id_BFAT = '22' AND IF('".$bool_feature15."' <> 'false', bf13.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf14 
           ON i.id_description = bf14.id_description 
           AND (bf14.id_BFAT = '23' AND IF('".$bool_feature18."' <> 'false', bf14.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf15 
           ON i.id_description = bf15.id_description 
           AND (bf15.id_BFAT = '24' AND IF('".$bool_feature7."' <> 'false', bf15.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... rest for rent ................
else if($category == '13') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '13'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf9
           ON i.id_description = qf9.id_description
           AND qf9.id_QFAT = '14'
           AND IF('".$trees."' <> '0', qf9.quantity <= '".$trees."', 1=1)

INNER JOIN quantityFeatureAqar AS qf10
           ON i.id_description = qf10.id_description
           AND qf10.id_QFAT = '15'
           AND IF('".$wells."' <> '0', qf10.quantity = '".$wells."', 1=1) 
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... farm for rent ................
else if($category == '14') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '14'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d3
           ON i.id_description = d3.id
           AND IF('".$plan."' <> '0', d3.id_typeRes = '".$plan."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf3
           ON i.id_description = qf3.id_description
           AND qf3.id_QFAT = '10'
           AND IF('".$floor."' <> '0', qf3.quantity = '".$floor."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf3
           ON i.id_description = bf3.id_description
           AND (bf3.id_BFAT = '3' AND IF('".$bool_feature17."' <> 'false', bf3.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf4
           ON i.id_description = bf4.id_description
           AND (bf4.id_BFAT = '7' AND IF('".$bool_feature12."' <> 'false', bf4.state = 'true', 1=1) )


INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf6
           ON i.id_description = bf6.id_description
           AND (bf6.id_BFAT = '12' AND IF('".$bool_feature9."' <> 'false', bf6.state = 'true', 1=1))
                  
INNER JOIN booleanFeatureAqar AS bf18 
           ON i.id_description = bf18.id_description 
           AND (bf18.id_BFAT = '27' AND IF('".$bool_feature16."' <> 'false', bf18.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... flat for rent ................
else if($category == '15') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '15'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf3
           ON i.id_description = qf3.id_description
           AND qf3.id_QFAT = '10'
           AND IF('".$floor."' <> '0', qf3.quantity = '".$floor."', 1=1)

INNER JOIN quantityFeatureAqar AS qf4
           ON i.id_description = qf4.id_description
           AND qf4.id_QFAT = '7'
           AND IF('".$lounges."' <> '0', qf4.quantity >= '".$lounges."', 1=1) 

INNER JOIN quantityFeatureAqar AS qf5
           ON i.id_description = qf5.id_description
           AND qf5.id_QFAT = '9'
           AND IF('".$rooms."' <> '0', qf5.quantity = '".$rooms."', 1=1)

INNER JOIN quantityFeatureAqar AS qf8
           ON i.id_description = qf8.id_description
           AND qf8.id_QFAT = '8'
           AND IF('".$toilets."' <> '0', qf8.quantity >= '".$toilets."', 1=1) 

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf5
           ON i.id_description = bf5.id_description
           AND (bf5.id_BFAT = '5'  AND IF('".$bool_feature10."' <> 'false', bf5.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf18 
           ON i.id_description = bf18.id_description 
           AND (bf18.id_BFAT = '27' AND IF('".$bool_feature16."' <> 'false', bf18.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... floor for rent ................
else if($category == '16') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '16'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... office for rent ................
else if($category == '17') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '17'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d3
           ON i.id_description = d3.id 
           AND IF('".$plan."' <> '0', d3.id_typeRes = '".$plan."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN booleanFeatureAqar AS bf1
           ON i.id_description = bf1.id_description
           AND (bf1.id_BFAT = '1' AND IF('".$bool_feature5."' <> 'false', bf1.state = 'true', 1=1) )

INNER JOIN booleanFeatureAqar AS bf2
           ON i.id_description = bf2.id_description
           AND (bf2.id_BFAT = '2' AND IF('".$bool_feature6."' <> 'false' , bf2.state = 'true', 1=1) )
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... room for rent ................
else if($category == '18') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '18'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)
                  
INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... store for rent ................
else if($category == '19') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '19'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id 
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... warehouse for rent ................
else if($category == '20') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '20'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 

INNER JOIN adsDescription AS d3
           ON i.id_description = d3.id 
           AND IF('".$plan."' <> '0', d3.id_typeRes = '".$plan."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN booleanFeatureAqar AS bf3
           ON i.id_description = bf3.id_description
           AND (bf3.id_BFAT = '3' AND IF('".$bool_feature17."' <> 'false', bf3.state = 'true', 1=1) )

INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
} 
// ....................... camp for rent ................
else if($category == '21') {
    $queryResult=$mysqli->query("

SELECT DISTINCT  
     d.id, d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
     i.id, i.ads_image, i.id_description,
     a.id, a.title, a.timeAdded, a.timeUpdated, a.timeUpdated, a.views, a.id_special, a.id_category, a.id_user, a.id_description,
     u.id, u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                   
FROM adsImages AS i

INNER JOIN (SELECT i.`id_description`, MAX(i.`id`) 'max_id' FROM adsImages AS i GROUP BY i.`id_description`) x 
           ON x.`id_description` = i.`id_description` 
           AND x.max_id = i.`id` 

INNER JOIN ads AS a
           ON i.id_description = a.id_description 
           AND a.id_category = '21'

INNER JOIN adsDescription AS d
           ON i.id_description = d.id 
           
INNER JOIN adsDescription AS d2
           ON i.id_description = d2.id 
           AND IF('".$interface."' <> '0', d2.id_interface = '".$interface."', 1=1)

INNER JOIN adsDescription AS d4
           ON i.id_description = d4.id 
           AND IF('".$min_price."' <> '', (SELECT MIN(d4.price)) >= '".$min_price."', 1=1)
           AND IF('".$max_price."' <> '', (SELECT MAX(d4.price)) <= '".$max_price."', 1=1)

INNER JOIN adsDescription AS d5
           ON i.id_description = d5.id
           AND IF('".$min_space."' <> '', (SELECT MIN(d5.space)) >= '".$min_space."', 1=1)
           AND IF('".$max_space."' <> '', (SELECT MAX(d5.space)) <= '".$max_space."', 1=1)

INNER JOIN quantityFeatureAqar AS qf1
           ON i.id_description = qf1.id_description
           AND qf1.id_QFAT = '11'
           AND IF('".$age_of_real_estate."' <> '0', qf1.quantity <= '".$age_of_real_estate."', 1=1)

INNER JOIN quantityFeatureAqar AS qf7
           ON i.id_description = qf7.id_description
           AND qf7.id_QFAT = '13'
           AND IF('".$street_width."' <> '0', qf7.quantity >= '".$street_width."', 1=1)

INNER JOIN user AS u
           ON u.id = a.id_user  

");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);
    
}
// ....................... store for sale ................
//..............................................................................

} else {
    
}
?>

