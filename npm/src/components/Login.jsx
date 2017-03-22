import React from 'react';
import { Form, Modal, Card } from 'antd';
import { Select, Input, InputNumber, Button, Radio } from 'antd';
import { Icon, Checkbox } from 'antd';
import { Row, Col } from 'antd';


import xAJAX from '../services/xAjax'

import openNotificationWithIcon from './Details/Notification';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;


let LoginForm = React.createClass({
    getInitialState(){
        return {
            title: "需要登录系统",
        };
    },
    componentDidMount: function() {
    },

    handleSubmit() {
        var keys = this.props.form.getFieldsValue();
        var data = this.KeyToData(keys);

        if (this.props.onSubmit){
            this.props.onSubmit(data);
        }
    },
    handleCancel(){
        // nothing
        // openNotificationWithIcon('warning', '请登录', '登录后才可进行后续操作');
        this.setState({title: "请登录"});
    },
    KeyToData(keys){
        let data = {};
        for (let key in keys){
            data[key] = keys[key];
        }
        return data;
    },
    DomForm(bButton){
        const { getFieldProps } = this.props.form;
        let click = (<FormItem><Button htmlType="submit">Login</Button></FormItem>);
        if (!bButton){
            click = (<div></div>);
        }
        return (<Form horizontal onSubmit={this.handleSubmit}>
        <FormItem>
            <Input 
            prefix={<Icon type="user" style={{ fontSize: 13 }} />}
            placeholder="Username"
              {...getFieldProps('sign', {})}
              />
        </FormItem>
        <FormItem>
            <Input 
            prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
            type="password"
            placeholder="Password"
          {...getFieldProps('password', {})}
           />
        </FormItem>
        {click}
      </Form>);
    },
    DomCard(body){
        let title = this.state.title;
        if (this.props.title && this.props.title.length > 0){
            title = this.props.title;
        }
        return (<Row>
            <Col offset={8} span={8}>
            <Card title={title}>
                {body}
            </Card>
            </Col>
        </Row>);
    },
    DomModal(body){
        let title = this.state.title;
        if (this.props.title && this.props.title.length > 0){
            title = this.props.title;
        }
        return (<Modal title={title}
            visible={this.props.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        >{body}</Modal>);
    },
    render: function(){
        let visible = true;
        if (!this.props.visible){
            visible = false;
        }
        
        let body = this.DomForm();

    return this.DomModal(body);

    }
});

LoginForm = createForm()(LoginForm);

// url_api
// initkey
// onSubmit
// name
export default LoginForm;
