<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$id_ads = $_POST['id_ads'];
	$phone_user = $_POST['phone_user'];
	
	
	$queryResult=$mysqli->query("SELECT * FROM `favourite` WHERE `id_ads` = '".$id_ads."' AND `phone_faved_user` = '".$phone_user."';");
	$result=array();

    while($fetchData=$queryResult->fetch_assoc()){
    	$result[]=$fetchData;
    }
   
    if(count($result) <= 0) {
        
        
        $sql3 = "
            INSERT INTO `favourite` (`id_fav`, `isFav`, `id_ads`, `phone_faved_user`) VALUES (NULL, '1', '".$id_ads."', '".$phone_user."');
        ";
            
        if (mysqli_query($mysqli, $sql3)) {

            // echo "Done";
        } else {
            // echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
        }
                
        
    } else {
        
        
        foreach($result as $isFav) {
            

            if($isFav['isFav'] == 1) {
                $sql1 = "
                  UPDATE `favourite` SET `isFav`=0 WHERE `id_ads`='".$id_ads."' AND `phone_faved_user`='".$phone_user."';
                ";
            
                if (mysqli_query($mysqli, $sql1)) {

                     // echo "Done";
                } else {
                    //   echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
                }
    
    

        } else {
            
                $sql2 = "
                  UPDATE `favourite` SET `isFav`=1 WHERE `id_ads`='".$id_ads."' AND `phone_faved_user`='".$phone_user."';
                ";
            
                if (mysqli_query($mysqli, $sql2)) {

                     // echo "Done";
                } else {
                    //   echo "Error: " . $sql . "<br>" . mysqli_error($mysqli);
                }


        }
        
    
       }
        
        
        
    }
	
} else {
    
}	

?>