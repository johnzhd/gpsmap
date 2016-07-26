// walkpoints : point, circle, label( dis, lat, lng, time), marker

var walkpoints = [];

function onShowWalkPoints(bShow) {
    if (bShow) {
        base_ShowPoints(walkpoints);
    }
    else {
        base_HiddenPoints(walkpoints);
    }
}


function onShowWalkZone(bShow) {
    base_ShowCircle(walkpoints, bShow);
}


function RenewWalkPoint(datas) {
    var points = base_DataToPoints(datas, base_Label_Calc);
    if (points) {
        base_ClearPoints(walkpoints);

        walkpoints = points;
    }
}
// Base interface

var my_g_uid = null;
var b_with_line = true;

var time_uint = null;
var time_start = null;
var time_end = null;

var time_min_second = null;
var time_max_second = null;

var time_bar = null;

function my_success_function(data) {
    // ShowName

    if (!time_bar) {
        base_datas_to_time_limit(data);
        InitTimeBar();
    }

    RenewWalkPoint(data);
    onShowWalkPoints(true);
    onShowWalkZone(b_with_line);
}


function my_error_function(data) {
    // ShowName
    b_with_line = false;
    onShowWalkPoints(false);
    onShowWalkZone(false);
}



function LoadWalkPoints(id) {
    var params = {};
    params["id"] = id;
    if (time_start) {
        params["start"] = time_start;
    }
    if (time_end) {
        params["end"] = time_end;
    }

    base_LoadWalkPoints("origin", params, my_success_function, my_error_function);
}

function create_time_start_end() {
    if (!my_global_map) {
        return;
    }

    function SliderControl() {
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 30);
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    SliderControl.prototype = new BMap.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    SliderControl.prototype.initialize = function (map) {

        // 创建一个DOM元素
        var inputS = document.createElement("input");
        inputS.type = "text";
        inputS.id = "timeStart";
        inputS.readOnly = true;
        var pS = document.createElement("p");
        pS.appendChild(inputS);
        var inputE = document.createElement("input");
        inputE.type = "text";
        inputE.id = "timeEnd";
        inputE.readOnly = true;
        var pE = document.createElement("p");
        pE.appendChild(inputE);

        //var p = document.createElement("p");
        //p.appendChild(inputS);
        //p.appendChild(inputE);


        var div = document.createElement("div");
        div.id = "slider-range";

        var total = document.createElement("div");
        total.appendChild(pS);
        total.appendChild(pE);
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

function InitTimeBar() {
    time_bar = create_time_start_end();
    if (time_bar) {
        base_add_control(time_bar);
    }
    if (time_bar) {
        $(function () {

            $("#slider-range").slider({

                range: true,

                min: time_min_second,

                max: time_max_second,

                values: [time_min_second, base_time_now()],

                slide: function (event, ui) {
                    time_start = base_time_second_to_string(ui.values[0]);
                    time_end = base_time_second_to_string(ui.values[1]);
                    $("#timeStart").val("#" + time_start);
                    $("#timeEnd").val("#" + time_end);
                }
            });

            $("#timeStart").val("#" + base_time_second_to_string($("#slider-range").slider("values", 0)));
            $("#timeEnd").val("#" + base_time_second_to_string($("#slider-range").slider("values", 1)));
            time_start = base_time_second_to_string(time_min_second);
            time_end = base_time_second_to_string(base_time_now());
        });
    }
}

function onload() {
    base_InitMap();
    my_g_uid = base_GetUID();

    time_bar = null;

    LoadWalkPoints(my_g_uid);
}

function ShowMe() {
    if (my_g_uid) {
        LoadWalkPoints(my_g_uid);
    }
}

function HiddenMe() {
    b_with_line = !b_with_line;
    onShowWalkZone(b_with_line);
}
