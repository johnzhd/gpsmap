import styles from './Details/DetailsCSS.less';
import React from 'react';
import Name from './Name';

import { Table } from 'antd';
import { Row, Col } from 'antd';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

import MakeMapObject from './MapManager/MapObject';
import SinglePersonTable from './Details/SinglePersonTable';

import TimeAPI from './Details/TimeAPI';
import TimeBar from './Details/TimeBar';

import xAJAX from '../services/xAjax';
import UrlList from '../services/UrlList';


const SingleName = React.createClass({
    myMapObjectCore: null,
    myMapPoints: null,
    myMapShowAssist: false,
    myMapShowUrl: UrlList.origin,
    myShowingPoints: null,
    myShowingLinks: null,
    InitCore(core){
        this.myMapObjectCore = core;
        
        core.gpsbar = true;
        core.basebar = true;

        core.ShowMe = this.onCore;
        core.AccessMe = this.onCoreAssist;
    },
    ClearMap(){
        if (this.myMapObjectCore){
            this.myMapObjectCore.ClearAll();
        }
        this.myShowingLinks = null;
        this.myShowingPoints = null;
        this.setState({ShowingPoints: []});
    },

    getInitialState(){
        var core = MakeMapObject();
        if (core){
            this.InitCore(core);
        }

        return {
            wid: this.props.params.wid,
            total_start: null,  // Save Number of Second
            total_end: null,  // Save Number of Second
            start: null,  // Save Number of Second
            end: null,  // Save Number of Second
            tunit: null,  // Save Number of Minute
            ShowingPoints: [],
        };
    },
    componentDidMount(){
        this.onCore(null, null);
    },
    onShellOrigin(e){
        this.onCore(UrlList.origin, null);
    },
    onShellCalc(e){
        this.onCore(UrlList.result, null);
    },
    onShellTime(start, end){
        this.onCore(null, {start: start||this.state.start, end: end||this.state.end});
    },
    onCore(url, params){
        if (!url){
            url = this.myMapShowUrl;
        } else {
            if (url != this.myMapShowUrl){
                this.ClearMap();
            }
        }

        if (!this.myMapPoints || !this.myMapPoints[url]){
            let filter = {};
            filter.url = url || this.myMapShowUrl;
            filter.params = params;
            if (!filter.params){
                filter.params = {};
            }
            filter.params.id = this.state.wid || '';
            // net work download all timezone points
            this.loadPointData(filter);
            return;
        }

        this.myMapShowUrl = url;
        this.ShowPoints(params);

    },
    onCoreAssist(){
        this.myMapShowAssist = !this.myMapShowAssist;
        this.ShowAssist();
    },

    /// net work ///
    loadPointData(filter){
        let url = UrlList.origin;
        if (filter.url == UrlList.result){
            url = UrlList.result;
        }
        let params = {};
        if (filter.params){
            params = filter.params;
        }
        xAJAX(url, params, this.onloadPointData);
    },
    onloadPointData(success, data, err, url){
        if (this.myMapObjectCore && success && !err){
            if (!this.myMapPoints){
                this.myMapPoints = {};
            }
            this.myMapPoints[url] = this.DataToPoints(data);
            this.myMapShowUrl = url;
            this.ShowPoints();
        }
    },
    DataToPoints(data){
        let map = this.myMapObjectCore;
        if (!map){
            return;
        }
        let ret = {};
        let key = null;
        let last = NaN;
        let early = NaN;

        for (var one of data){
            if (!one
             || !one.latitude
             || !one.longitude
             || !one.distance
             || !one.time
             ){
                 continue;
             }
             key = one.longitude + '-' + one.latitude;
             if (!ret[key]){
                 ret[key] = [];
             }

             let id = TimeAPI.StringToSecond(one.time);
             if (!early || early > id){
                 early = id;
             }
             if (!last || last < id){
                 last = id;
             }

             let tmp = map.CreatePoint(
                 one.longitude,
                 one.latitude,
                 Number(one.distance),
                 '',
                 id,
                 null, null);

            ret[key].push(tmp);
        }

        for (var k in ret){
            ret[k].sort((a, b)=>{
                return b.myid - a.myid;
            });
        }

        if (last){
            this.SetFilter('total_end', last + 3600);
        }
        if (early){
            this.SetFilter('total_start', early - 3600);
        }
        return ret;
    },
    ShowPoints(params){
        let map = this.myMapObjectCore;
        var points = [];
        var tmp = this.myMapPoints[this.myMapShowUrl];
        var start = this.state.start;
        var end = this.state.end;
        var that = this;
        if (params){
            start = params.start || this.state.start;
            end = params.end || this.state.end;
        }

        var hit_start = (one)=>{return one >= start};
        if (!start){
            hit_start = (one)=>{return true;};
        }
        var hit_end = (one)=>{return one <= end};
        if (!end){
            hit_end = (one)=>{return true;};
        }




        for (var key in tmp){
            for (var one of tmp[key]){
                if (hit_start(one.myid) && hit_end(one.myid)){
                    points.push(one);
                    break;
                }
            }
        }

        points.sort((a,b)=>{
            return a.myid - b.myid;
        });
        let no = 0;

        this.ClearMap();
        
        map.ShowPoints(points, true, true);
        for (var one of points){
            no++;
            map.SetLabel(one, no.toString());
        }
        this.myShowingPoints = points;
        this.setState({ShowingPoints: this.myShowingPoints});
        this.ShowAssist();
    },
    ShowAssist(){
        if (!this.myMapObjectCore || !this.myShowingPoints){
            return;
        }
        let type = this.myMapShowUrl;
        if (type == UrlList.result){
            if (!this.myShowingLinks && this.myMapShowAssist){
                this.myShowingLinks = this.myMapObjectCore.CreateLinks(this.myShowingPoints);
            }
            this.myMapObjectCore.ShowLayout(this.myShowingLinks, this.myMapShowAssist);
            return ;
        }
        this.myMapObjectCore.ShowCircle(this.myShowingPoints, this.myMapShowAssist);
    },

    SetFilter(name, value){
        if (!value){
            return;
        }
        switch(name){
        case 'start':
            if (this.state.total_start && this.state.end
                && value >= this.state.total_start
                && value <= this.state.end
            ){
                this.setState({start: value});
            }
            break;
        case 'end':
            if (this.state.total_end && this.state.start
                && value <= this.state.total_end
                && value >= this.state.start
            ){
                this.setState({end: value});
            }
            break;
        case 'middle':
            this.SetFilter('start', value[0]);
            this.SetFilter('end', value[1]);
            this.onShellTime(value[0], value[1]);
            break;
        case 'total_start':
            if (!this.state.total_start){
                this.setState({total_start: value, start: value});
            }
            break;
        case 'total_end':
            if (!this.state.total_end){
                this.setState({total_end: value, end: value});
            }
            break;
        }
    },


    MakeMarkByShowingPoints(){
        var ret = {};
        if (!this.myMapPoints || !this.myMapShowUrl || !this.myMapPoints[this.myMapShowUrl]){
            return ret;
        }

        let points = this.myMapPoints[this.myMapShowUrl];
        let unique = [];

        for (var key in points){
            for (var one of points[key]){
                if (ret[one.myid]){
                    continue;
                }
                ret[one.myid] = {
                    style: {
                        color: 'red',
                    },
                    label: <div></div>
                }
            }
        }
        return ret;
    },

    MakeListDOM(){
        let points = [];

        let id = 0;
        if (this.myMapPoints && this.myMapPoints[this.myMapShowUrl]){
            for (var key in this.myMapPoints[this.myMapShowUrl]){
            for (var one of this.myMapPoints[this.myMapShowUrl][key]){
                let tmp = {time: one.myid, point: one.point, myid: id.toString(), tid: 't'+id.toString(), pid: 'p'+id.toString() };
                id++;
                points.push(tmp);
            }
            }
        }

        console.log('here');
        
        const columns = [
            {
                title: '时间',
                dataIndex: 'time',
                key: 'tid',
                sorter: (a,b)=>{return a - b;},
                render: function(text, record, index){
                    let tmp = TimeAPI.SecondToString(text);
                    if (tmp){
                        tmp = tmp.split(' ').map(function(one){
                            return <p key={one+ record.tid}>{one}</p>;
                        });
                    }
                    return tmp;
                }
            },
            {
                title: '坐标',
                dataIndex: 'point',
                key: 'pid',
                sorter: function(a,b){
                    if (a.point.longitude == b.point.longitude){
                        return a.point.latitude - b.point.latitude;
                    }
                    return a.point.longitude - b.point.longitude;
                },
                render: function(text, record, index){

                    return (<div><Row>
                    <Col span='24'>{record.point.lng.toFixed(6)}</Col>
                    </Row>
                    <Row>
                    
                    <Col span='24'>{record.point.lat.toFixed(6)}</Col>
                    </Row></div>);
                }
            },
        ];

        const pagination = {
            total: (points ? points.length : 0),
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
            },
            onChange(current) {
            },
        };

        return (<Table size="small" 
            dataSource={points}
            columns={columns}
            rowKey='myid'
            pagination={pagination}
            />);
    },
    MakeControlTableDOM(){
        if (!this.state.total_start || !this.state.total_start){
            return (<div>无数据</div>);
        }
        var total_start = this.state.total_start || NaN;
        var total_end = this.state.total_end || NaN;
        var start = this.state.start || NaN;
        var end = this.state.end || NaN;
        var marks = this.MakeMarkByShowingPoints();

        return  (<TimeBar
            marks={marks}
            SetFilter={this.SetFilter}
            total_start={total_start}
            total_end={total_end}
            start={start}
            end={end}
          />);
    },

    MakeMyDOM(){
        let PersonInfo = (<SinglePersonTable
          wid={this.props.params.wid} 
          onOrigin={this.onShellOrigin}
          onCalc={this.onShellCalc} />);

        let PointsList = this.MakeListDOM();

        let TimeControl = this.MakeControlTableDOM();
        let MapControl = this.myMapObjectCore.ReturnMapDOM();

        let span = 6;

        return (<div className={styles.FullFrame}>
        <Row className={styles.FullHeight} >
        <Col span={span} className={styles.FullHeight}>
            <Tabs  defaultActiveKey="1"  >
                <TabPane tab="用户信息" key="1">
                {PersonInfo}
                </TabPane>
                <TabPane tab="坐标列表" key="2">
                {PointsList}
                </TabPane>
            </Tabs>
        </Col>

        <Col span={24-span} className={styles.FullHeight}>
            <Row >
            {TimeControl}
            </Row>

            <Row className={styles.LastHeight_46}>
            {MapControl}
            </Row>
        </Col>
        </Row>
        </div>);
    },
    render(){
        if (!this.props.params.wid){
            return <Name />
        }
        return this.MakeMyDOM();
    }
});

export default SingleName;
