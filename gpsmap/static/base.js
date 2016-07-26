// 百度地图API功能

var my_global_map = null;


// ToDo Show gps when click on map
function base_showInfo(e) {
    console.log(e.point.lng + ", " + e.point.lat);
}

// Init map table
function base_InitMap(page){
    if (!my_global_map) {
        my_global_map = new BMap.Map("allmap");
    }
    my_global_map.addControl(new BMap.NavigationControl())
    my_global_map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
    my_global_map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
    my_global_map.addControl(new BMap.MapTypeControl());          //添加地图类型控件
    my_global_map.setMapStyle({ style: 'grayscale' });
    
    my_global_map.centerAndZoom(new BMap.Point(116.323862, 39.987064), 15);
    
    my_global_map.addEventListener("click", base_showInfo);

    var cr = new BMap.CopyrightControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT });   //设置版权控件位置
    my_global_map.addControl(cr); //添加版权控件

    var bs = my_global_map.getBounds();   //返回地图可视区域
    const style = 'background: rgb(255, 255, 255); padding: 2px 6px; text-align: center; color: rgb(0, 0, 0); line-height: 1.3em; font-family: arial,sans-serif; font-size: 12px; font-style: normal; font-variant: normal; border-top-color: rgb(139, 164, 220); border-bottom-color: rgb(139, 164, 220); border-left-color: rgb(139, 164, 220); border-top-width: 1px; border-bottom-width: 1px; border-left-width: 1px; border-top-style: solid; border-bottom-style: solid; border-left-style: solid; white-space: nowrap; font-size-adjust: none; font-stretch: normal; box-shadow: 2px 2px 3px rgba(0,0,0,0.35);';
    if (!page) {
        page = 'device';
    }
    cr.addCopyright({
        id: 1,
        content: '<div><a href="/name" ' + style + '\' >进入列表</a>'
            + '<input type="button" id="idShow" value="显示" onclick="ShowMe()"  style=\'' + style + '\' />'
            + '<input type="button" id="idHidden" value="辅助" onclick="HiddenMe()" style=\'' + style + '\' />'
            + '</div>',
        bounds: bs
    });
    console.log("Add");
}

// clear one point
function base_ClearPoint(p) {
    if (!p) {
        return;
    }
    if (p.marker) {
        my_global_map.removeOverlay(p.marker);
        p.marker = null;
    }
    if (p.circle) {
        my_global_map.removeOverlay(p.circle);
        p.circle = null;
    }
}

// clear points
function base_ClearPoints(points) {
    for (var i = 0; i < points.length; i++) {
        if (points[i]) {
            try{
                base_ClearPoint(points[i]);
            }
            catch (e) {
                console.log("base_ClearPoint: " + e.message);
            }
            points[i] = null;
        }
    }
    points = [];
}

// show points
function base_ShowPoints(points) {
    for (var i = 0; i < points.length; i++) {
        if (!points[i]) {
            continue;
        }
        try{
            if (points[i].marker) {
                my_global_map.addOverlay(points[i].marker);
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

function base_HiddenPoints(points) {
    for (var i = 0; i < points.length; i++) {
        if (!points[i]) {
            continue;
        }
        try {
            if (points[i].marker) {
                my_global_map.removeOverlay(points[i].marker);
            }
            if (points[i].circle) {
                my_global_map.removeOverlay(points[i].circle);
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

// show circle or not
function base_ShowCircle(points, bShow) {
    for (var i = 0; i < points.length; i++) {
        if (!points[i]) {
            continue;
        }
        try {
            if (points[i].marker) {
                if (bShow) {
                    my_global_map.addOverlay(points[i].circle);
                }
                else {
                    my_global_map.removeOverlay(points[i].circle);
                }
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

// create new point
function base_NewPoint(lat, lo, dis, label) {
    var ret = { point: null, circle: null, label: null, marker: null };
    if (lat && lo) {
        ret.point = new BMap.Point(lo, lat);

        if (dis) {
            ret.circle = new BMap.Circle(ret.point, dis);
        }

        ret.marker = new BMap.Marker(ret.point);

        if (label) {
            ret.label = label;
            ret.marker.setLabel(new BMap.Label(label, { offset: new BMap.Size(20, -10) }));
            ret.marker.addEventListener("click", base_showInfo);
        }
    }
    return ret;
}

// create points by datas
function base_DataToPoints(datas, func_makelabel) {
    // datas
    // [
    // { "latitude": 
    //   "longitude":
    //   "time":
    //   "distance":
    //   ...  careless
    // ]

    //points
    //[
    //    {point, circle, marker, label}
    //]
    points = [];
    for (var i = 0; i < datas.length; i++) {
        var label = func_makelabel(datas[i]);
        if (!label) {
            continue;
        }
        try{
            var dis = Number(datas[i]["distance"]);
            var p = base_NewPoint(datas[i]["latitude"], datas[i]["longitude"], dis, label);
            if (p.point){
                points.push(p);
            }

        }
        catch (e) {
            console.log(e.message);
        }
    }
    return points;
}



// create points by datas
function base_DataToPoints_device(datas, func_makelabel, click_func) {
    // datas
    // [
    // { "latitude": 
    //   "longitude":
    //   "time":
    //   "distance":
    //   ...  careless
    // ]

    //points
    //[
    //    {point, circle, marker, label}
    //]
    points = [];
    for (var i = 0; i < datas.length; i++) {
        var label = func_makelabel(datas[i]);
        if (!label) {
            continue;
        }
        try {
            var dis = Number(datas[i]["distance"]);
            var p = base_NewPoint(datas[i]["latitude"], datas[i]["longitude"], dis, label);
            if (p.point) {
                points.push(p);
                if (click_func) {
                    p.marker.addEventListener("click", function () { click_func(p); });
                }
            }

        }
        catch (e) {
            console.log(e.message);
        }
    }
    return points;
}


var clone = (function(){ 
    return function (obj) { Clone.prototype=obj; return new Clone() };
    function Clone(){}
}());


function base_DataToPoints_CountSame(datas, func_makeLabel) {
    var points = [];
    datas = datas.sort(function (a, b) {
        if (a["time"] > b["time"]) {
            return 1;
        } else if (a["time"] < b["time"]) {
            return -1;
        }
        return 0;
    });
    for (var i = 0; i < datas.length; i++) {
        try{
            var dis = datas[i]["distance"];
            var lat = datas[i]["latitude"];
            var lng = datas[i]["longitude"];
            var t = datas[i]["time"];
            if (!lat || !lng){
                continue;
            }
            var b = false;
            for (var j = 0; j < points.length; j++){
                if (points[j]["lat"] == lat && points[j]["lng"] == lng){
                    points[j]["count"]++;
                    if (points[j]["time"] < t){
                        points[j]["time"] = t;
                    }
                    b = true;
                    break;
                }
            }
            if (b){
                continue;
            }
            var tmp = {};
            for (var key in datas[i]){
                tmp[key] = datas[i][key];
            }
            tmp["count"] = 0;
            tmp["lat"] = lat;
            tmp["lng"] = lng;
            points.push(tmp);
        }
        catch (e) {
            console.log(e.message);
        }
    }
    for (var i =0;i < points.length; i++){
        var label = func_makeLabel(points[i]);
        var dis = Number(points[i]["distance"]);
        var p = base_NewPoint(points[i]["latitude"], points[i]["longitude"], dis, label);
        for (key in p){
            points[i][key] = p[key];
        }
    }

    return points;
}

function base_Label_Device(data) {
    // data
    // {"device", "time"}
    try {
        return "[" + data["device"] + "] " + data["time"];
    }
    catch (e) {
        console.log(data);
        console.log(e.message);
    }
    return "";
}

function base_Label_Calc(data) {
    // data
    // {"distance", "time"}
    try{
        return "(" + data["distance"] + ") " + data["time"];
    }
    catch (e) {
        console.log(data);
        console.log(e.message);
    }
    return "";
}

function base_CancelLink(lines) {
    // clear old lines
    for (var i = 0; i < lines.length; i++) {
        if (lines[i]) {
            try {
                lines[i].clearResults();
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}

function base_LinkPoints(lines, points) {
    base_CancelLink(lines);

    for (var i = 0; i < points.length - 1; i++) {
        if (lines.length < i + 1) {
            lines.push(new BMap.WalkingRoute(my_global_map, { renderOptions: { map: my_global_map, autoViewport: true } }));
        }
        lines[i].search(points[i], points[i + 1]);
    }
}


function base_GetUID() {
    return document.getElementById('uid').getAttribute('value');
}


function base_time_string_to_second(tstr) {
    return Date.parse(tstr.replace(/-/g, "/")) / 1000;
}

function base_time_second_to_string(second) {
    var d = new Date(second * 1000);
    return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}


function base_LoadWalkPoints(action, parameters, success_func, failed_func) {
    var params = {};
    for (var key in parameters) {
        params[key] = parameters[key];
    }
    $.ajax({
        url: "/" + action,
        data: params,
        type: "GET",
        dateType: "json",
        cache: false,
        success: function (d) {
            var data = null;
            if (typeof (d) == "string") {
                data = eval('(' + d + ')');
            }
            else {
                data = d;
            }
            if (data.success == 1 && data.data.length > 0) {
                if (success_func) {
                    success_func(data.data);
                }
            } else {
                if (failed_func) {
                    failed_func(data);
                }
                console.error(data);
                console.error('load ' + action + ' err');
            }
        }.bind(this),
        error: function (xhr, status, err) {
            if (failed_func) {
                failed_func(err);
            }
        }.bind(this)
    });
}


function base_add_control(control) {
    my_global_map.addControl(control);
}



function base_add_demo_control() {
    if (!my_global_map) {
        return;
    }
    //BMAP_ANCHOR_TOP_LEFT 控件将定位到地图的左上角。  
    //BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。  
    //BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。  
    //BMAP_ANCHOR_BOTTOM_RIGHT 控件将定位到地图的右下角。  

    // 定义一个控件类,即function
    function ZoomControl() {
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 30);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    ZoomControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    ZoomControl.prototype.initialize = function (map) {
        // 创建一个DOM元素
        var div = document.createElement("div");
        // 添加文字说明
        div.appendChild(document.createTextNode("放大2级"));
        // 设置样式
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        // 绑定事件,点击一次放大两级
        div.onclick = function (e) {
            my_global_map.setZoom(map.getZoom() + 2);
        }
        // 添加DOM元素到地图中
        my_global_map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
    }
    // 创建控件
    var myZoomCtrl = new ZoomControl();
    // 添加到地图当中
    my_global_map.addControl(myZoomCtrl);
}


function base_time_now_and_ten(){
    var d = new Date()
    var now = d.getTime() / 1000 + 3600;
    return now;
}

function base_time_now() {
    var d = new Date()
    var now = d.getTime() / 1000;
    return now;
}

function base_datas_to_time_limit(datas) {
    var min = null;
    for (var n in datas){
        if (!min || datas[n]["time"] < min){
            min = datas[n]["time"];
        }
    }
    time_min_second = base_time_string_to_second(min);
    time_max_second = base_time_now_and_ten();
}
