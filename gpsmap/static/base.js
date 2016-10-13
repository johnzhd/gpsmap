// 百度地图API功能

var my_global_map = null;
var my_global_rule = null;
var global_tools = null;

// ToDo Show gps when click on map
function base_showInfo(e) {
    console.log(e.point.lng + ", " + e.point.lat);
}

function ClickRule(){
    if (!my_global_rule){
        return ;
    }
    my_global_rule.open();
}

function base_create_base_bar(){
    function BaseBarControl() {
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 5);
    }
    BaseBarControl.prototype = new BMap.Control();
    BaseBarControl.prototype.initialize = function (map) {
        var a1 = document.createElement("a");
        a1.href = "/name";
        a1.id = "ida";
        a1.innerHTML ="首页";
        var input1 = document.createElement("input");
        input1.type = "button";
        input1.id = "idShow";
        input1.value="显示";
        input1.onclick=function(event){ShowMe();};
        var input2 = document.createElement("input");
        input2.type = "button";
        input2.id = "idHidden";
        input2.value="辅助";
        input2.onclick=function(event){HiddenMe();};
        var input3 = document.createElement("input");
        input3.type = "button";
        input3.id = "idRule";
        input3.value="测距";
        input3.onclick=function(event){ClickRule();};

        var total = document.createElement("div");
        total.appendChild(a1);
        total.appendChild(input1);
        total.appendChild(input2);
        total.appendChild(input3);
        map.getContainer().appendChild(total);
        // 将DOM元素返回
        return total;
    };
    var myBaseBarControl = new BaseBarControl();
    return myBaseBarControl;
}

function base_basecontrol(mymap){
    if (global_tools){
        return;
    }
    global_tools = base_create_base_bar();
    mymap.addControl(global_tools);

    console.log("Add");
    return;
}

function base_GetMap(){
    return my_global_map;
}

// Init map table
function base_InitMap(clickfunc){
    if (!my_global_map) {
        my_global_map = new BMap.Map("allmap");
    }
    var lat = 22.823824;
    var lng = 108.372686;
    my_global_map.addControl(new BMap.NavigationControl())
    my_global_map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
    my_global_map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
    my_global_map.addControl(new BMap.MapTypeControl());          //添加地图类型控件
    my_global_map.setMapStyle({ style: 'grayscale' });

    my_global_map.centerAndZoom(new BMap.Point(108.372686, 22.823824), 15);
    //my_global_map.centerAndZoom("南宁市", 15);
    if (!clickfunc){
        clickfunc = base_showInfo
    }
    my_global_map.addEventListener("click", clickfunc);
    my_global_rule = new BMapLib.DistanceTool(my_global_map);
    base_basecontrol(my_global_map);
    return {"lat": lat, "lng": lng}
}

function base_auto_position(points){
    my_global_map.setViewport(points);
}

// clear one point
function base_ClearPoint(p) {
    if (!p) {
        return;
    }
    base_RemoveTags(p.marker);
    p.marker = null;
    base_RemoveTags(p.circle);
    p.circle = null;
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
function base_ShowPoints(points, last, jump) {
    var po_list = Array();
    var tail = null;
    for (var i = 0; i < points.length; i++) {
        if (!points[i]) {
            continue;
        }
        try{
            if (points[i].marker) {
                if (!last){
                    po_list.push(points[i].point);
                }
                tail = points[i];
                base_AddTags(points[i].marker);
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
    if (tail){
        if (jump){
            tail.marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        }
        po_list.push(tail.point);
    }
    base_auto_position(po_list);
}

function base_AddTags(tag){
    if (tag){
        try {
            my_global_map.addOverlay(tag);
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

function base_RemoveTags(tag){
    if (tag){
        try {
            my_global_map.removeOverlay(tag);
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
        base_RemoveTags(points[i].marker);
        base_RemoveTags(points[i].circle);
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
                    base_AddTags(points[i].circle);
                }
                else {
                    base_RemoveTags(points[i].circle);
                }
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

function base_MakePoint(lat, lng){
    if (lat && lng){
        return new BMap.Point(lng, lat);
    }
    return null;
}

function base_MakeCircle(point, dis){
    if (point !== null && !isNaN(dis) ){
        return new BMap.Circle(point, dis);
    }
    return null;
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
    var myMap = new Map();
    datas.forEach(function(element) {
        try{
        var mark = element["latitude"].toString() + "," + element["longitude"].toString();
        var one = myMap.get(mark);
        if (!one || one["time"] < element["time"]){
            myMap.set(mark, element);
        }
        }catch(e){
            console.log(e.message);
        }
        
    }, this);

    var tmp = [];
    for (var value of myMap.values()){
        tmp.push(value);
    }
    tmp.sort(function(a,b){
        if (a["time"] == b["time"]){
            return 0;
        }
        return  a["time"] < b["time"] ? -1 : 1;
    });
    var points = [];

    var i = 0;
    for (var value of tmp){
        i++;
        try{
            var label = func_makelabel(value, i);
            var dis = Number(value["distance"]);
            var p = base_NewPoint(value["latitude"], value["longitude"], dis, label);
            if (p.point){
                points.push(p);
            }
        }
        catch(e){
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

function base_Label_Device(data, i) {
    // data
    // {"device", "time"}
    try {
        return data["device"];
    }
    catch (e) {
        console.log(data);
        console.log(e.message);
    }
    return "";
}

function base_Label_Calc(data, i) {
    // data
    // {"distance", "time"}
    try{
        return "(" + i.toString() + "): [" + data["distance"] + "] " + data["time"];
    }
    catch (e) {
        console.log(data);
        console.log(e.message);
    }
    return "";
}

function walklines(lines, points, bShow){
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
    if (bShow){
        for (var i = 0; i < points.length - 1; i++) {
            if (lines.length < i + 1) {
                lines.push(new BMap.WalkingRoute(my_global_map, { renderOptions: { map: my_global_map, autoViewport: true } }));
            }
            lines[i].search(points[i], points[i + 1]);
        }
    }
}

function curveLines(lines, points, bShow){
    if (lines && lines.length > 0){
        base_RemoveTags(lines[0]);
        lines[0] = null;
    }
    if (bShow){
        var purlPoint = [];
        points.forEach(function(element) {
            purlPoint.push(element.point);
        }, this);
        
        var line = new BMapLib.CurveLine(purlPoint, {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});
        base_AddTags(line);
        if (lines.length == 0){
            lines.push(line);
        } else{
            lines[0] = line;
        }
    }
}

const linesEnter = curveLines;

function base_CancelLink(lines) {
    linesEnter(lines, null, false);
}

function base_LinkPoints(lines, points) {
    linesEnter(lines, points, true);
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
