import React, {useEffect, useState} from "react";
import {DatePicker, Divider, Button, Drawer, Form, Select } from "antd";
import moment from "moment";
import axios from "axios";

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 18,
    },
};

function Calendar () {
    const [date, setDate] = useState(moment());
    const [rooms, setRooms] = useState([]);
    const [classes, setClasses] = useState([]);
    const [showDrawer, setShowDrawer] = useState(false);

    const maxLessons = 10;
    const lessons = Array(maxLessons).fill(0);

    function fetchData () {
        axios.get("http://localhost/grongworks/corona-room-planner/backend/?task=get_rooms")
            .then(result => {
                setRooms(result.data);

                axios.get("http://localhost/grongworks/corona-room-planner/backend/?task=get_classes")
                    .then(classResult => {
                        setClasses(classResult.data);
                    })
                    .catch(error => {
                        console.log("ERROR", error);
                    });
            })
            .catch(error => {
                console.log("ERROR", error);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [form] = Form.useForm();
    return <React.Fragment> 
        <DatePicker 
            defaultPickerValue={date}
            defaultValue={date}
            value={date}
            onChange={(date, dateString) => {
                setDate(date);                
            }} 
        />
        &nbsp;
        <Button type="primary" onClick={() => {
            setShowDrawer(!showDrawer);
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

        <Drawer
            title="Raumbuchung"
            placement="right"
            closable={false}
            onClose={() => {
                form.resetFields();
                setShowDrawer(!showDrawer)
            }}
            visible={showDrawer}
            width={600}
        >
            <Form
                { ...layout }
                form={form}
            >
                <div>
                    <div className="exchange-details">
                        <Form.Item noStyle name="roomId">
                            <Select
                                placeholder="Bitte wähle einen Raum aus"
                                style={{ width: "100%", marginBottom: "15px" }}
                            >
                                { rooms.map(room => <Select.Option value={room.id}>{room.name}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item noStyle name="bookingDate">
                            <DatePicker
                                placeholder={"Bitte wähle ein Datum aus"}
                                style={{ width: "100%", marginBottom: "15px" }}
                                defaultPickerValue={moment()}
                            />
                        </Form.Item>

                        <Form.Item noStyle name="classId">
                            <Select
                                placeholder="Bitte wähle eine Klasse aus"
                                style={{ width: "100%", marginBottom: "15px" }}
                            >
                                { classes.map(_class => <Select.Option value={_class.classId}>{_class.className}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item noStyle name="lessons">
                            <Select
                                mode={"multiple"}
                                placeholder="Bitte wählen Schulstunden aus"
                                style={{ width: "100%", marginBottom: "15px" }}
                            >
                                { Object.keys(lessons).map(lessonIndex => <Select.Option value={parseInt(lessonIndex)+1}>{parseInt(lessonIndex) + 1}. Stunde</Select.Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item noStyle style={{ marginTop: "30px" }}>
                            <button type="submit" style={{ width: "100%" }} onClick={() => {
                                form
                                    .validateFields()
                                    .then(values => {
                                        setDate(values.bookingDate);

                                        values.bookingDate = values.bookingDate.format("YYYY-MM-DD");
                                        values.lessons = values.lessons.join("|");

                                        const formData = new FormData();
                                        for (const key of Object.keys(values)) {
                                            formData.append(key, values[key]);
                                        }
                                        axios.post("http://localhost/grongworks/corona-room-planner/backend/?task=save_booking", formData)
                                            .then(res => {
                                                fetchData();
                                                setShowDrawer(!showDrawer);
                                            })
                                            .catch(error => console.log(error));
                                    })
                                    .catch(info => {
                                        console.log('Validate Failed:', info);
                                    });
                            }} >Raumbuchung speichern</button>
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Drawer>
    </React.Fragment>
};

export default Calendar;