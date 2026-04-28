<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
$image = $_FILES['image']['name'];
$phone = $_POST['phone'];
$id_mem = $_POST['id_mem'];
$userName = $_POST['userName'];
$company_name = $_POST['company_name'];
$office_name = $_POST['office_name'];
$currentImageName = $_POST['currentImage'];
$about = $_POST['about'];
$email = $_POST['email'];
$deletedImage = $_POST['deletedImage'];




if($deletedImage){
    
    $mysqli->query("

    UPDATE `smartend_user` SET `username`='".$userName."',`company_name`='".$company_name."',`office_name`='".$office_name."',`email`='".$email."',`about`='".$about."',`image`='',`id_mem`='".$id_mem."' WHERE `phone`='".$phone."'
    ");

} else {
    if($image){
   
        $imagePath = '../../assets/images/avatar/'.$image;
        $tmp_name = $_FILES['image']['tmp_name'];
        move_uploaded_file($tmp_name,$imagePath);    
    } else {
       
        $image = $currentImageName;
    }
    $mysqli->query("

    UPDATE `smartend_user` SET `username`='".$userName."',`company_name`='".$company_name."',`office_name`='".$office_name."',`email`='".$email."',`about`='".$about."',`image`='".$image."',`id_mem`='".$id_mem."' WHERE `phone`='".$phone."'
    ");

}

} else {
    
}

?>