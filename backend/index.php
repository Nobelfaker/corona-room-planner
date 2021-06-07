<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
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
                    SELECT 
                        c.id AS classId,
                        c.className,
                        b.`date`,
                        b.lesson AS lessonNumber
                    FROM 
                        bookings b
                        INNER JOIN 
                            class c
                            ON c.id = b.classId 
                    WHERE
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

        case "get_classes":
            $_result = $con->query("
                SELECT
                    c.id AS classId,
                    c.className,
                    c.studentCount
                FROM
                    class c;
            ") or die(mysqli_error($con));

            $result = Array();
            while ($class = $_result->fetch_assoc()) {
                array_push($result, $class);
            }

            $json = json_encode($result, JSON_PRETTY_PRINT);
            print_r($json);
            break;

        case "save_booking":
            ["bookingDate" => $bookingDate, "classId" => $classId, "lessons" => $lessons] = $_POST;
            $firstRoomId = (key_exists("firstRoomId", $_POST)) ? $_POST["firstRoomId"] : null;
            $secondRoomId = (key_exists("secondRoomId", $_POST)) ? $_POST["secondRoomId"] : null;
            $lessons = explode("|", $_POST["lessons"]);
            $lessonString = implode(",", $lessons);
            $roomString = ($secondRoomId != null) ? "{$firstRoomId},{$secondRoomId}" : "{$firstRoomId}";

            $bookings = $con->query("
                SELECT
                    c.className,
                    r.name,
                    b.lesson
                FROM
                    bookings b
                    INNER JOIN
                        class c
                        ON c.id = b.classId
                    INNER JOIN
                        room r
                        ON r.id = b.roomId
                WHERE
                    b.roomId IN({$roomString})
                    AND `date` = '{$bookingDate}'
                    AND lesson IN({$lessonString});
            ") or die(mysqli_error($con));

            $occupied = Array();
            while ($row = $bookings->fetch_assoc()) {
                $occupied[] = $row;
            }

            if (count($occupied) > 0) {
                http_response_code(400);
                $response = json_encode(Array(
                    "status" => "occupied",
                    "payload" => $occupied
                ), JSON_PRETTY_PRINT);
                print_r($response);
            } else {
                $stmt = $con->prepare("INSERT INTO bookings (classId, roomId, date, lesson) VALUES (?,?,?,?)");
                foreach ($lessons as $key => $lesson) {
                    $stmt->bind_param("iisi", $classId, $firstRoomId, $bookingDate, $lesson);
                    $stmt->execute() or die("ERROR");
                }

                if ($secondRoomId != null) {
                    foreach ($lessons as $key => $lesson) {
                        $stmt->bind_param("iisi", $classId, $secondRoomId, $bookingDate, $lesson);
                        $stmt->execute() or die("ERROR");
                    }
                }

                http_response_code(200);
            }
            break;

        default:
            print_r("unknown task...");
            break;
    }
} else {
    echo "unknown-task";
}
