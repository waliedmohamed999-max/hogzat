<?php
 

$db_server = getenv('API_DB_HOST') ?: getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('API_DB_DATABASE') ?: getenv('DB_DATABASE') ?: '';
$db_username = getenv('API_DB_USERNAME') ?: getenv('DB_USERNAME') ?: '';
$db_password = getenv('API_DB_PASSWORD') ?: getenv('DB_PASSWORD') ?: '';

$cookie_name_username = "username";
$cookie_name_password = "password";

$url_hraj = "https://blagat.sa/";
$number_tags_update = 1;

############## لا تقم بتعديل شئ هنا ##########################
$mysqli = new mysqli("$db_server","$db_username","$db_password","$db_name");
############## لا تقم بتعديل شئ هنا ##########################

$color1_group = "C03";
$color2_group = "000";
$color3_group = "999";
$color4_group = "999";


 
?>
                            
                            
          
