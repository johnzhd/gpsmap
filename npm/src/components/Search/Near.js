import styles from '../Details/DetailsCSS.less';
import React from 'react';

import TimeAPI from '../Details/TimeAPI';
import TimeBar from '../Details/TimeBar';

import NameList from '../Details/NameList';

import BaseAPI from '../MapManager/BaiduMap/BaseAPI';
import MakeMapObject from '../MapManager/MapObject';

import xAJAX from '../../services/xAjax';
import UrlList from '../../services/UrlList';


import { Row, Col } from 'antd';
import { Slider } from 'antd';


const Near = React.createClass({
    ///  base  ///
    myMapObjectCore: null,
    myMapTimeStart: null,
    myMapTimeEnd: null,
    myMapPoints: null,
    myMapShowingPoints: [],

    myMapCenterPoint: null,
    myMapCenterShow: false,
    myMapCenterShowCircle: false,

    myMapClickAvoid: false,

    ///  map  ///
    InitCore(core){
        this.myMapObjectCore = core;
        
        core.gpsbar = true;
        core.basebar = true;

        core.onclickmap = this.onFilterGPS;
        core.onGPSGo = this.onFilterGPS;

        core.ShowMe = this.ShowMe;
        core.AccessMe = this.AccessMe;

        this.myMapCenterShow = false;
        this.myMapCenterShowCircle = false;
        this.myMapCenterPoint = BaseAPI.PointAPIs.CreatePoint(116.325313, 39.982549, 500, null, null, null, null);
        if (this.myMapCenterPoint){
            BaseAPI.PointAPIs.EnableDrag(this.myMapCenterPoint, true);
        }
    },
    ShowMe(){
        if (!this.myMapCenterShow){
            return;
        }
        this.loadPoints(NaN, NaN, NaN);
    },
    AccessMe(){
        if (!this.myMapCenterShow){
            return;
        }
        this.myMapCenterShowCircle = !this.myMapCenterShowCircle;
        this.ShowCenterCircle();
    },
    ShowCenterPoints(){
        this.myMapCenterShow = true;
        this.myMapObjectCore.ShowLayout(this.myMapCenterPoint.marker, true);
        this.myMapObjectCore.ShowLayout(this.myMapCenterPoint.circle, this.myMapCenterShowCircle);
        BaseAPI.CenterZoom(this.myMapObjectCore.MyMap(), [this.myMapCenterPoint]);
    },
    ShowCenterCircle(){
        if (!this.myMapCenterShow){
            return;
        }
        this.myMapObjectCore.ShowLayout(this.myMapCenterPoint.circle, this.myMapCenterShowCircle);
    },
    ShowPoints(){
        var map = this.myMapObjectCore;
        if (!map){
            return;
        }

        console.log('here');

        for (var one of this.myMapShowingPoints){
            map.ShowLayout(one.marker, false);
        }
        let ret = [];
        let start = TimeAPI.StringToSecond(this.myMapTimeStart);
        let end = TimeAPI.StringToSecond(this.myMapTimeEnd);

        for (var one of this.myMapPoints){
            let tmp = TimeAPI.StringToSecond(one.myid);
            if (tmp && tmp >= start && tmp <= end ){
                ret.push(one);
                map.ShowLayout(one.marker, true);
            }
        }
        this.myMapShowingPoints = ret;
        if (this.myMapPoints){
            BaseAPI.CenterZoom(this.myMapObjectCore.MyMap(), this.myMapPoints);
        }
    },

    DataToPoints(data){
        let ret = [];
        let early = null;
        let last = null;
        for (var one of data){
            if (!one.longitude || !one.latitude || !one.id || !one.time){
                continue;
            }
            if (!early || early > one.time){
                early = one.time;
            }
            if (!last || last < one.time){
                last = one.time;
            }
            let gender = '任意';
            if (one.gender){
                if (one.gender == "male" || one.gender == 1){
                    gender = "男";
                } else if (one.gender == "female" || one.gender == 2){
                    gender = "女";
                }
            }
            let tmp = BaseAPI.PointAPIs.CreatePicturePoint(
                one.longitude,
                one.latitude,
                one.id,
                one.time,
                one.img || 'http://www.rising.com.cn/favicon.ico',
                one.name || '未知',
                gender,
                one.sign || '无',
                this.onClickMapPoint
            );
            if (tmp){
                ret.push(tmp);
            }
        }
        if (ret){
            this.myMapPoints = ret;
        }
        if (early && last){
            this.SetFilter('time', [early, last]);
        }
    },
    MoveCenter(lng, lat, dis, show){
        BaseAPI.PointAPIs.MovePoint(this.myMapCenterPoint, lng, lat, dis);
        if (show === null){
            return;
        }
        this.myMapCenterShow = show;
        this.myMapObjectCore.ShowLayout(this.myMapCenterPoint, this.myMapCenterShow);
        this.myMapObjectCore.ShowLayout(this.myMapCenterPoint.circle, this.myMapCenterShowCircle);
    },


    /// UI Event ///
    getInitialState(){
        var core = MakeMapObject();
        if (core){
            this.InitCore(core);
        }
        return {
            total_start: NaN,
            total_end: NaN,
            start: NaN,
            end: NaN,

            data: [],
            points: NaN,
            };
    },
    onFilterGPS(lng, lat){
        if (!this.myMapObjectCore || this.myMapClickAvoid){
            this.myMapClickAvoid = false;
            return;
        }
        this.SetFilter('postion', [lng, lat]);
        this.ShowCenterPoints();
    },
    onFilterDistancs(value){
        if (!this.myMapObjectCore){
            return;
        }
        this.SetFilter('distance', value);
    },
    onClickMapPoint(id){
        this.myMapClickAvoid = true;
        console.log("id", id);
    },

    ///  NET  ///
    loadPoints(lng, lat, distance){
        if (!this.myMapCenterPoint || !this.myMapCenterPoint.point){
            return;
        }
        var params = {};
        let point = this.myMapCenterPoint;
        params["longitude"] = lng || this.myMapCenterPoint.point.lng;
        params["latitude"] = lat || this.myMapCenterPoint.point.lat;
        params["distance"] = distance || this.myMapCenterPoint.distance;
        var url = UrlList.near;
        xAJAX(url, params, this.onLoadPoints);
    },
    onLoadPoints(success, data, err, url){
        if (success && !err){
            // for list
            this.setState({data: data});

            // for map
            this.DataToPoints(data);
            this.ShowPoints();
        }
    },


    ///  Control  ///
    SetFilter(key, value){
        console.log(key, value);
        switch(key){
        case 'time':
            let t_start = value[0];
            let t_end = value[1];
            if (t_start && t_end && t_start <= t_end){
                this.myMapTimeStart = t_start;
                this.myMapTimeEnd = t_end;

                t_start = TimeAPI.StringToSecond(t_start);
                t_end = TimeAPI.StringToSecond(t_end);
                this.setState({
                    total_start: t_start,
                    total_end: t_end,
                    start: t_start,
                    end: t_end,
                });
            }
            break;
        case 'middle':
            let start = value[0];
            let end = value[1];
            if (start && end && start <= end){
                this.myMapTimeStart = TimeAPI.SecondToString(start);
                this.myMapTimeEnd = TimeAPI.SecondToString(end);

                this.setState({
                    start: start,
                    end: end,
                });

                if (this.myMapCenterShow){
                    this.ShowPoints();
                }
            }
            break;
        case 'postion':
            let lng = value[0];
            let lat = value[1];
            this.MoveCenter(lng, lat, NaN, true );
            this.loadPoints(lng, lat, NaN);
            break;
        case 'distance':
            this.MoveCenter(NaN, NaN, value, null);
            if (this.myMapCenterShow){
                this.loadPoints(NaN, NaN, value);
            }
            break;
        }
    },


    ///  DOM  ///
    FindAndShowMapNode(id, show){
        for (var one of this.myMapShowingPoints){
            if (one.id == id && show){
                one.marker._div.onmouseover();
            }
            else{
                one.marker._div.onmouseout();
            }
        }
    },
    ListDOM(){
        return (<NameList
            data={this.state.data}
            onRowClick={this.FindAndShowMapNode}
            onShowPop={this.FindAndShowMapNode}
         />);
    },
    TimeBarDOM(){
        if (!this.state.total_start || !this.state.total_start){
            return (<div>点选区域</div>);
        }

        var total_start = this.state.total_start || NaN;
        var total_end = this.state.total_end || NaN;
        var start = this.state.start || NaN;
        var end = this.state.end || NaN;

        
        console.log(total_start, start, end, total_end);

        return  (<TimeBar
            SetFilter={this.SetFilter}
            total_start={total_start}
            total_end={total_end}
            start={start}
            end={end}
          />);
    },



    DistanceDOM(){
        const formatter = function(value) {
        return `${value} 米以内`; };
        let value = 500;
        if (this.myMapCenterPoint && this.myMapCenterPoint.distance){
            value = this.myMapCenterPoint.distance;
        }
        return (<Slider
            min={1}
            max={1000}
            defaultValue={value}
            onAfterChange={this.onFilterDistancs} 
            tipFormatter={formatter}/>);
    },

    render(){
        var listDOM = this.ListDOM();
        var TimeBarDOM = this.TimeBarDOM();
        var DistanceDOM = this.DistanceDOM();
        var mapDOM = this.myMapObjectCore.ReturnMapDOM();
        let xs = 6; // 768
        let sm = 4; // 768
        let md = 4; // 992
        let lg = 4; // 1200
        return (
        <Row className={styles.FullHeight}>
        <Col xs={{span:xs}} 
        sm={{span:sm}}
        md={{span:md}}
        lg={{span:lg}}
        className={styles.FullHeight}>
            <Row>
                {listDOM}
            </Row>
            <Row>
                {TimeBarDOM}
            </Row>
            <Row>
                {DistanceDOM}
            </Row>
        </Col>
        <Col xs={{span: 24-xs}} 
        sm={{span: 24-sm}}
        md={{span: 24-md}}
        lg={{span: 24-lg}}
        className={styles.FullHeight}>
            {mapDOM}
        </Col>
        </Row>);
    }
});


export default Near;
