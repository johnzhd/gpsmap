import React from 'react';

/// details ///
import TimeAPI from '../Details/TimeAPI';
import TimeBar from '../Details/TimeBar';
import xNotification from '../Details/xNotification';

/// net ///
import xAJAX from '../../services/xAjax';
import UrlList from '../../services/UrlList';

/// map ///
import MakeMapObject from '../MapManager/MapObject';

/// UI ///
import { Row, Col } from 'antd';
import styles from '../Details/DetailsCSS.less';
import SelectNameList from '../Details/SelectNameList';
import SearchForm from '../Details/SearchForm';


const Normal = React.createClass({
    /// map ///
    InitCore(core){
        core.gpsbar = true;
        core.basebar = true;

        core.ShowMe = this.ShowMe;
        core.AccessMe = this.AccessMe;
    },
    ShowMe(){
        if (!this.state.myMapObjectCore){
            return;
        }
        if (!this.state.ShowingNameID){
            return;
        }
        this.loadPointsByNameID(this.state.ShowingNameID);
    },
    HideLinkLines(){
        if (this.state.ShowingAccess){
            for(var one of this.state.ShowingAccess){
                this.state.myMapObjectCore.ShowLayout(one, false);
            }
        }
    },
    AccessMe(){
        if (!this.state.myMapObjectCore){
            return;
        }
        if (!this.state.ShowingPoints){
            return;
        }
        let b = !this.state.IsShowingAccess;
        let ret = {};
        ret.IsShowingAccess = b;

        this.HideLinkLines();
        if (b && this.state.filters && this.state.filters.type != UrlList.origin){
            let one = this.state.myMapObjectCore.CreateLinks(this.state.ShowingPoints);
            if (one){
                this.state.myMapObjectCore.ShowLayout(one, true);
                ret.ShowingAccess = [one];
            }
            b = false; // Show link lines then not show circles;
        }
        if (this.state.ShowingPoints){
            this.state.myMapObjectCore.ShowCircle(this.state.ShowingPoints, b);
        }

        this.setState(ret);
    },
    ClearMap(){
        if (this.state.myMapObjectCore){
            this.state.myMapObjectCore.ClearAll();
        }
    },

    DataToPoints(data, timezone){
        let map = this.state.myMapObjectCore;
        if (!map || !data){
            return [];
        }
        let ret = {};
        let key = null;
        let last = NaN;
        let early = NaN;
        let marks = [];

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
             if (!marks[id]){
                 marks[id] = {
                    style: {color: 'red',},
                    label: <div></div>
                }
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
        

        if (timezone){
            timezone[0] = early;
            timezone[1] = last;
            timezone[2] = marks;
        }

        return ret;

    },
    GetPointByTime(points, start, end){
        for(var one of points){
            if (one.myid >= start && one.myid <= end){
                return one;
            }
        }
        return null;
    },
    GetPointsByFilter(datapoints, start, end){
        let map = this.state.myMapObjectCore;
        if (!map){
            return;
        }

        let ret = [];
        for(var k in datapoints){
            let point = this.GetPointByTime(datapoints[k], start, end);
            if (!point){
                continue;
            }
            ret.push(point);
        }
        ret.sort((a,b)=>{return a.myid - b.myid;});
        for (var i = 0; i < ret.length; i++){
            map.SetLabel(ret[i], (i+1).toString());
        }
        return ret;
    },
    UpdatePoints(points){
        let map = this.state.myMapObjectCore;
        if (!map){
            return;
        }
        
        this.ClearMap();
        if (!points){
            return;
        }

        points.sort((a,b)=>{return a.myid - b.myid;});

        for (var i = 0; i < points.length; i++){
            map.SetLabel(points[i], (i+1).toString());
        }

        map.ShowPoints(points, true, true);
    },

    ClearShowingPoints(){
        if (!this.state.myMapObjectCore){
            return;
        }
        this.state.myMapObjectCore.ClearAll();

        this.setState({
            ShowingPoints: [],
            ShowingNameID: [],

            ShowingAccess: [],
            IsShowingAccess: false,
        });
    },

    ShowPoints(data){
        let timezone = [NaN, NaN];
        let points = this.DataToPoints(data, timezone);
        
        let showing = this.GetPointsByFilter(points, timezone[0], timezone[1]);
        this.UpdatePoints(showing);
        
        this.setState({
            IsShowingAccess: false,
            ShowingAccess: [],
            DataPoints: points,
            ShowingPoints: showing,

            marks: timezone[2],
            total_start: timezone[0],
            start: timezone[0],
            end: timezone[1],
            total_end: timezone[1]
        });
    },

    getInitialState(){
        var core = MakeMapObject();
        if (core){
            this.InitCore(core);
        }
        return {
            filters: {},
            names: [],
            DataPoints: [],
            ShowingPoints: [],
            ShowingNameID: [],

            myMapObjectCore: core,

            ShowingAccess: [],
            IsShowingAccess: false,

            marks: [],
            total_start: 0,
            start: 0,
            end: 0,
            total_end: 0
        };
    },

    componentDidMount(){
        this.loadNameByNewFilters(this.state.filters);
    },



    loadNameByNewFilters(filters){
        let params = {};
        if (filters){
            params = filters;
        }
        xAJAX(UrlList.show, params, this.onLoadNameByNewFilters, 'GET');
    },
    onLoadNameByNewFilters(success, data, err, url){
        if (success && !err){
            this.setState({names: data});
            this.ChangeShowingNameID(this.state.ShowingNameID);
        } 
        else {
            this.setState({
                names: [],
            });
            this.ChangeShowingNameID([]);
        }
    },
    ChangeFilters(filters){
        this.setState({filters: filters});
        this.loadNameByNewFilters(filters);
    },
    MakeFilterDOM(){
        return (<SearchForm inline='1'
        
            name="确认"
            onSubmit={this.ChangeFilters}
            initkey={this.state.filters}
            url_api={UrlList.country}
            />);
    },



    IsInNameList(id){
        for (var one of this.state.names){
            if (one.id == id){
                return true;
            }
        }
        return false;
    },
    loadPointsByNameID(id){
        if (!id){
            if (!this.state.ShowingNameID || !this.state.ShowingNameID[0]){
                return;
            }
            id = this.state.ShowingNameID[0];
        }

        let params = {id: id};
        let url = UrlList.origin;
        if ( this.state.filters && this.state.filters.type && this.state.filters.type != UrlList.origin){
            url = UrlList.result;
        }
        xAJAX(url, params, this.onLoadPointsByNameID);
    },
    onLoadPointsByNameID(success, data, err, url){
        if (success && !err){
            this.ShowPoints(data);
        }
        else{
            this.ShowPoints([]);
        }
    },
    ChangeShowingNameID(ids){

        if (!ids || !ids[0] || !this.IsInNameList(ids[0])){
            this.ClearShowingPoints();
            return;
        }
        
        let id = ids[0];
        // same id. return
        if (this.state.ShowingNameID && this.state.ShowingNameID[0] == id){
            return;
        }
        this.setState({ShowingNameID: ids});
        this.loadPointsByNameID(id);
    },


    MakeListDOM(){
        return (<SelectNameList
            data={this.state.names}
            id={this.state.ShowingNameID}
            onChange={this.ChangeShowingNameID} />);
    },

    SetFilter(type, pair){
        console.log(type, pair);
        switch(type){
        case 'middle':
            this.setState({start: pair[0], end: pair[1]});
            if (this.state.DataPoints){
                let points = this.GetPointsByFilter(this.state.DataPoints, pair[0], pair[1]);
                this.UpdatePoints(points);
            }
            break;
        }
    },

    MakeTimeDOM(){
        if (!this.state.total_start || !this.state.total_end){
            return null;
        }
        return (<TimeBar 
            
            SetFilter={this.SetFilter}
            total_start={this.state.total_start}
            total_end={this.state.total_end}
            start={this.state.start}
            end={this.state.end}
            marks={this.state.marks}
            />);
    },

    MakeMapDOM(){
        return this.state.myMapObjectCore.ReturnMapDOM();
    },

    render(){
        console.log('render');
        let filterDOM = this.MakeFilterDOM();
        let timeDOM = this.MakeTimeDOM();
        let mapClass = styles.LastHeight_100;
        if (!timeDOM){
            timeDOM = (<div/>);
            mapClass = styles.LastHeight_68;
        }
        let listDOM = this.MakeListDOM();
        let mapDOM = this.MakeMapDOM();

        let span = 4;
        return (
            <Row className={styles.FullHeight}>
                <Col span={span} className={styles.FullHeight}>
                    {listDOM}
                </Col>
                <Col span={24-span} className={styles.FullHeight}>
                    <Row className={styles.FullWidth}>{filterDOM}</Row>
                    <Row className={styles.FullWidth}>{timeDOM}</Row>
                    <Row className={mapClass}>
                    {mapDOM}
                    </Row>
                </Col>
            </Row>);
    }
});


export default Normal;

