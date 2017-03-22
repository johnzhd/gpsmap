import React from 'react'
import BaiduMap from './BaiduMap/Basemap'
import BaseMapAPI from './BaiduMap/BaseAPI'


const ShowMap = React.createClass({
    InitMap: function(map){
        this.setState({map: map});
    },

    onclickmap: function(lng, lat){
        console.log(lng, lat);
    },

    render(){
        let id = this.props.id || "allmap";
        let mapHolder = this.props.InitMap || this.InitMap;
        let clickHandle = this.props.onclickmap || this.onclickmap;
        return (<BaiduMap gpsbar basebar
        id={id}
        onclickmap={clickHandle}
        InitMap={mapHolder}
        >
        </BaiduMap>);
    }
});


export default ShowMap;