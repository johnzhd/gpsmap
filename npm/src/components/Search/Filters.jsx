import React, { Component, PropTypes } from 'react';

// import Todos from './Todos/Todos';
import styles from '../Details/DetailsCSS.less';
import { Row, Col } from 'antd';

import xAJAX from '../../services/xAjax';
import UrlList from '../../services/UrlList';

import NameList from '../Details/NameList'
import ControlTable from '../Details/ControlTable';

import ShowMap from '../MapManager/ShowMap';
import BaseMapAPI from '../MapManager/BaiduMap/BaseAPI';



const Opoints = React.createClass({
    mapContentLayout: [],

    getInitialState() {
      return {
        map: null, // map holder for map object
        mapdatafilter: {}, // map show points Filters
        datafilter: {}, // control table show, filter name list data


        namelistdata: [],
        namelistColumn: {},
      };
    },
    componentDidMount(){
      // load country
      // load Column name
      // ToDo load other known filters in db

      // load base filter datas set into name list
      this.LoadNameListByFilter(this.state.datafilter);

      // load base filter points set into map
    },

    ///   For Name List      /////////////
    LoadNameListByFilter(filter){
      xAJAX(UrlList.show, this.state.datafilter, this.onLoadnameListByFiler);
    },
    onLoadnameListByFiler(success, data, err){
      if (success && !err){
        this.setState({namelistdata: data});
      }
    },

    ///    For Map        //////////////////
    InitMap: function(map){
        this.setState({map: map});
    },
    LoadMapPoints(filter){
      if (this.state.datafilter){
        let tmp = this.state.datafilter;
        if (tmp.start){
          filter.start = tmp.start;
        }
        if (tmp.end){
          filter.end = tmp.end;
        }
      }
      switch(filter.action){
        case "origin":
        xAJAX(UrlList.origin, filter, this.onLoadMapPoints);
        break;
        case "calc":
        break;
      }
    },
    onLoadMapPoints(success, data, err){
      if (success && !err){
        // ToDo
        // data to points
        var points = this.DataToPoints(data);
        // renew map
        this.ClearMap();
        this.ShowPoints(points, true, false, true );
      }
    },
    DataToUniquePoints(data){
      var unique = new Map();
      try{
        data.forEach(function(one) {
          if (!one){
            return;
          }
          if (!one["latitude"] || !one["longitude"]){
            return;
          }
          var mark = one["latitude"].toString() + "," + one["longitude"].toString();
          var tmp = unique.get(mark);
          if (!tmp || tmp.time < one.time ){
            unique.set(mark, one);
          }
        }, this);
      }
      catch(e){
        console.log(e);
        return [];
      }

      var tmp = [];
      for (var value of unique.values()){
          tmp.push(value);
      }
      tmp.sort(function(a,b){
        if (a["time"] == b["time"]){
            return 0;
        }
        return  a["time"] < b["time"] ? -1 : 1;
      });
      return tmp;
    },
    DataToPoints(data){
      var tmp = this.DataToUniquePoints(data);

      var points = [];

      var i = 0;
      for (var one of tmp){
        i++;
        try{
          var lng = one["longitude"];
          var lat = one["latitude"];
          var dis = Number(one["distance"]);
          var label = "(" + i.toString() + ")";
          var id = one["id"] || '';
          let p = BaseMapAPI.PointAPIs.CreatePoint(
            lng, lat, dis,
            label, id,
            null, null);
          if (p){
            points.push(p);
          }
        }
        catch(e){
            console.log(e.message);
        }
      }
      return points;
    },
    ClearMap(){
      if (!this.state.map){
        return;
      }
      this.state.map.clearOverlays();
      // for (var one in this.mapContentLayout){
      //  this.state.map.removeOverlay(one);
      // }
      // this.mapContentLayout = [];
    },
    ShowPoints(points, circle, link, lastjump){
      let last = null;
      let map = this.state.map;
      let links = [];
      if (!points || points.length == 0){
        return;
      }
      for (var one of points){
        if (!one){
          continue;
        }
        if (one.marker){
          this.ShowLayout(map, one.marker);
        }
        if (circle && one.circle){
          this.ShowLayout(map, one.circle);
        }
        if (lastjump){
          last = one;
        }
      }
      if (link){
          let line = BaseMapAPI.LinkPoints(points);
          if (line){
            this.ShowLayout(map, line);
          }
        }
      if (lastjump && last){
        last.marker.setAnimation(BMAP_ANIMATION_BOUNCE);
      }
      BaseMapAPI.CenterZoom(map, points);
    },
    ShowLayout(map, layout){
      // this.mapContentLayout.push(layout);
      BaseMapAPI.AddLayout(map, layout);

    },



    render(){
        return (<div>
        <Row className={styles.FullHeight} >
        <Col span={12} className={styles.FullHeight}>
         <NameList 
         column={this.state.namelistColumn}
         data={this.state.namelistdata}
         searchKey={this.state.datafilter}
         ShowMap={this.LoadMapPoints}
         ></NameList>
        </Col>
        <Col span={12} className={styles.FullHeight}>
          <Row className={styles.HalfHeight} >
          <ShowMap InitMap={this.InitMap}></ShowMap>
          </Row>
          <Row className={styles.HalfHeight} >
          <ControlTable >debug</ControlTable>
          </Row>
        </Col>
        </Row>
    </div>);
    }
});



Opoints.propTypes = {
};

export default Opoints;
