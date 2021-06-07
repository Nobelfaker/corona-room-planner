import React, {useEffect, useState} from "react";
import {DatePicker, Divider, Button, Drawer, Form, Select, Modal } from "antd";
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
    const [showSecondRoom, setShowSecondRoom] = useState(false);

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

    useEffect(() => form.resetFields(), [showDrawer]);

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
                    <div>
                        <Form.Item noStyle name="firstRoomId">
                            <Select
                                placeholder="Bitte wähle einen Raum aus"
                                style={{ width: "100%", marginBottom: "15px" }}
                            >
                                { rooms.map(room => <Select.Option value={room.id}><strong>{room.name}</strong> - <i>{room.seats} Sitzplätze</i></Select.Option>)}
                            </Select>
                        </Form.Item>

                        {
                            showSecondRoom === true &&
                                <Form.Item noStyle name="secondRoomId">
                                    <Select
                                        placeholder="Bitte wähle einen zweiten Raum aus"
                                        style={{ width: "100%", marginBottom: "15px" }}
                                    >
                                        { rooms.map(room => <Select.Option value={room.id}><strong>{room.name}</strong> - <i>{room.seats} Sitzplätze</i></Select.Option>)}
                                    </Select>
                                </Form.Item>
                        }

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
                                { classes.map(_class => <Select.Option value={_class.classId}><strong>{_class.className}</strong> - <i>{_class.studentCount} Schüler</i></Select.Option>)}
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

                                        const { firstRoomId, secondRoomId, classId } = values;
                                        const _firstRoom = rooms.find(room => room.id === firstRoomId);

                                        const _class = classes.find(c => c.classId === classId);
                                        if (_firstRoom.seats < (_class.studentCount * 2) && !secondRoomId) {
                                            setShowSecondRoom(true);
                                            return Modal.error({
                                                title: 'Der gewählte Raum ist zu klein',
                                                width: "500px",
                                                content: <React.Fragment>
                                                    Der ausgewählte Raum {_firstRoom.name} (<strong>{_firstRoom.seats} Sitzplätze</strong>)
                                                    ist zu klein für die ausgewählte Klasse {_class.className} (<strong>{_class.studentCount} Schüler</strong>)!
                                                </React.Fragment>,
                                            });
                                        }

                                        if (!!secondRoomId) {
                                            const _secondRoom = rooms.find(room => room.id === secondRoomId);
                                            const seatsFirstRoom = parseInt(_firstRoom.seats);
                                            const seatsSecondRoom = parseInt(_secondRoom.seats);
                                            const seatsTotal = seatsFirstRoom + seatsSecondRoom;

                                            if (seatsTotal < (_class.studentCount * 2)) {
                                                setShowSecondRoom(false);
                                                setShowDrawer(false);
                                                return Modal.error({
                                                    title: 'Die gewählten Räume sind zu klein',
                                                    width: "500px",
                                                    content: <React.Fragment>
                                                        Bitte Buchung erneut versuchen!
                                                    </React.Fragment>,
                                                });
                                            }
                                        }

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
                                            .catch(error => {
                                                if (error.response.status === 400) {
                                                    Modal.error({
                                                        title: 'Upps... Da ist was schief gelaufen!',
                                                        width: "500px",
                                                        content: <React.Fragment>
                                                            Der Raum wurde bereits in den folgenden Stunden gebucht:
                                                            <br/>
                                                            <table style={{ width: "100%", borderCollapse: "collapse" }} border={1}>
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ paddingLeft: "10px" }}>Stunde</th>
                                                                        <th style={{ paddingLeft: "10px" }}>Klasse</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {
                                                                    error.response.data.payload.map(i => {
                                                                        return <tr>
                                                                            <td style={{ paddingLeft: "10px" }}>{i.lesson}</td>
                                                                            <td style={{ paddingLeft: "10px" }}>{i.className}</td>
                                                                        </tr>
                                                                    })
                                                                }
                                                                </tbody>
                                                            </table>
                                                        </React.Fragment>,
                                                    });

                                                    setShowDrawer(!showDrawer);
                                                }
                                            });
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