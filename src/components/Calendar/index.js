import React, {useEffect, useState} from "react";
import { DatePicker, Divider, Button } from "antd";
import moment from "moment";
import axios from "axios";

function Calendar () {
    const [date, setDate] = useState(moment());
    const [rooms, setRooms] = useState([]);

    const maxLessons = 10;
    const lessons = Array(maxLessons).fill(0);

    useEffect(() => {
        axios.get("http://localhost/corona-room-planner/backend/?task=get_rooms")
            .then(result => {
                setRooms(result.data);
            })
            .catch(error => {
                console.log("ERROR", error);
            })
    }, []);

    return <React.Fragment> 
        <DatePicker 
            defaultPickerValue={date}
            defaultValue={date}
            onChange={(date, dateString) => {
                setDate(date);                
            }} 
        />
        &nbsp;
        <Button type="primary" onClick={() => {
            window.alert("Wir fügen eine Raumbuchung hinzu :)");
        }}>Raum buchen</Button>
        <Divider />
        <table style={{ width: "100%" }} border={1}>
            <thead>
                <tr>
                    <th>Raumname</th>
                    {
                        lessons.map((item, index) => {
                            return <th style={{ textAlign: "center" }}>{ index + 1 }</th>
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    rooms.map(room => {
                        return <tr>
                            <td>{room.name}</td>
                            {
                                lessons.map((lesson, index) => {
                                    const lessonIndex = index + 1;
                                    const dateString = date.format("YYYY-MM-DD");
                                    if (room.bookings[dateString]) {
                                        const lessonSearch = room.bookings[dateString].find(classItem => classItem.lessonNumber == lessonIndex)
                                        if (!lessonSearch) {
                                            return <td>&nbsp;</td>;
                                        } else {
                                            return <td style={{ backgroundColor: "#c00", textAlign: "center", fontWeight: "bold", color: "white" }}>{lessonSearch.className}</td>;
                                        }
                                    } else {
                                        return <td>&nbsp;</td>;
                                    }
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </table>
    </React.Fragment>
};

export default Calendar;