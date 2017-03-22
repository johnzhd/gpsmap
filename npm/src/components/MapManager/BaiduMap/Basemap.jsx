import styles from'./Basemap.less'
import React from 'react'
import $ from 'jquery'
import baseControl from './BaseControl'
import baseGPSCenterBar from './BaseGPSCenterBar'


let BaiduMap = React.createClass({
    getInitialState(){
        return {
            map: null,
            rule: null,
            clear_logo_handle: NaN
        }
    },
    componentDidMount() {
        var thismap = this.createBMap();
        if (thismap){
            this.setState({
            map: thismap
            });
            if (this.props.InitMap){
                this.props.InitMap(thismap);
            }
        }
        
        this.start_clear_logo();
    },
    start_clear_logo(){
        if (!isNaN(this.state.clear_logo_handle)){
            return;
        }
        var handle = setInterval(this.clearLogo, 500);
        this.setState({clear_logo_handle: handle});
    },

    stop_clear_logo(){
        if (!isNaN(this.state.clear_logo_handle)){
            clearInterval(this.state.clear_logo_handle);
            this.setState({clear_logo_handle: NaN});
        };
    },

    clearLogo(){
        this.stop_clear_logo();
        try{
            var one = $('.anchorBL');
            if (one){
                one.remove();
            }
            if (one.length == 0){
                this.stop_clear_logo();
            }
        }
        catch(e)
        {
            console.log(e);
        }
    },

    ShowMe(){
        if (this.props.ShowMe){
            this.props.ShowMe();
        }
    },

    AccessMe(){
        if (this.props.AccessMe){
            this.props.AccessMe();
        }
    },

    clickonMap(e){
        console.log(e.point.lng + ", " + e.point.lat);
        try{
            $("#idLongitude").val(e.point.lng);
            $("#idLatitude").val(e.point.lat);
        }
        catch(e){
        }

        if (this.props.onclickmap){
            this.props.onclickmap(e.point.lng, e.point.lat);
        }
    },

    startrule(){
        if (this.state.rule){
           this.state.rule.open();
        }
    },
    
    createGlobalControl(map){
        // && this.props.rule
        if (!this.state.rule ){
            var rule = new BMapLib.DistanceTool(map);
            this.setState({rule: rule});
        }
    },

    createBaseControl(map){
        this.createGlobalControl(map);
        
        var bar = [];
        if (this.props.basebar !== undefined && this.props.basebar !== false){
            let tmp = baseControl(this.ShowMe, this.AccessMe, this.startrule);
            bar.push(tmp);
        }

        if (this.props.gpsbar !== undefined  && this.props.gpsbar !== false){
            let tmp = baseGPSCenterBar(this.clickOnGoButton);
            bar.push(tmp);
        }
        return bar;
    },

    createBMap(){
        var id = this.props.id || "allmap";
        var lng = this.props.lng || 108.372686;
        var lat = this.props.lat || 22.823824;
        var level = this.props.level || 15;

        let  onemap = new BMap.Map(id, {enableMapClick:false});
        let  point = new BMap.Point(lng, lat);
        onemap.addControl(new BMap.NavigationControl());
        onemap.enableScrollWheelZoom();
        onemap.enableContinuousZoom();
        onemap.addControl(new BMap.MapTypeControl());
        onemap.setMapStyle({ style: 'grayscale', features: ["point"] });
        onemap.highResolutionEnabled();

        onemap.centerAndZoom(point, level);

        onemap.addEventListener("click", this.clickonMap);

        var control = this.createBaseControl(onemap);
        for (var one of control){
            if (!one){
                continue;
            }
            onemap.addControl(one);
        }
        return onemap;
    },

    centerByPoints(points){
        var thismap = this.state.map;
        if (!points || !thismap){
            return;
        }
        if (points.length == 1){
            var zoom = thismap.getZoom();
            thismap.centerAndZoom(new BMap.Point(points[0].lng, points[0].lat), zoom);
            return;
        }
        thismap.setViewport(points);
    },


    clickOnGoButton() {
        try{
            var lng = $("#idLongitude").val();
            var lat = $("#idLatitude").val();

            lng = Number(lng);
            lat = Number(lat);

            if ( isNaN(lng) || isNaN(lat) 
                || lng > 180 || lng < -180
                || lat > 90 || lat < -90
                ){
                return;
            }


            if (this.props.onGPSGo){
                this.props.onGPSGo(lng, lat);
            }

            let points = [];
            points.push({lat:lat, lng:lng});
            this.centerByPoints(points);
        }
        catch(e){
        }
    },

    render(){
        return (<div className={styles.allmap} id={this.props.id}></div>);
    }
});

BaiduMap.propTypes = {
    id: React.PropTypes.string
};


// basebar
// gpsbar
// onclickmap(lng, lat)
// onGPSGo(lng, lat)
// id = dom id
// lng = center lng
// lat = center lat
// level = center level
// ShowMe = click on  显示
// AccessMe = click on 辅助
// InitMap = after init map deliver BMap object
export default BaiduMap;