import React from 'react'
import BaiduMap from './BaiduMap/Basemap'
import BaseMapAPI from './BaiduMap/BaseAPI'

import xAJAX from '../../services/xAjax'
import UrlList from '../../services/UrlList'



const ShowDevice = React.createClass({
    getInitialState: function(){
        return {
            map: null,
            points: [],
            url: null,
        }
    },
    RenewDevicePoint(datas){
        // data to object
        // clear old object
        // set new object
        var map = this.state.map;
        if (!map){
            return;
        }
        var points = this.state.points;
        if (points && points.length > 0){
            for (var one of points){
                if (!one.marker){
                    continue;
                }
                BaseMapAPI.ClearLayout(map, one.marker);
            }
        }
        points = [];
        for (var i = 0; i < datas.length; i++) {
            var label = datas[i]["device"];
            if (!label) {
                continue;
            }
            try {
                var dis = Number(datas[i]["distance"]);
                var p = BaseMapAPI.PointAPIs.CreatePoint(
                    datas[i]["longitude"],
                    datas[i]["latitude"], 
                    dis,
                    label,
                    null,null);
                if (p.point) {
                    points.push(p);
                }
            }
            catch (e) {
                console.log(e.message);
            }
        }
        if (points && points.length > 0){
            this.setState({points: points});
        }
        return points;
    },
    ShowPoints(b){
        var map = this.state.map;
        var list = this.state.points;
        if (!list || !map){
            return;
        }
        for (var one of list){
            if (!one || !one.marker){
                continue;
            }
            BaseMapAPI.AddLayout(map, one.marker);
        }
        BaseMapAPI.CenterZoom(map, list);
    },
    onLoad(success, data, err){
        if (success && !err){
            this.RenewDevicePoint(data);
            this.ShowPoints(true);
        } else if (err) {
            console.error(err);
        } else {
        }
    },
    loaddata(){
        // load points
        // then clear old points
        // show new points
        xAJAX(UrlList.device, {'action':'getall'}, this.onLoad);
        // xFetch('aaaa');
    },
    componentDidMount: function() {
        this.loaddata();
    },
    onclickmap: function(lng, lat){
        console.log(lng, lat);
    },
    InitMap: function(map){
        this.setState({map: map});
    },
    
    render(){
        let id = this.props.id || "allmap";
        return (<BaiduMap gpsbar basebar
        id={id}
        onclickmap={this.onclickmap}
        InitMap={this.InitMap}
        ShowMe={this.loaddata}
        >
        </BaiduMap>);
    }
});


export default ShowDevice;