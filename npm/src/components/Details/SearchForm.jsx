import styles from './DetailsCSS.less'
import React from 'react';
import { Form } from 'antd';
import { Select, Input, InputNumber, Button, Radio } from 'antd';
import { Modal, DatePicker, TimePicker } from 'antd';
import { Row, Col } from 'antd';

import xAJAX from '../../services/xAjax'

const RadioGroup = Radio.Group;
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

const global_country_init = [
                {country: '', ui: '全部'},
                {country: "CN", ui: "中国"},
                {country: "OTHER", ui: "其他"}
             ];

let SearchForm = React.createClass({
    getInitialState(){
        return {
            visible: false,
            countrylist: global_country_init,
        };
    },
    componentDidMount: function() {
        this.loaddata();
    },
    onLoad(success, data, err){
        if (success && !err){
            data.push({country: '', ui: '全部'});
            data.sort((a,b)=>{
                if (a.country > b.country){
                    return 1;
                }
                if (a.country < b.country){
                    return -1;
                }
                return 0;
            });
            this.setState({countrylist: data});
        }
    },
    loaddata(){
        var key = {"start": null, "end": null};
        xAJAX(this.props.url_api, key, this.onLoad);
    },
    showModal() {
        this.props.form.setFieldsValue(
            this.lazy_get_keys()
            );
        this.setState({ visible: true });
    },

    hideModal() {
        this.setState({ visible: false });
    },
    lazy_get_keys(){
        var v = {};
        if (this.props.initkey){
            v = this.DataToKey(this.props.initkey);
        }
        return v;
    },
    DataToKey(datas){
        var keys = {};
        for (var key in datas){
            if (key == 'start' && datas[key].length > 0){
                var pair = datas[key].split(' ');
                keys['start_date'] = pair[0];
                if (pair.length > 1){
                    keys['start_time'] = pair[1];
                }
                continue;
            }
            if (key == 'end'){
                var pair = datas[key].split(' ');
                keys['end_date'] = pair[0];
                if (pair.length > 1){
                    keys['end_time'] = pair[1];
                }
                continue;
            }
            keys[key] = datas[key];
        }
        return keys;
    },
    DateToString(data){
        try{
            return data.getFullYear()
             + "-" + (data.getMonth() + 1)
             + "-" + data.getDate();
        }
        catch(e){
            return data;
        }
    },
    TimeToString(t){
        try{
        return t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
        }
        catch(e){
            return t;
        }
    },
    KeyToData(keys){
        var tmp = keys;
        var data = {};
        var start_date='';
        var start_time='';
        var end_date='';
        var end_time='';
        for (var key in tmp){
            if (!tmp[key]){
                continue;
            }
            if ('start_date' == key){
                start_date = this.DateToString(tmp[key]);
                continue;
            }
            if ('start_time' == key){
                start_time = this.TimeToString(tmp[key]);
                continue;
            }
            if ('end_date' == key){
                end_date = this.DateToString(tmp[key]);
                continue;
            }
            if ('end_time' == key){
                end_time = this.TimeToString(tmp[key]);
                continue;
            }
            data[key] = tmp[key];
        }

        if (start_date.length > 0){
            if (start_time.length == 0){
                start_time = '00:00:00';
            } 
            data['start'] = start_date + ' ' + start_time;
        }
        if (end_date.length > 0){
            if (end_time.length == 0){
                end_time = '23:59:59';
            }
            data['end'] = end_date + ' ' + end_time;
        }
        return data;
    },
    handleSubmit() {
        var keys = this.props.form.getFieldsValue();
        var data = this.KeyToData(keys);

        if (this.props.onSubmit){
            this.props.onSubmit(data);
        }
        // Hide pop up windows
        this.hideModal();
    },
    makeCountrySelect(l, d){
        if (!l || l.length == 0){
            l = d;
        }
        return l.map(function(one, no, head){
            return <Option value={one.country} key={no}>{one.ui}</Option>
        });
    },

    ReturnPop(onSubmit, countryselect, getFieldProps){
        
        var name = this.props.name;
        const formItemLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 12 },
        };
        return (<div>
        <Button onClick={this.showModal}>{name}</Button>
        <Modal 
            title={name}
            visible={this.state.visible}
            onOk={this.handleSubmit}
            onCancel={this.hideModal}>
        <Form horizontal>
            <FormItem {...formItemLayout}
                    label="名字: " >
                <Input type="text" placeholder="输入昵称关键字" {...getFieldProps('name')} />
            </FormItem>
            <FormItem {...formItemLayout}
                    label="个性签名: " >
                <Input type="text" placeholder="输入个人介绍关键字" {...getFieldProps('sign')} />
            </FormItem>
            <FormItem {...formItemLayout}
                    label="性别: " >
                <RadioGroup {...getFieldProps('gender')}>
                    <Radio value="male">男</Radio>
                    <Radio value="female">女</Radio>
                    <Radio value="">任意</Radio>
                </RadioGroup>
            </FormItem>
            <FormItem {...formItemLayout}
                    label="区域: ">
                {countryselect}
            </FormItem>
            <FormItem {...formItemLayout}
                    label="省市: " >
                <Col span="12">
                <Input type="text" placeholder="省 名称" {...getFieldProps('province')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <Input type="text" placeholder="市 名称" {...getFieldProps('city')} />
                </Col>
            </FormItem>
            <FormItem {...formItemLayout}
                    label="开始时间: " >
                <Col span="12">
                <DatePicker {...getFieldProps('start_date')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <TimePicker {...getFieldProps('start_time')} />
                </Col>
            </FormItem>
            <FormItem {...formItemLayout}
                    label="截止时间: " >
                <Col span="12">
                <DatePicker {...getFieldProps('end_date')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <TimePicker {...getFieldProps('end_time')} />
                </Col>
            </FormItem>
            <FormItem {...formItemLayout}
                    label="经纬: " >
                <Col span="12">
                <InputNumber className={styles.FullWidth} min={-180} max={180} step={0.001} placeholder="经(longitude)" {...getFieldProps('longitude')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <InputNumber className={styles.FullWidth} min={-90} max={90} step={0.001} placeholder="纬(latitude)" {...getFieldProps('latitude')} />
                </Col>
            </FormItem>
        </Form>
        </Modal>
        </div>);
    },
    ReturnInLine(onSubmit, countryselect, getFieldProps){
        var name = this.props.name || '确认';
        var formItemLayout = {};

        let nameDOM = (<FormItem >
                <Input type="text" placeholder="输入昵称关键字" {...getFieldProps('name')} />
            </FormItem>);
        let signDOM = (<FormItem >
                <Input type="text" placeholder="输入个人介绍关键字" {...getFieldProps('sign')} />
            </FormItem>);
        let genderDOM = (<FormItem >
                <Select {...getFieldProps('gender')}
                    showSearch
                    style={{ width: '100%' }}
                    notFoundContent="无法找到"
                    placeholder="请选择性别..."
                    optionFilterProp="children"
                    defaultValue=''
                    >
                    <Option value='' key='0'>任意</Option>
                    <Option value='male' key='1'>男</Option>
                    <Option value='female' key='2'>女</Option>
                </Select>
            </FormItem>);
        let countryDOM = (<FormItem>
                {countryselect}
            </FormItem>);
        let provinceDOM = (<FormItem >
                <Col span="12">
                <Input type="text" placeholder="省 名称" {...getFieldProps('province')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <Input type="text" placeholder="市 名称" {...getFieldProps('city')} />
                </Col>
            </FormItem>);
        let postionDOM = (<FormItem >
                <Col span="12">
                <InputNumber className={styles.FullWidth} min={-180} max={180} step={0.001} placeholder="经(longitude)" {...getFieldProps('longitude')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <InputNumber className={styles.FullWidth} min={-90} max={90} step={0.001} placeholder="纬(latitude)" {...getFieldProps('latitude')} />
                </Col>
            </FormItem>);
        let startDOM = (<FormItem >
                <Col span="12">
                <DatePicker {...getFieldProps('start_date')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <TimePicker {...getFieldProps('start_time')} />
                </Col>
            </FormItem>);
        let endDOM = (<FormItem >
                <Col span="12">
                <DatePicker {...getFieldProps('end_date')} />
                </Col>
                <Col span="1">
                    <p className="ant-form-split">-</p>
                </Col>
                <Col span="11">
                <TimePicker {...getFieldProps('end_time')} />
                </Col>
            </FormItem>);

        let DOMList = [nameDOM, signDOM,
            provinceDOM, postionDOM,
            startDOM, endDOM,
            countryDOM, genderDOM,];


        let xs = [6,6,7,5];
        let sm = [6,6,7,5];
        let md = [6,6,7,5];
        let lg = [6,6,7,5];

        let DOMs = [0,1,2,3].map(function(one, no, head){
            return (<Col xs={{span:xs[one]}}
                        sm={{span:sm[one]}}
                        md={{span:md[one]}}
                        lg={{span:lg[one]}} key={no.toString()}>
                        <Row > {DOMList[2 * one]} </Row>
                        <Row > {DOMList[2 * one + 1]}</Row>
                    </Col>);
        });

        return (
        <Form inline>
        
        <Col span='2'>
        <Button type="primary" onClick={this.handleSubmit}>{name}</Button>
        </Col>
        <Col span='22'>
        {DOMs}
        </Col>
        </Form>);
    },

    render: function(){
        var onSubmit = this.props.onSubmit;
        const { getFieldProps } = this.props.form;

        var countrychild = this.makeCountrySelect(this.state.countrylist, global_country_init);
        var countryselect = (<Select showSearch allowClear
                style={{ width: '100%' }}
                notFoundContent="无法找到"
                placeholder="请选择区域名称..."
                {...getFieldProps('country')}
                optionFilterProp="children"
                defaultValue=''
                >
                    {countrychild}
                </Select>);
        if (this.props.inline){
            return this.ReturnInLine(onSubmit, countryselect, getFieldProps);
        }


        return this.ReturnPop(onSubmit, countryselect, getFieldProps);
    }
});

SearchForm = createForm()(SearchForm);

// url_api
// initkey
// onSubmit
// name
export default SearchForm;
