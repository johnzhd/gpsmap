// 百度地图API功能


var map = null;

var point = {
    One: { point: null, dis: 0.0, marker: null, circle: null },
    Two: { point: null, dis: 0.0, marker: null, circle: null },
    Three: { point: null, dis: 0.0, marker: null, circle: null },
    Result: { point: null, dis: 0.0, marker: null, circle: null }
};

var walkline = [];

function for_debug() {
    var parent = document.getElementById('One');
    if (parent) {
        parent.getElementsByClassName('latitude').item(0).value = 39.993587;
        parent.getElementsByClassName('longitude').item(0).value = 116.318221;
        parent.getElementsByClassName('distance').item(0).value = 600;
    }

    parent = document.getElementById('Two');
    if (parent) {
        parent.getElementsByClassName('latitude').item(0).value = 39.987562;
        parent.getElementsByClassName('longitude').item(0).value = 116.329431;
        parent.getElementsByClassName('distance').item(0).value = 700;
    }

    parent = document.getElementById('Three');
    if (parent) {
        parent.getElementsByClassName('latitude').item(0).value = 39.982697;
        parent.getElementsByClassName('longitude').item(0).value = 116.30895;
        parent.getElementsByClassName('distance').item(0).value = 1250;
    }
}

function onload() {
    if (!map) {
        map = new BMap.Map("halfmap");
    }
    map.addControl(new BMap.NavigationControl())
    map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
    map.addControl(new BMap.MapTypeControl());          //添加地图类型控件
    map.setMapStyle({ style: 'grayscale' });
    
    map.centerAndZoom(new BMap.Point(116.323862, 39.987064), 15);
    
    map.addEventListener("click", showInfo);

    for_debug();
}

function showInfo(e) {
    console.log(e.point.lng + ", " + e.point.lat);
}

function ShowCircle(name) {
    console.log('ShowCircle' + name);
    console.log('Change' + name);
    var parent = document.getElementById(name);
    if (parent) {
        var r = fretch_value(name);
        if (!r) {
            return;
        }
        renew_point(name, r[0], r[1], r[2]);
        console.log('Done');
    }
}

function HiddenCircle(name) {
    console.log('HiddenCircle' + name);
    if (point[name].circle) {
        map.removeOverlay(point[name.circle]);
    }
}

function deletePoint(name) {
    if (point[name].marker) {
        map.removeOverlay(point[name].marker);
        point[name].marker = null;
    }
    if (point[name].circle) {
        map.removeOverlay(point[name].circle);
        point[name].circle = null;
    }
    point[name].point = null;
    point[name].dis = 0.0;
}

function renew_point(name, lat, lo, dis) {
    deletePoint(name);
    point[name].distance = dis;
    point[name].point = new BMap.Point(lo, lat);
    point[name].marker = new BMap.Marker(point[name].point);
    point[name].circle = new BMap.Circle(point[name].point, point[name].distance);
    map.addOverlay(point[name].marker);
    map.addOverlay(point[name].circle);
    point[name].marker.setLabel(new BMap.Label(name + "\nlat: " + lat + ", lo: " + lo + ", R: " + dis, { offset: new BMap.Size(20, -10) }));

    // point[name].marker.addEventListener("click", getAttr);
    map.panTo(point[name].point);
}

function Change(name) {
    console.log('Change' + name);
    var parent = document.getElementById(name);
    if (parent) {
        var r = fretch_value(name);
        if (!r) {
            return;
        }
        deletePoint('Result');
        renew_point(name, r[0], r[1], r[2]);
        console.log('Done');
    }
}

function fretch_value(name) {
    var parent = document.getElementById(name);
    if (parent) {

        var lat = parent.getElementsByClassName('latitude').item(0).value;
        var long = parent.getElementsByClassName('longitude').item(0).value;
        var dis = parent.getElementsByClassName('distance').item(0).value;
        if (!lat || !long || !dis) {
            return null;
        }
        lat = parseFloat(lat);
        long = parseFloat(long);
        dis = parseFloat(dis);
        if (isNaN(lat) || isNaN(long) || isNaN(dis)) {
            return null;
        }
        return [lat, long, dis];
    }
    return null;
}

function fretch_EP(){
    var EP = document.getElementById('EP').value;
    if (EP && parseFloat(EP)) {
        return parseFloat(EP);
    }
    return 100;
}


function Calc() {
    console.log('Calc_net');
    var url = '/calc?';
    
    var r = fretch_value('One');
    if (!r) {
        console.log('One params err.');
        return;
    }
    url += 'la1=' + r[0] + '&lo1=' + r[1] + '&d1=' + r[2];
    r = fretch_value('Two');
    if (!r) {
        console.log('Two params err.');
        return;
    }
    url += '&la2=' + r[0] + '&lo2=' + r[1] + '&d2=' + r[2];
    r = fretch_value('Three');
    if (!r) {
        console.log('Three params err.');
        return;
    }
    url += '&la3=' + r[0] + '&lo3=' + r[1] + '&d3=' + r[2];

    var EP = document.getElementById('EP').value;
    if (EP && parseFloat(EP)) {
        url += '&EP=' + parseFloat(EP);
    }

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data) {
            console.log(data);
            if (data.success && data.la && data.lo) {
                renew_point('Result', data.la, data.lo, data.dis);
            }
            else {
                console.error('Calc err');
            }
        }.bind(this),
        error: function (xhr, status, err) {
            console.error('Calc ajax err: ' + err);
        }.bind(this)
    });
}


function walkline() {

    if (!map) {
        return;
    }

    if (!point.One.point && !point.Two.point) {
        return;
    }

    var myP1 = point.One.point;
    var myP2 = point.Two.point;
    var myP3 = point.Three.point;
    var myIcon = new BMap.Icon("http://developer.baidu.com/map/jsdemo/img/Mario.png", new BMap.Size(32, 70), {    //小车图片
        //offset: new BMap.Size(0, -5),    //相当于CSS精灵
        imageOffset: new BMap.Size(0, 0)    //图片的偏移量。为了是图片底部中心对准坐标点。
    });

    var driving2 = new BMap.DrivingRoute(map, { renderOptions: { map: map, autoViewport: true } });    //驾车实例
    driving2.search(myP1, myP2, {waypoints:null} );    //显示一条公交线路

}

function line() {
    var pList = [];
    if (point.One.point) {
        pList.push(point.One.point);
    }
    if (point.Two.point) {
        pList.push(point.Two.point);
    }
    if (point.Three.point) {
        pList.push(point.Three.point);
    }
    console.log(pList);
    RenewWalkList(pList)
}

function RenewWalkLine(pStart, pEnd, pList)
{
    if (!walkline) {
        walkline = new BMap.WalkingRoute(map, { renderOptions: { map: map, autoViewport: true } });    //驾车实例
    }
    if (pStart && pEnd) {
        walkline.search(pStart, pEnd, pList);
    }
    else {
        walkline = null
    }
}

function RenewWalkList(pList)
{
    for (var i = 0; i < walkline.length; i++) {
        if (walkline[i]) {
            walkline[i].clearResults();
        }
    }

    for (var i = 0; i < pList.length-1; i++) {
        if (walkline.length < i + 1 ) {
            walkline.push(new BMap.WalkingRoute(map, { renderOptions: { map: map, autoViewport: true } }))
        }
        var r = walkline[i].search(pList[i], pList[i + 1]);
    }
}


