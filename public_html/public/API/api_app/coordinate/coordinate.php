<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$lat = $_POST['lat'];
$lng = $_POST['lng'];
$rad = $_POST['rad'];

$R = 6371;  // earth's mean radius, km

// first-cut bounding box (in degrees)
$maxLat = $lat + rad2deg($rad/$R);
$minLat = $lat - rad2deg($rad/$R);
$maxLng = $lng + rad2deg(asin($rad/$R) / cos(deg2rad($lat)));
$minLng = $lng - rad2deg(asin($rad/$R) / cos(deg2rad($lat)));


// Get ads Description id  and calculate the distance between ad location and the center of circle with given radius ($rad)

$sql = "Select id, lat, lng, acos(sin(".deg2rad($lat).")*sin(radians(lat)) + cos(".deg2rad($lat).")*cos(radians(lat))*cos(radians(lng)-".deg2rad($lng).")) * ".$R." As distance
            From (
                Select id, lat, lng
                From smartend_adsDescription
                Where lat Between ".$minLat." And ".$maxLat."
                  And lng Between ".$minLng." And ".$maxLng."
            ) As FirstCut
                Where acos(sin(".deg2rad($lat).")*sin(radians(lat)) + cos(".deg2rad($lat).")*cos(radians(lat))*cos(radians(lng)-".deg2rad($lng).")) * ".$R." < ".$rad." Order by id";  
        

$queryResult=$mysqli->query($sql);


$result = [];

while($row = $queryResult->fetch_assoc()) {
    
    // get ads full details by id_description 
    $sql = " SELECT   
                    d.id as 'id_description', d.lat, d.lng, d.ads_city, d.ads_neighborhood, d.ads_road, d.video, d.space, d.price, d.description, d.id_typeRes, d.id_type_aqar, d.id_interface, d.id_adder_relation, d.id_marketer_relation,
                    i.id as 'image_id', i.ads_image,
                    a.id as 'ads_id', a.title, a.timeAdded, a.timeUpdated, a.time_update_ad, a.views, a.id_special, a.id_category,
                    u.id as 'user_id', u.username, u.phone, u.email, u.timeRegistered, u.lastActive, u.verified, u.about, u.image
                    
            from smartend_adsDescription d, smartend_adsImages i , smartend_ads a , smartend_user u
     
            where d.id = ".$row['id']."
                and i.id_description = d.id
                and a.id_description = d.id
                and a.id_user = u.id";
    
    $adsDetails = $mysqli->query($sql);
    $line =$adsDetails->fetch_assoc();
    $line['distance'] = $row['distance'];
    array_push($result, $line);
}


function sortBytimeUpdated($array){
    $result = $array;
    for ($i=0; $i < count($result); $i++) { 
        # code...
        $temp = $result[$i];
        $j = $i;
        
        while ($j > 0 
        && 
        DateTime::createFromFormat('Y-m-d H:i:s', $result[$j - 1]['timeUpdated']) < 
        DateTime::createFromFormat('Y-m-d H:i:s', $temp['timeUpdated'])) {
            
            # code...
            $result[$j] = $result[$j-1];
            $j--; 
        }
        $result[$j] = $temp;
    }
    return $result;
}
$result = sortBytimeUpdated($result);

echo json_encode($result);

        
        
        
        










