// walkpoints : point, circle, label( dis, lat, lng, time), marker

// point
// point Overlay text: position
var centerpoints = null;

// point
// point Overlay text: Head name six sign
// point circle
var headpoints = [];

// count
var headcount = 20;
var headcountBar = null;


var global_Interval_handle = NaN;
var global_Interval = 300; // 0.3 second
var global_Interval_LastNode = NaN;
var global_Interval_Node = 0;

function IntervalCore(){
    if (headpoints && headpoints.length > 0){
        if (!isNaN(global_Interval_LastNode) && global_Interval_LastNode < headpoints.length){
            var one = headpoints[global_Interval_LastNode];
            if (one && one.Overlay && one.Overlay._div){
                one.Overlay._div.onmouseout();
            }
        }
        if (global_Interval_Node < headpoints.length){
            var one = headpoints[global_Interval_Node];
            if (one && one.Overlay && one.Overlay._div){
                one.Overlay._div.onmouseover();
                global_Interval_LastNode = global_Interval_Node;
                global_Interval_Node = (global_Interval_Node + 1) % headpoints.length;
            }
        }
    }
}

function autoInterval(start){
    if (start){
        if (isNaN(global_Interval_handle)){
            global_Interval_handle = setInterval(IntervalCore, global_Interval)
        }
    } else {
        if (!isNaN(global_Interval_handle)){
            clearInterval(global_Interval_handle);
            global_Interval_handle = NaN;
        }
    }
    return !isNaN(global_Interval_handle);
}


function ClearPoints(points){
    for (var i = 0; i < points.length; i++){
        if (points[i]){
            base_RemoveTags(points[i].Overlay);
            base_RemoveTags(points[i].circle);
        }
        points[i] = null;
    }
}

function MakeOverlay(point, id, img, name, gender, sign){
    if (point === null){
        return null;
    }
    function ComplexCustomOverlay(point, id, img, name, gender, sign){
        this._point = point;
        this._id = id;
        this._img = img;
        this._name = name;
        this._gender = gender;
        this._sign = sign;
        this._map = null;
        this._div = null;
        this._zzz = 0;
    }
    ComplexCustomOverlay.prototype = new BMap.Overlay();
    ComplexCustomOverlay.prototype.initialize = function(map){
        this._map = map;
        var that = this;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
      div.style.zIndex = this._zzz = BMap.Overlay.getZIndex(this._point.lat);
      div.style.backgroundColor = "#EE5D5B";
      div.style.border = "1px solid #BC3B3A";
      div.style.color = "white";
      div.style.height = "30px";
      div.style.padding = "2px";
      div.style.lineHeight = "50px";
      div.style.whiteSpace = "nowrap";
      div.style.MozUserSelect = "none";
      div.style.fontSize = "12px";
    div.onclick = function(e){
        e.preventDefault();
        window.location.href="/name?id="+that._name;
    };
        var imgNode = document.createElement("img");
        imgNode.src = this._img;
        imgNode.alt = this._name;
        imgNode.style.width = "30px";
        imgNode.style.height = "30px";
        imgNode.style.zIndex = this._zzz + 1;

        div.appendChild(imgNode);


        var textNode = document.createElement("span");
        textNode.appendChild(document.createTextNode(""));
        div.appendChild(textNode);

        var arrow = this._arrow = document.createElement("div");
      arrow.style.background = "url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat";
      arrow.style.position = "absolute";
      arrow.style.width = "11px";
      arrow.style.height = "10px";
      arrow.style.top = "34px";
      arrow.style.left = "10px";
      arrow.style.overflow = "hidden";
      arrow.style.zIndex = this._zzz - 1;
      div.appendChild(arrow);

      div.onmouseover = function(){
        this.style.backgroundColor = "#6BADCA";
        this.style.borderColor = "#0000ff";
        this.getElementsByTagName("span")[0].innerHTML = that._name;

        arrow.style.backgroundPosition = "0px -20px";
        imgNode.style.width = "96px";
        imgNode.style.height = "96px";

        this.style.height = "96px";

        this.style.zIndex = 9999;
      }

      div.onmouseout = function(){
        this.style.backgroundColor = "#EE5D5B";
        this.style.borderColor = "#BC3B3A";
        this.getElementsByTagName("span")[0].innerHTML = "";

        arrow.style.backgroundPosition = "0px 0px";
        imgNode.style.width = "30px";
        imgNode.style.height = "30px";

        this.style.height = "30px";

        this.style.zIndex = that._zzz;
      }


      map.getPanes().labelPane.appendChild(div);

      return div;
    };
    ComplexCustomOverlay.prototype.draw = function(){
      var map = this._map;
      var pixel = map.pointToOverlayPixel(this._point);
      this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
      this._div.style.top  = pixel.y - 40 + "px";
    }

    return new ComplexCustomOverlay(point, id, img, name, gender, sign);
}


function DataToPoints(datas){
    var points = [];
    datas.forEach(function(element){
        var tmp = {
            point: null,
            Overlay: null,
            circle: null,
        };
        tmp.point = base_MakePoint(element["latitude"], element["longitude"]);
        tmp.Overlay = MakeOverlay(tmp.point,element["id"], element["img"], element["name"], element["gender"], element["sign"]);
        tmp.circle = base_MakeCircle(tmp.point, Number(element["distance"]));
        if (tmp.point){
            points.push(tmp);
        }
    }, this);
    return points;
}

function onShowHeadPoints(bShow){
    if (bShow){
        var points = [];
        headpoints.forEach(function(element) {
            base_AddTags(element.Overlay);
            points.push(element.point);
        }, this);
        base_auto_position(points);
    }
}



function RenewWalkPoint(datas){
    var points = DataToPoints(datas);
    if (points && points.length > 0){
        ClearPoints(headpoints);
        headpoints = points;
    }
}



// Base interface
function my_success_function(data) {
    console.log(data);
    RenewWalkPoint(data);
    onShowHeadPoints(true);
}


function my_error_function(data) {
    console.error(data);
    onShowHeadPoints(false);
}


// /near?latitude=22.809825&longitude=108.403313&count=20
function LoadWalkPoints(lat, lng) {
    var params = {};
    params["latitude"] = lat;
    params["longitude"] = lng;
    params["count"] = headcount;

    base_LoadWalkPoints("near", params, my_success_function, my_error_function);
}

function create_count_bar() {
    if (!my_global_map) {
        return;
    }

    function SliderControl() {
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 35);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    SliderControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    SliderControl.prototype.initialize = function (map) {

        // 创建一个DOM元素
        var inputS = document.createElement("input");
        inputS.type = "text";
        inputS.id = "CountHead";
        inputS.readOnly = true;
        var pS = document.createElement("p");
        pS.appendChild(inputS);


        var div = document.createElement("div");
        div.id = "slider-range";

        var total = document.createElement("div");
        total.appendChild(pS);
        total.appendChild(div);

        // 添加DOM元素到地图中
        map.getContainer().appendChild(total);
        // 将DOM元素返回
        return total;
    }
    // 创建控件
    var mySliderControl = new SliderControl();
    // 添加到地图当中
    return mySliderControl;
}

function InitCountBar() {
    headcountBar = create_count_bar();
    if (headcountBar) {
        base_add_control(headcountBar);
    }
    if (headcountBar) {
        $(function () {

            $("#slider-range").slider({

                range: "min",

                min: 1,

                max: 100,

                values: [headcount],

                slide: function (event, ui) {
                    headcount = ui.value;
                    $("#CountHead").val("#" + headcount);
                }
            });

            $("#CountHead").val("#" + headcount);
        });
    }
}

function onClickMap(e){
    centerpoints = {"lat": e.point.lat, "lng": e.point.lng};
    LoadWalkPoints(e.point.lat, e.point.lng);
}

function onload() {
    centerpoints = base_InitMap(onClickMap);
    InitCountBar();

    if (centerpoints){
        LoadWalkPoints(centerpoints.lat, centerpoints.lng);
    }
}

function ShowMe() {
    if (centerpoints) {
        LoadWalkPoints(centerpoints.lat, centerpoints.lng);
    }
}

function HiddenMe() {
    global_Interval_Node = 0;
    var stop = isNaN(global_Interval_handle);
    autoInterval(stop);
}
