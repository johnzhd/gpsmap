import BasePoint from './BasePoint';

function BaseCurveLines(points){
    var purlPoint = [];
    points.forEach(function(element) {
        purlPoint.push(element.point);
    }, this);
        
    var line = new BMapLib.CurveLine(purlPoint, {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});
    return line;
}

function ClearLayout(map, layout){
    if (!layout || !map){
        return;
    }
    try{
        map.removeOverlay(layout);
    } catch(e){
        console.log(e);
    }
}

function AddLayout(map, layout){
    if (!layout || !map){
        return;
    }
    try{
        map.addOverlay(layout);
    } catch(e){
        console.log(e);
    }
}

function CenterZoom(map, points){
    if (!points || !map){
        return;
    }
    if (points.length == 1){
        var zoom = map.getZoom();
        map.centerAndZoom(new BMap.Point(points[0].point.lng, points[0].point.lat), zoom);
        return;
    }
    var tmp = [];
    for (var one of points){
        if (!one || !one.point){
            continue;
        }
        tmp.push(one.point);
    }
    map.setViewport(tmp);
}

function ClearLayouts(map){
    if (!map){
        return;
    }
    map.clearOverlays();
}

const eventNames = ["click", "dblclick", "rightclick", "rightdblclick"];
function RegisterEvent(map, event, func){
    if (-1 == eventNames.indexOf(event)){
        return false;
    }
    if (func){
        map.addEventListener(event, func);
        return true;
    }
    map.removeEventListener(event);
    return true;
}

function LinkPoints(points){
    var links = [];
    for (var one of points){
        if (!one || !one.point){
            continue;
        }
        links.push(one.point);
    }
    if (links && links.length > 0){
        var line = new BMapLib.CurveLine(links, {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});
        return line;
    }
    return null;
}

function DeletePoint(map, point){
    if (!point || !point.marker){
        return;
    }
    
    if (point.fordelete_click){
        point.marker.removeEventListener('click', point.fordelete_click);
    }
    if (point.fordelete_drag){
        point.marker.removeEventListener('dragend', point.fordelete_drag);
    }
    if (map){
        if (point.cilcle){
            ClearLayout(map, point.cilcle);
        }
        ClearLayout(map, point.marker);
    }
}

const BaseMapAPI = {
    PointAPIs: BasePoint,
    ClearLayout: ClearLayout,
    ClearLayouts: ClearLayouts,
    AddLayout: AddLayout,
    CurveLines: BaseCurveLines,
    CenterZoom: CenterZoom,

    LinkPoints: LinkPoints,
    DeletePoint: DeletePoint,
}

export default BaseMapAPI;