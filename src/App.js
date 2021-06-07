import React, { useState } from "react";
import {HashRouter as Router, NavLink, Route, Switch} from "react-router-dom";
import Calendar from "./components/Calendar";
import {Divider, Layout, Menu} from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import './App.css';
import virusImg from "./images/virus.png";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

function App() {
    const [collapsed, setCollapse] = useState(false);

    return <React.Fragment>
        <Layout style={{ minHeight: '100vh' }}>
            <Router>
                <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapse(!collapsed)} width={250}>
                    <div className="logo">
                        <img src={virusImg} alt="VIRUS" />
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1" icon={<PieChartOutlined />}>
                            <NavLink to={"/"}>Home</NavLink>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background" style={{ padding: 0 }} />
                    <Content style={{ margin: '0 16px' }}>
                        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                             <Switch>
                                 <Route path={"/"} exact component={Calendar}/>
                             </Switch>
                        </div>
                    </Content>
                </Layout>
            </Router>
        </Layout>
    </React.Fragment>;
}

export default App;
