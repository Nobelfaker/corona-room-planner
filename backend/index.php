<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once dirname(__FILE__) . "/class/class.Database.php";

$db = new Database();
$con = $db->getConnection();

if (key_exists("task", $_GET)) {
    switch ($_GET["task"]) {
        case "get_rooms":
            $_result = $con->query("
                SELECT
                    r.*,
                    c.categoryName
                FROM
                    room r
                    INNER JOIN 
                        category c
                        ON r.categoryId = c.id
                ORDER BY 
                    r.name ASC;
            ");

            $result = Array();
            while ($room = $_result->fetch_assoc()) {

                $_booking = $con->query("
                    select 
                        c.id as classId,
                        c.className,
                        b.`date`,
                        b.lesson as lessonNumber
                    from 
                        bookings b
                        inner join 
                            class c
                            on c.id = b.classId 
                    where
                        b.roomId = {$room["id"]};
                ");

                if (!key_exists("bookings", $room)) {
                    $room["bookings"] = array();
                }

                while ($booking = $_booking->fetch_assoc()) {
                    if (!key_exists($booking["date"], $room["bookings"])) {
                        $room["bookings"][$booking["date"]] = Array();
                    }

                    array_push($room["bookings"][$booking["date"]], Array(
                        "classId" => $booking["classId"],
                        "className" => $booking["className"],
                        "lessonNumber" => $booking["lessonNumber"],
                    ));
                }

                array_push($result, $room);
            }

            $json = json_encode($result, JSON_PRETTY_PRINT);
            print_r($json);
            break;

        default:
            print_r("unknown task...");
            break;
    }
}
