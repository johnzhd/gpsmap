// device points
// settings

var enum_page = Object.freeze({
    "show":1,
    "point":2,
    "move":3,
    "network":4 //lock
});

var enum_button = Object.freeze({
    "normal":1,
    "high":2,
    "disable":3,
    "disablehigh":4
});

var click_avoid = 0;

var page_status = enum_page.show;
var page_sync = false;

// point {point: {lng, lat}, mark: BMap.Marker}
var device_points = [];

function make_device_points_key(lat, lng){
    return lat + "," + lng;
}


function dragPoint(e, point){
    page_sync = true;
    point.point.lat = e.point.lat;
    point.point.lng = e.point.lng;
}

function loopPoint(enter){
    for (var no in device_points){
        if (enter(no, device_points[no])){
            break;
        }
    }
}


function moveablePoint(b){
    var enter = function(no, one){
            if (!one || !one.marker){
                return false;
            }
            one.marker.disableDragging();
            return false;
        };
    if (b){
        enter = function(no, one){
            if (!one || !one.marker){
                return false;
            }
            one.marker.enableDragging();
            return false;
        };
    }
    loopPoint(enter);
}

function NothingFunction(lat, lng, point){
    console.log(lat,lng, point);
}

function DeletePoint(lat, lng, point){
    var two = point;
    if (!two || !two.point || !two.point.lat || !two.point.lng){
        return ;
    }
    
    page_sync = true;
    var enter = function(no, one){
        if (!one){
            return false;
        }
        if (!one.marker){
            device_points[no] = null;
            return false;
        }
        if (!one.point){
            base_RemoveTags(one.marker);
            device_points[no] = null;
            return false;
        }
        if (one.point.lat == two.point.lat && one.point.lng == two.point.lng){
            base_RemoveTags(one.marker);
            device_points[no] = null;
            return true;
        }
        return false;
    }
    loopPoint(enter);
}


function CreatePoint(lat, lng, name){
    var tmp = {"point": {"lat": lat, "lng": lng}, "marker": null, "name": name};
        tmp.marker = new BMap.Marker(new BMap.Point(tmp.point.lng, tmp.point.lat));
        tmp.marker.addEventListener("dragend", function(e){
            dragPoint(e, tmp);
        });
        tmp.marker.addEventListener("click", function(e){
            clickOnPoint(e, tmp);
        });
        tmp.marker.setLabel(new BMap.Label(tmp.name,{offset:new BMap.Size(20,-10)}));
    return tmp;
}

function AddPoint(lat, lng, point){
    var tmp = CreatePoint(lat, lng, "NEW!");
    if (tmp){
        page_sync = true;
        device_points.push(tmp);
        base_AddTags(tmp.marker);
    }
}

function ShowAllPoint(){
    var point_list = Array();
    for (var key in device_points){
        var one = device_points[key];
        if (!one || !one.marker){
            continue;
        }
        base_AddTags(one.marker);
        if (one.point){
            point_list.push(one.point);
        }
    }
    base_auto_position(point_list);
}

function HideAllPoint(){
    for (var key in device_points){
        var one = device_points[key];
        if (!one || !one.marker){
            continue;
        }
        base_RemoveTags(one.marker);
    }
}

function DeleteAllPoint(){
    var enter = function(no, one){
        if (!one){
            return false;
        }
        if (one.marker){
            base_RemoveTags(one.marker);
        }
        device_points[no] = null;
        return false;
    }

    loopPoint(enter);
    device_points = [];
}


function CreateAllPoint(data){
    if (!data || data.length == 0){
        device_points = [];
        return;
    }
    data.sort(function(a,b){
        if (!a && !b){
            return 0;
        }
        if (!a || !a["time"]){
            return -1;
        }
        if (!b || !b["time"]){
            return 1;
        }
        if (a["time"] == b["time"]){
            return 0;
        }
        return a["time"]<b["time"] ? -1: 1;
    });

    var tmpList = [];
    for (var no in data){
        var one = data[no];
        if (!one){
            continue;
        }
        if (!one["latitude"] || !one["longitude"]){
            continue;
        }
        var tmp = CreatePoint(one["latitude"], one["longitude"], one["device"]);
        tmpList.push(tmp);
        tmp = null;
    }
    device_points = tmpList;
}

var clickPointCore = NothingFunction;
function clickOnPoint(e, point){
    if (clickPointCore){
        clickPointCore(e.point.lat, e.point.lng, point);
    }
    console.log("point", e.point.lat, e.point.lng, point.point.lat, point.point.lng);
    click_avoid = 1;
}
var clickMapCore = NothingFunction;
function clickOnMap(e){
    if (click_avoid){
        click_avoid = 0;
        return;
    }
    if (clickMapCore){
        clickMapCore(e.point.lat, e.point.lng, null);
    }
    console.log("map", e.point.lat, e.point.lng);
}


function PopupTips(message, descirbe){

}

function loadall(){
    $.ajax({
        url: '/device',
        type: 'GET',
        data: { 'action': 'getall' },
        dateType: 'json',
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
                loaddeviceSuccess(data.data);
            } else {
                loaddeviceFailed('load device err');
            }
        }.bind(this),
        error: function (xhr, status, err) {
            loaddeviceFailed(err.toString());
        }.bind(this)
    });
}

function UploadAll(){
    var data = [];
    loopPoint(function(no, one){
        if (!one || !one.point || !one.point.lat || !one.point.lng ){
            return false;
        }
        data.push({"latitude": one.point.lat,
         "longitude": one.point.lng,
         "device": one.name});
    });
    $.ajax({
        url: '/device',
        type: 'POST',
        data: { 'action': 'setall',
                'data': JSON.stringify(data),
                'task': "node" },
        dateType: 'json',
        cache: false,
        success: function (d) {
            var data = null;
            if (typeof (d) == "string") {
                data = eval('(' + d + ')');
            }
            else {
                data = d;
            }
            if (data.success == 1) {
                UploaddeviceSuccess(data.data);
            } else {
                UploaddeviceFailed('load device err');
            }
        }.bind(this),
        error: function (xhr, status, err) {
            UploaddeviceFailed(err.toString());
        }.bind(this)
    });
}

function loaddevice(){
    ActionButtonByStatus(enum_page.network);
    loadall();
    PrintButtonByStatus(enum_page.network);
}

function loaddeviceSuccess(data){
    DeleteAllPoint();
    CreateAllPoint(data);
    ShowAllPoint();
    page_sync = false;
    ActionButtonByStatus(enum_page.show);
    PrintButtonByStatus(enum_page.show);
}

function loaddeviceFailed(err){
    console.error(err);
    DeleteAllPoint();
    PopupTips('无数据', '找不到目标数据集');

    ActionButtonByStatus(enum_page.show);
    PrintButtonByStatus(enum_page.show);
}

function Uploaddevice(){
    // translate device_points into data
    // upload data into server
    
    ActionButtonByStatus(enum_page.network);
    UploadAll();
    PrintButtonByStatus(enum_page.network);
}

function UploaddeviceSuccess(data){
    //
    if (!data || data.length < 1){
        PopupTips('设定成功', '服务器接受新设置点，请手动刷新');
    } else {
        DeleteAllPoint();
        CreateAllPoint(data);
        ShowAllPoint();
    }
    
    page_sync = false;
    ActionButtonByStatus(enum_page.show);
    PrintButtonByStatus(enum_page.show);
}

function UploaddeviceFailed(err){
    PopupTips('失败', '服务器拒绝，或网络异常，请手动刷新');

    ActionButtonByStatus(enum_page.show);
    PrintButtonByStatus(enum_page.show);
}

var button_name = ["增减设备","数量确认",
"移动设备","位置确认",
"更新设备","同步上传","同步中",
"放弃/刷新","显示"];

function create_control_button(){
    function ButtonControl(){
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 35);
    }

    ButtonControl.prototype = new BMap.Control();

    ButtonControl.prototype.initialize = function(map){
        var button1 = document.createElement("input");
        button1.type = "button";
        button1.value = button_name[0];
        button1.id = "idCount";
        var button2 = document.createElement("input");
        button2.type = "button";
        button2.value = button_name[2];
        button2.id = "idPostion";
        var button3 = document.createElement("input");
        button3.type = "button";
        button3.value = button_name[4];
        button3.id = "idUpload";
        button3.disabled = "disabled";

        var total = document.createElement("div");
        total.appendChild(button1);
        total.appendChild(button2);
        total.appendChild(button3);

        map.getContainer().appendChild(total);
        return total;
    };
    var myButtonControl = new ButtonControl();
    return myButtonControl;
}

function ActionButtonByStatus(newStatus){
    if (newStatus == page_status){
        return;
    }
    // clear old status
    switch(page_status){
        case enum_page.show:
        // nothing
        break;
        case enum_page.point:
        // nothing
        clickPointCore = NothingFunction;
        clickMapCore = NothingFunction;
        break;
        case enum_page.move:
        moveablePoint(false);
        break;
        case enum_page.network:
        // nothing
        break;
    }
    // start new status
    switch(newStatus){
        case enum_page.show:
        break;
        case enum_page.point:
        // set point click delete
        clickPointCore = DeletePoint;
        clickMapCore = AddPoint;
        break;
        case enum_page.move:
        moveablePoint(true);
        break;
        case enum_page.network:
        // nothing
        break;
    }
    page_status = newStatus;
}

function PrintButtonColor(id, status, value){
    var one = $("#"+id);
    if (!one){
        return;
    }
    one.val(value);
    switch(status){
        case enum_button.normal:
            one.css("backgroundColor", "white");
            one.css("color", "black");
            one.removeAttr("disabled"); 
        break;
        case enum_button.high:
            one.css("backgroundColor", "#2db7f5");
            one.css("color", "white");
            one.removeAttr("disabled"); 
        break;
        case enum_button.disable:
            one.css("backgroundColor", "white");
            one.css("color", "black");
            one.attr("disabled", "disabled");
        break;
        case enum_button.disablehigh:
            one.css("backgroundColor", "#2db7f5");
            one.css("color", "white");
            one.attr("disabled", "disabled");
        break;
    }
}

function PrintButtonByStatus(newStatus){
    switch(newStatus){
    case enum_page.show:
        PrintButtonColor("idCount", enum_button.normal, button_name[0]);
        PrintButtonColor("idPostion", enum_button.normal, button_name[2]);
        if (page_sync){
            PrintButtonColor("idUpload", enum_button.normal, button_name[5]);
        }else{
            PrintButtonColor("idUpload",
                enum_button.disable,
            button_name[4]);
        }
        
        break;
    case enum_page.point:
        PrintButtonColor("idCount", enum_button.high, button_name[1]);
        PrintButtonColor("idPostion", enum_button.normal,  button_name[2]);
        PrintButtonColor("idUpload", enum_button.disable, button_name[(page_sync?5:4)]);
        break;
    case enum_page.move:
        PrintButtonColor("idCount", enum_button.normal, button_name[0]);
        PrintButtonColor("idPostion", enum_button.high, button_name[3]);
        PrintButtonColor("idUpload", enum_button.disable, button_name[(page_sync?5:4)]);
        break;
    case enum_page.network:
        PrintButtonColor("idCount", enum_button.disable, button_name[0]);
        PrintButtonColor("idPostion", enum_button.disable, button_name[2]);
        PrintButtonColor("idUpload", enum_button.disablehigh, button_name[6]);
        break;
    }
    if (page_sync){
        PrintButtonColor("idShow", enum_button.normal, button_name[7]);
    }
    else {
        PrintButtonColor("idShow", enum_button.normal, button_name[8]);
    }
}

function updateControlByStatus(newStatus){
    ActionButtonByStatus(newStatus);
    PrintButtonByStatus(page_status);
}


function InitPointControl(){
    var bar = create_control_button();
    if (!bar){
        return ;
    }
    base_add_control(bar);
    $(function (){
        var one = $("#idCount");
        one.click(function (){
            if (page_status == enum_page.show){
                updateControlByStatus(enum_page.point);
            } else if (page_status == enum_page.point){
                updateControlByStatus(enum_page.show);
            }
        });
        one = $("#idPostion");
        one.click(function (){
            if (page_status == enum_page.show){
                updateControlByStatus(enum_page.move);
            } else if (page_status == enum_page.move){
                updateControlByStatus(enum_page.show);
            }
        });
        one = $("#idUpload");
        one.click(function (){
            Uploaddevice();
        });
        updateControlByStatus(enum_page.show);

        one = $("#idShow");
    });
}

function onload() {
    // init map
    base_InitMap(clickOnMap);
    InitPointControl();
    loaddevice();
}


function ShowMe() {
    loaddevice();
}

function HiddenMe() {
    updateControlByStatus(enum_page.show);
}


