import React from 'react';

import { Form } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;

import { Select } from 'antd';
const Option = Select.Option;

import { Input, InputNumber, Button, Radio } from 'antd';
const RadioGroup = Radio.Group;


let FilterBar = React.createClass({
    gitInitialState(){
        this.props.form.setFieldsValue(this.InFormatObject(this.props.filters));
        return {filters: this.props.filters};
    },
    InFormatObject(obj){
        // ToDo
        let ret = {
                name: '',
                gender: '',
                sign: '',
                id: '',

                country: '',
                province: '',
                city: '',
                start: '',
                end: '',
                ocount: '',
                pcount: '',

                type: '',
            };
        for (var key in ret){
            ret[key] = obj[key] || '';
        }
        return ret;
    },
    OutFormatObject(obj){
        // ToDo
        let ret = {};
        for (var key in obj){
            switch(key){
            case '':
                break;
            default:
                ret[key] = obj[key];
                break;
            }
        }
        return ret;
    },

    handleSubmit(e) {
        e.preventDefault();
        var keys = this.props.form.getFieldsValue();
        console.log(keys);
        var data = this.OutFormatObject(keys);
        console.log(data);

        if (this.props.onSubmit){
            this.props.onSubmit(data);
        }
    },

    MakeCountryDOM(){
        let source = this.props.countrys || [
            {country: '', ui: "全部"},
            {country: "CN", ui: "中国"},
            {country: "OTHER", ui: "其他"}];
        let options = source.map(function(one, no, head){
            let key = 'country' + no.toString();
            return (<Option value={one.country} key={key}>{one.ui}</Option>);
        });
        return options;
    },
    render(){
        
        /// base ///
        const { getFieldProps } = this.props.form;

        // name / gender / id / sign
        // country / province / city
        // start / end
        // ocount / pcount
        // show points

        /// name ///
        let nameDOM = (<Input type="text" placeholder="输入昵称关键字" {...getFieldProps('name')} />);


        let genderDOM = (<Select showSearch
                notFoundContent="无法找到"
                placeholder="性别"
                {...getFieldProps('gender')}
                optionFilterProp="children"
                >
                <Option value='' key='0'>任意</Option>
                <Option value='male' key='1'>男</Option>
                <Option value='female' key='2'>女</Option>
                </Select>);

        let signDOM = (<Input type="text" placeholder="个性签名" {...getFieldProps('sign')} />);


        /// country ///
        let countrychild = this.MakeCountryDOM();
        let countryDOM = (<Select showSearch
                notFoundContent="无法找到"
                placeholder="请选择区域名称..."
                {...getFieldProps('country')}
                optionFilterProp="children"
                >
                    {countrychild}
                </Select>);


        let arrayDOM = [nameDOM, genderDOM, signDOM, countryDOM];

        let FormDOM = arrayDOM.map(function(one, no, head){
            return (<FormItem> one </FormItem>);
        });

        return (<Form inline>
        <Button type="primary" onClick={this.handleSubmit}>提交</Button>
        {FormDOM}
        </Form>);
    }
});



FilterBar = createForm()(FilterBar);

export default FilterBar;

