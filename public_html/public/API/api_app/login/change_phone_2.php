<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$oldPhone = $_POST['oldPhone'];
	$newPhone = $_POST['newPhone'];
    $verCode = $_POST['verCode'];


    $queryResult=$mysqli->query("SELECT verCode FROM smartend_user Where phone='".$oldPhone."'");


    $fetchData=$queryResult->fetch_assoc();
    if($verCode == $fetchData['verCode']){
        $sql = "UPDATE smartend_user SET phone='".$newPhone."' , verified = '1' WHERE phone='".$oldPhone."' ";
        if(mysqli_query($mysqli, $sql)) {
            echo json_encode("successful");   
        }
        else {
            echo json_encode("error");
        }
    }