// devicepoints : point, circle, label( dis, device, time), marker
var devicepoints = [];



function onShowDevice(bShow) {
    if (bShow) {
        base_ShowPoints(devicepoints);
    }
    else {
        base_HiddenPoints(devicepoints);
    }
}

var global_device_click = false;

function OnDeviceClickEvent(point) {

}

function RenewDevicePoint(datas) {
    var points = base_DataToPoints_device(datas, base_Label_Device, OnDeviceClickEvent);
    if (points) {
        base_ClearPoints(devicepoints);
        devicepoints = points;
    }
}


function LoadDevicePoint() {
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
                // Set new Device Points
                RenewDevicePoint(data.data);
                onShowDevice(true);

            } else {
                console.error(data);
                console.error('load device err');
            }
        }.bind(this),
        error: function (xhr, status, err) {
            console.error('Calc ajax err: ' + err);
        }.bind(this)
    });
}


// Base interface

function onload() {
    base_InitMap();
    LoadDevicePoint();
}

function ShowMe() {
    LoadDevicePoint();
}

function HiddenMe() {
    onShowDevice(false);
}
