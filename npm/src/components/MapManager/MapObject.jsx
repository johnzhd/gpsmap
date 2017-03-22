import React from 'react';
import BaseAPI from './BaiduMap/BaseAPI';
import BaiduMap from './BaiduMap/Basemap';


function MakeMapObject(){
    var ret = new Object();
    ret.gpsbar=false;
    ret.basebar=false;
    ret.onclickmap=null;
    ret.onGPSGo=null;
    ret.ShowMe=null;
    ret.AccessMe=null;

    ret.core= null;

    ret.InitMap = function(map){
        if (map){
            this.core = map;
        }
    }.bind(ret);

    ret.MyMap = function(){
        return this.core;
    }.bind(ret);

    ret.RecordNewLayout = function(layout){

    }.bind(ret);

    ret.RemoveNewLayout = function(layout){

    }.bind(ret);

    ret.ShowLayout = function(layout, show){
        if (show){
            BaseAPI.AddLayout(this.MyMap(), layout);
            this.RecordNewLayout(layout);
            return;
        }
        BaseAPI.ClearLayout(this.MyMap(), layout);
        this.RemoveNewLayout(layout);
    }.bind(ret);

    ret.ShowPoints= function(points, show, center){
        for (var one of points){
            if (!one.marker){
                continue;
            }
            this.ShowLayout(one.marker, show);
        }
        if (show && center){
            BaseAPI.CenterZoom(this.MyMap(), points);
        }
    }.bind(ret);

    ret.CenterZoom= function(lng, lat){
        let point = [{
            point: {lng: lng, lat:lat}
        }];
        BaseAPI.CenterZoom(this.MyMap(), point);
    }.bind(ret);

    ret.CenterPoints= function(points){
        BaseAPI.CenterZoom(this.MyMap(), points);
    }.bind(ret);

    ret.ShowCircle= function(points, show){
        for (var one of points){
            if (!one.circle){
                continue;
            }
            this.ShowLayout(one.circle, show);
        }
    }.bind(ret);

    ret.ClearAll= function(){
        BaseAPI.ClearLayouts(this.MyMap());
    }.bind(ret);


    ret.ReturnMapDOM= function(id){
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
        if (!id){
            id = "allmap";
        }

        return (<BaiduMap gpsbar={this.gpsbar} basebar={this.basebar}
        id={id}
        
        InitMap={this.InitMap}

        onclickmap={this.onclickmap}
        onGPSGo={this.onGPSGo}
        ShowMe={this.ShowMe}
        AccessMe={this.AccessMe}
        />);
    }.bind(ret);

    ret.CreatePoint= function(lng, lat, distance, label, id, onClick, onDrag){
        return BaseAPI.PointAPIs.CreatePoint(
                 lng,
                 lat,
                 distance,
                 label,
                 id,
                 onClick,
                 onDrag);
    }

    ret.DeletePoint= function(point){
        return BaseAPI.DeletePoint(this.MyMap(), point);
    }

    ret.CreateLinks = function(points){
        return BaseAPI.LinkPoints(points);
    }

    ret.SetLabel = function(point, label){
        return BaseAPI.PointAPIs.SetLabel(point, label);
    }

    ret.DragPoint = function(point, drag){
        return BaseAPI.PointAPIs.EnableDrag(point, drag);
    }

    ret.JumpPoint = function(point, jump){
        return BaseAPI.PointAPIs.EnableJump(point, jump);
    }

    ret.MovePoint = function(point, lng, lat, dis){
        return BaseAPI.PointAPIs.MovePoint(point, lng, lat, dis);
    }


    return ret;
};

export default MakeMapObject;
