import React from 'react';
import { Button } from 'antd';
import { Table, Card } from 'antd';
import { Row, Col } from 'antd';
import { Popover } from 'antd';
import { Link } from 'react-router';



import xAJAX from '../../services/xAjax';
import UrlList from '../../services/UrlList';

import openNotificationWithIcon from './Notification';

import SearchBar from './SearchBar';
import SearchForm from './SearchForm';


/////////////////////////////////////
function create_order(name){
    return function(a,b){
        if (a[name] > b[name]){ return 1; }
        else if (a[name] < b[name]){ return -1; }
        else {return 0;}
    }
}


function create_order_number(name){
    return function(a,b){
        var n = a[name].length;
        var m = b[name].length;
        return n-m;
    }
}

const NamePage = React.createClass({
    getInitialState() {
        var key = {};
        var name = this.props.wid;
        if (name){
            key["name"] = name;
        }
        return {
            sorted_check: null,
            filter_check: null,
            data: null,
            pollInterval: 0,
            loading: false,
            search_key: key,
            autohandle: NaN,
            searchwindow: false,
        }
    },
    handleChange(pagination, filter, sorter){
        this.setState({
            sorted_check: sorter,
            filter_check: filter,
        });
    },
    clearFilters(e){
        e.preventDefault();
        this.setState({
            filter_check: null,
        });
    },
    clearAll(e){
        e.preventDefault();
        this.setState({
            sorted_check: null,
            filter_check: null,
        });
    },
    setDateSort(e){
        e.preventDefault();
        this.setState({
            sorted_check: {
                order: 'descend',
                columnKey: 'time',
            },
        });
    },
    onLoad(success, data, err){
        if (success && !err){
            this.setState({data: data});
        } else {
            openNotificationWithIcon('warning', '无数据', '找不到目标数据集');
        }
    },
    loaddata: function(key){
        if (!key){
            key = this.state.search_key;
        }
        xAJAX(UrlList.show, key, this.onLoad);

    },
    onUpdateSearch: function(key){
        this.setState({search_key:key});
    },
    onSearch: function(key){
        this.onUpdateSearch(key);
        this.loaddata(key);
    },
    startAutoPoll: function(){
        var interval = 3000;
        this.setState({pollInterval: interval});
        if (isNaN(this.state.autohandle)){
            var autohandle = setInterval(this.loaddata, interval);
            this.setState({autohandle: autohandle});
        }
    },
    stopAutoPoll: function(){
        this.setState({pollInterval: 0});
        if (!isNaN(this.state.autohandle)){
            clearInterval(this.state.autohandle);
            this.setState({autohandle: NaN});
        }
    },
    makeCheckChange: function(auto){
        if (auto){
            return this.startAutoPoll;
        }
        return this.stopAutoPoll;
    },
    componentDidMount: function() {
        this.loaddata();
        if (this.state.pollInterval){
            autohandle = setInterval(this.loaddata, this.state.pollInterval);
            this.setState({autohandle: autohandle});
        }
    },
    data_to_filter_set: function (){
        var myset = {};
        var obj = this.state.data;

        for (var key in obj){
            var sub = obj[key].device;
            for (var no in sub){
                myset[sub[no]] = true;
            }
        }
        var ret = [];
        for (var key in myset) {
            var tmp = {text: key, value: key};

            ret.push(tmp);
        }
        return ret.sort(function(a,b){return a.text < b.text ? -1 : +(a.text > b.text);});
    },

    hideSearchWindow: function(){
        this.setState({
            searchwindow: false,
        });
    },
    handleVisibleChange: function(visible) {
        this.setState({ searchwindow: visible });
    },
    CreateColumns(){
        const columns = [
            {
                title: '#',
                dataIndex: 'img',
                key: 'img',
                render: function(text, record){
                    var i = "http://www.rising.com.cn/favicon.ico";
                    if (record.img && record.img.length > 0){
                        i = record.img;
                    }

                    var sign = "无";
                    var gender = "未知";
                    if (record.gender){
                        if (record.gender == "male" || record.gender == 1){
                            gender = "男";
                        } else if (record.gender == "female" || record.gender == 2){
                            gender = "女";
                        }
                    }
                    if (record.sign && record.sign.length > 0){
                        sign = record.sign;
                    }
                    
                    var content = (<Card bodyStyle={{padding:0}}>
                        <div className="custom-image">
                        <img alt="Waiting..." src={i} />
                        </div>
                        <div className="custom-card">
                            <h3>{gender}</h3>
                            <p>{sign}</p>
                            </div>
                        </Card>);
                    
                    return <div><Popover content={content}
                                    trigger="hover"
                                    placement="right" >
                        <img alt="Waiting..." style={{width: 30, height: 30}} src={i} />
                     </Popover></div>
                }
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',

                sorter: create_order('name'),
            },
            {
                title: '时间',
                dataIndex: 'time',
                key: 'time',
                sorter: create_order('time'),
            },
            {
                title: '原始记录',
                dataIndex: 'ocount',
                key: 'ocount',
                sorter: create_order('ocount'),
                render: function(text, record){
                    let tmp = '无记录';
                    if (text){
                        tmp = "已记录 " + text + " 条";
                    }
                    return tmp;
                }
            },
            {
                title: '计算结果',
                dataIndex: 'pcount',
                key: 'pcount',
                sorter: create_order('pcount'),
                render(text, record){
                    let tmp = '无结果';
                    if (text){
                         tmp = "已估算 " + text + " 条";
                    }
                    return tmp;
                }
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'id',
                render(text, record){
                    let url = UrlList.MakeSingleLinkURL(record.id, "origin");
                    return (<Link to={url} >详细</Link>);
                }
            }
        ];
        return columns;
    },
    render: function() {
        let sorted_check = this.state.sorted_check || {};
        let filter_check = this.state.filter_check || {};

        var filter_set = this.data_to_filter_set();

        var filter_function = function(value, record){
            return record.device.indexOf(value) > -1;
        };
        const columns = this.CreateColumns();

        const pagination = {
            total: (this.state.data ? this.state.data.length : 0),
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
            },
            onChange(current) {
            },
        };

        var autobutton;
        if (isNaN(this.state.autohandle)){
            autobutton = <Button onClick={this.makeCheckChange(true)}>自动刷新</Button>;
        } else {
            autobutton = <Button onClick={this.makeCheckChange(false)} type="primary">停止刷新</Button>;
        }

        return (<div>
         
        <Row>
        <Col span={8}>
          <SearchBar
           placeholder="查找微信昵称"
           onSearch={this.onSearch}
           onUpdateSearch={this.onUpdateSearch}
           style={{ width: "100%" }}
           initkey={this.state.search_key} />
        </Col>
        <Col span={4} >
            <SearchForm
            name="高级搜索"
            onSubmit={this.onSearch}
            initkey={this.state.search_key}
            url_api={UrlList.country} />
        </Col>




        <Col span={4} offset={8}>
            {autobutton}
        </Col>
        </Row>
        <Row>
         <Col span={24}>
            <Table
            onChange={this.handleChange}
            dataSource={this.state.data}
            columns={columns}
            rowKey={record => record.id}
            loading={this.state.loading}
            pagination={pagination}
            />
        </Col>
        </Row>
        </div>);
    }
});


export default NamePage;