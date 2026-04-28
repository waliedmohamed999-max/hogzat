<?php

include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");


$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
    
$phone = $_POST['phone'];

$queryResult=$mysqli->query("

SELECT DISTINCT
    MAX(t.`id_conv`) AS id_conv,
    MIN(t.`phone_user_recipient`) AS phone_user_recipient,
    MAX(t.phone_user_sender) AS phone_user_sender,
    MAX(t.id_comment) AS id_comment,
    MAX(t.seen_reciever) AS seen_reciever,
    MAX(t.seen_sender) AS seen_sender,
    MAX(t.state_conv_receiver) AS state_conv_receiver,
    MAX(t.state_conv_sender) AS state_conv_sender,
    MAX(comment.id_comment) AS id_comment,
    MAX(comment.comment) AS comment,
    MAX(comment.timeAdded) AS timeAdded,
    smartend_user.username,
    smartend_user.image,
    smartend_user.phone
FROM
    conversations AS t
INNER JOIN(
    SELECT
        t.`phone_user_recipient`,
        MAX(t.`id_conv`) 'max_id'
    FROM
        conversations AS t
    GROUP BY
        t.`phone_user_recipient`
) X
ON
    X.`phone_user_recipient` = t.`phone_user_recipient` AND X.max_id = t.`id_conv` AND(
        t.phone_user_sender = '".$phone."' OR t.phone_user_recipient = '".$phone."'
    )
INNER JOIN comment ON t.id_comment = comment.id_comment
INNER JOIN smartend_user ON t.`phone_user_recipient` = IF(
        smartend_user.phone <> '".$phone."',
        smartend_user.phone,
        ''
    ) OR t.`phone_user_sender` = IF(
        smartend_user.phone <> '".$phone."',
        smartend_user.phone,
        ''
    )
GROUP BY
    smartend_user.phone
ORDER BY
    MAX(t.`id_conv`)
DESC

           
");

// $queryResult=$mysqli->query("
//     SELECT * FROM `conversations` WHERE phone_user_sender = '".$phone."'
// ");
// SELECT * FROM `conversations` WHERE phone_user_sender = '';

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
}

echo json_encode($result);


} else {
    
}
?>