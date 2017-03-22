import styles from './Details/DetailsCSS.less';
import React from 'react';


import classNames from 'classnames';


import MakeMapObject from './MapManager/MapObject';

import UrlList from '../services/UrlList';
import xAJAX from '../services/xAjax';


import { Button } from 'antd';
import { Row, Col } from 'antd';
import { Select } from 'antd';
import { Table } from 'antd';
const Option = Select.Option;
import { Input, InputNumber } from 'antd';
const InputGroup = Input.Group;



function create_order(name){
    return function(a,b){
        if (a[name] > b[name]){ return 1; }
        else if (a[name] < b[name]){ return -1; }
        else {return 0;}
    }
}

const Device = React.createClass({
    myMapObjectCore: null,
    myMapDevicePoints: {}, // task: [points]
                           // points id marker label point myid
    myMapDeviceConfirm: {},

    myMapShowingPoints: [],

    myMapClickAvoid: false,

    InitCore(core){
        this.myMapObjectCore = core;
        
        core.gpsbar = true;
        core.basebar = true;

        
        core.onclickmap = this.onClickMap;
        core.onGPSGo = this.onGPSGo;

        core.ShowMe = this.ShowMe;
        core.AccessMe = this.AccessMe;
    },
    ClearMap(){
        if (this.myMapObjectCore){
            this.myMapObjectCore.ClearAll();
        }
        this.myMapShowingPoints = [];
    },

    DataToPoints(data, task){
        let ret = [];
        let id = 0;
        let that = this;
        if (data && data.length > 0){
            // ASC
            data.sort((a,b)=>{
                if (a.time == b.time){
                    return 0;
                }
                if (a.time > b.time){
                    return 1;
                }
                return -1;
            });
        }
        for (var one of data){
            let tmp = this.myMapObjectCore.CreatePoint(
                one['longitude'],
                one['latitude'],
                0,
                one['device'],
                id.toString(),
                that.ClickUpdatePoint,
                that.DragUpdatePoint
            );
            id++;
            ret.push(tmp);
        }
        ret.reverse();
        return ret;
    },
    ClickUpdatePoint(e, point){

        this.myMapClickAvoid = true;
        /// status ///
        if (!this.state.ListEdit){
            return;
        }
        this.MapCall_RemoveSinglePoint(e.point.lng, e.point.lat, point.myid, point);
    },
    DragUpdatePoint(e, point){
        console.log('drag', point.myid);
        this.MapCall_ShowPage(point.myid, point);
    },


    PointsToData(points, task){
        let ret = [];
        for (var one of points){
            ret.push({
                "latitude": one.point.lat,
                "longitude": one.point.lng,
                "device": one.label,
            });
        }
        return ret;
    },

    SetMapEditAble(edit){
        if(!this.myMapObjectCore){
            return;
        }
        // loop showing point 
        // drag able
        let points = this.myMapShowingPoints;
        for (var one of points){
            this.myMapObjectCore.DragPoint(one, edit);
        }
    },

    IndexOfPointByID(id){
        let tmp = this.state.ShowingPoints;
        let obj = null;
        for (var one of tmp){
            if (one.myid === id){
                obj = one;
                break;
            }
        }
        return obj;
    },

    MaxID(task){
        let tmp = this.state.ShowingPoints;
        let id = 0;
        if (tmp){
            for (var one of tmp){
                let n = Number(one.myid);
                if (isNaN(n)){
                    continue;
                }
                if (n >= id){
                    id = n + 1;
                }
            }
        }

        tmp = this.myMapDevicePoints[task];
        if (tmp){
            for (var one of tmp){
                
                let n = Number(one.myid);
                if (isNaN(n)){
                    continue;
                }
                if (n >= id){
                    id = n + 1;
                }
            }
        }
        return id.toString();
    },
    GPSUnique(lng, lat, task){
        let tmp = this.state.ShowingPoints;
        let id = 0;
        if (tmp){
            for (var one of tmp){
                if (one.point.lng == lng && one.point.lat == lat){
                    return false;
                }
            }
        }

        tmp = this.myMapDevicePoints[task];
        if (tmp){
            for (var one of tmp){
                if (one.point.lng == lng && one.point.lat == lat){
                    return false;
                }
            }
        }
        return true;
    },

    MapCall_AddSinglePoint(lng, lat){
        if (!this.myMapObjectCore){
            return;
        }
        if (!this.GPSUnique(lng, lat, this.state.task)){
            return ;
        }
        let id = this.MaxID(this.state.task);
        /// ... ///
        let that = this;
        let one = this.myMapObjectCore.CreatePoint(
                lng,
                lat,
                0,
                '!NEW!',
                id.toString(),
                that.ClickUpdatePoint,
                that.DragUpdatePoint
            );
        if (!one){
            return;
        }
        this.myMapObjectCore.DragPoint(one, this.state.ListEdit);
        /// add ///
        let tmp = this.state.ShowingPoints;
        tmp.push(one);

        this.myMapObjectCore.ShowPoints([one], true, false);
        this.MapCall_ShowPage(id, one);
    },
    MapCall_RemoveSinglePoint(lng, lat, id, point){

        console.log('del', id);
        let tmp = this.state.ShowingPoints;
        if (!tmp){
            return;
        }
        for (var i = 0; i < tmp.length; i++){
            if (tmp[i].myid == id){
                // map
                this.myMapObjectCore.DeletePoint(tmp[i]);
                // data
                tmp.splice(i,1);

                // renew UI
                let no = parseInt( (i - 1) / this.state.pageSize );
                this.setState({current: no + 1});
                return;
            }
        }
    },

    MapCall_ShowPage(id, point){
        for (var i = 0; i < this.state.ShowingPoints.length; i++){
            if (this.state.ShowingPoints[i].myid === id){
                let no = parseInt(1 + i/this.state.pageSize);
                this.setState({
                    current: no});
                break;
            }
        }
    },
    
    ListCall_AddSinglePoint(lng, lat, id){

    },
    ListCall_RemoveSinglePoint(id){

    },
    ListCall_MoveSinglePoint(lng, lat, name, id, point){
        if (!lng && !lat && !name){
            return;
        }
        if (!point){
             point = this.IndexOfPointByID(id);
        }
        if (!point){
            return;
        }
        if(!lng && !lat){
            this.myMapObjectCore.SetLabel(point, name);
            return;
        }

        if (!lng){
            lng = point.point.lng;
        }
        if (!lat){
            lat = point.point.lat;
        }
        this.myMapObjectCore.MovePoint(point, lng, lat, NaN);
        return point;
    },
    ListCall_Jump(id, point, jump){
        if (!point){
            point = this.IndexOfPointByID(id);
        }

        if (point){
            this.myMapObjectCore.JumpPoint(point, jump);
            return;
        }
        return point;
    },


    SyncPointsToList(){
        return this.state.ShowingPoints;
    },



    ShowPoints(task){
        // clear showing
        // show points
        // set ShowPoints

        if (this.myMapObjectCore){
            this.myMapObjectCore.ClearAll();
        }
        this.myMapShowingPoints = [];

        let tmp = this.myMapDevicePoints[task];
        if (tmp){
            this.myMapObjectCore.ShowPoints(tmp, true, true);
            this.myMapShowingPoints = tmp;
            this.SetMapEditAble(this.state.ListEdit);
            this.setState({
                task: task,
                ShowingPoints: this.myMapShowingPoints,
                current: 1,
            });
        }
    },

    UpdatePoints(task){
        if (task != this.state.task){
            return;
        }
        this.ShowPoints(task);
    },

    onClickMap(lng, lat){
        if(this.myMapClickAvoid){
            this.myMapClickAvoid = false;
            return;
        }
        ///  status ///
        if (!this.state.ListEdit){
            return;
        }


        this.MapCall_AddSinglePoint(lng, lat);
    },

    onGPSGo(lng, lat){

    },

    ShowMe(){
        let points = this.state.ShowingPoints;
        if (points && this.myMapObjectCore){
            this.myMapObjectCore.CenterPoints(points);
        }
    },

    AccessMe(){

    },


    ///   DOM   ////

    getInitialState(){
        var core = MakeMapObject();
        if (core){
            this.InitCore(core);
        }
        return {
            tasks: ['node'],
            task: 'node',
            ShowingPoints: [],
            ListEdit: false,
            current: 1,
            pageSize: 10,
        };
    },

    componentDidMount(){
        this.loadPoints(this.state.task);
    },

    loadPoints(task){
        if (!task){
            task = '';
        }
        var that = this;
        xAJAX(UrlList.device, {
            action: "getall",
            task: task,
        }, (success, data, err, url)=>{
            that.onLoadPoints(success, data, err, url, task);
        });
    },
    onLoadPoints(success, data, err, url, task){
        if (success && !err){
            this.myMapDevicePoints[task] = this.DataToPoints(data, task);
            this.myMapDeviceConfirm[task] = true;
            this.UpdatePoints(task);
        }
    },
    uploadPoints(task, data){
        if (!task){
            task = '';
        }
        var that = this;
        xAJAX(UrlList.device, {
            action: 'setall',
            data: JSON.stringify(data),
            task: task,
            }, (success, data, err, url)=>{
            that.onUploadPoints(success, data, err, url, task);
            }, 'POST');
    },
    onUploadPoints(success, data, err, url, task){
        if (success && !err){
            this.myMapDevicePoints[task] = this.DataToPoints(data, task);
            this.myMapDeviceConfirm[task] = true;
            this.setState({ListEdit: false});
            this.UpdatePoints(task);
        }
    },

    onEditClick(){
        if (!this.state.ListEdit){
            // upload points
            this.setState({ListEdit: true});
            this.SetMapEditAble(true);
            return;
        }
        let data = this.PointsToData(this.state.ShowingPoints, this.state.task);
        this.uploadPoints(this.state.task, data);
    },

    ChangeTask(task){
        this.ShowPoints(task);
        this.setState({task:task});
    },

    MakeTaskDOM(){
        let bType = 'ghost';
        if (this.state.ListEdit){
            bType= 'primary';
        }
        let task = this.state.task;
        let children = this.state.tasks.map(
            function(one){
                return (<Option key={one} value={one}>{one}</Option>);
            }
        );
        let selectDisabled = this.state.ListEdit;
        return (
            <Row>
            <Col span="20">
                <Select
                disabled={selectDisabled}
            showSearch 
            className={styles.FullWidth}
            placeholder="请选择任务"
            value={task}
            optionFilterProp="children"
            notFoundContent="无法找到"
            onChange={this.ChangeTask}
            >
                    {children}
                </Select>
            </Col>
            <Col span="2">
                <Button icon="edit" type={bType} onClick={this.onEditClick}/>
            </Col>
            
            </Row>
            );
    },

    ColumnList(){
        var that = this;
        return [
            {
                title: '名称',
                dataIndex: 'label',
                key: 'myid',
                sorter: create_order('label'),
                render: function(text, record){
                    if (that.state.ListEdit){
                        return (<Input disabled readOnly value={text} />);
                    }
                    return (<span>{text}</span>);
                }
            },
            {
                title: '坐标',
                dataIndex: 'point',
                key: 'point',
                sorter: function(a,b){
                    if (a.point.longitude == b.point.longitude){
                        return a.point.latitude - b.point.latitude;
                    }
                    return a.point.longitude - b.point.longitude;
                },
                render: function(text, record, index){
                    if (that.state.ListEdit){

                        let changeLng = function(e){
                            let value = Number(e.target.value);
                            if (isNaN(value) || value > 180 || value < -180){
                                e.target.value = record.point.lng;
                                return;
                            }
                            let obj = that.ListCall_MoveSinglePoint(value, NaN, null, record.myid, record);
                            that.ListCall_Jump(record.myid, obj, false);
                            that.setState({current: that.state.current});
                        }
                        let changeLat = function(e){
                            let value = Number(e.target.value);
                            if (isNaN(value) || value > 90 || value < -90){
                                e.target.value = record.point.lat;
                                return;
                            }
                            let obj = that.ListCall_MoveSinglePoint(NaN, value, null, record.myid, record);
                            that.ListCall_Jump(record.myid, obj, false);
                            that.setState({current: that.state.current});
                        }
                        let onFocus = function(e){
                            that.ListCall_Jump(record.myid, null, true);
                        }
                        let onBulr = function(e){
                            that.ListCall_Jump(record.myid, null, false);
                        }
                        return(<InputGroup >
                            <Col span='12'>
                            <Input
                                value={record.point.lng}
                                onPressEnter={changeLng}
                                onChange={changeLng}
                                onFocus={onFocus}
                                onBlur={onBulr}
                                />
                            </Col>
                            <Col span='12'>
                            <Input
                                value={record.point.lat}
                                onPressEnter={changeLat}
                                onChange={changeLat}
                                onFocus={onFocus}
                                onBlur={onBulr}
                                />
                            </Col>
                        </InputGroup>);
                    }
                    return (<Row>
                    <Col span='12'>{record.point.lng}</Col>
                    <Col span='1'>-</Col>
                    <Col span='11'>{record.point.lat}</Col>
                    </Row>);
                }
            }
        ];
    },

    MakePointListDOM(){
        let that = this;
        let childdata = this.SyncPointsToList();
        let columns= this.ColumnList();
        const pagination = {
            total: (childdata ? childdata.length : 0),
            showSizeChanger: true,
            current: this.state.current,
            pageSize: this.state.pageSize,
            onShowSizeChange(current, pageSize) {
                that.setState({current: current, pageSize: pageSize});
            },
            onChange(current) {
                that.setState({current: current});
            },
        };

        return (<Table size="small" 
            dataSource={childdata}
            columns={columns}
            rowKey={record => record.myid}
            pagination={pagination}
            />);
    },

    MakeFrameDOM(){
        let leftUp = this.MakeTaskDOM();

        let leftDown = this.MakePointListDOM();

        let right = this.myMapObjectCore.ReturnMapDOM();

        // base 240
        let xs = 8; // 768
        let sm = 8; // 768
        let md = 6; // 992
        let lg = 5; // 1200

        if (this.state.ListEdit){
            // base 312
            xs = 10;
            sm = 10;
            md = 8;
            lg = 7;
        }

        return (<div className={styles.FullFrame}>
        <Row className={styles.FullHeight} >
        <Col
            xs={{span:xs}}
            sm={{span:sm}}
            md={{span:md}}
            lg={{span:lg}}
            className={styles.FullHeight}>
          <Row >
          {leftUp}
          </Row>
          <Row >
          {leftDown}
          </Row>
        </Col>
        <Col
            xs={{span:24-xs}}
            sm={{span:24-sm}}
            md={{span:24-md}}
            lg={{span:24-lg}}
            className={styles.FullHeight}>
          {right}
        </Col>
        </Row>
        </div>);
    },


    render(){
        var frame = this.MakeFrameDOM();
        return frame;
    }
});


export default Device;

