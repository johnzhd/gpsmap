function BaiduPoint(lng, lat, dis, label, id, onclick, onDrag){
    var ret = {
        point: null,
        circle: null,
        label: null,
        marker: null,
        cbclick: null,
        cbDrag: null,
        myid: null,
    };
    if (lat && lng) {
        ret.point = new BMap.Point(lng, lat);


        ret.distance = dis;
        if (dis) {
            ret.circle = new BMap.Circle(ret.point, dis);
            ret.circle.setStrokeColor("#0033CC");
            ret.circle.setStrokeOpacity(0.7);
            ret.circle.setStrokeWeight(3);
            ret.circle.setFillColor("#0066B2");
            ret.circle.setFillOpacity(0.7);
        }

        ret.myid = id;

        ret.marker = new BMap.Marker(ret.point);
        ret.marker.setTitle(PointDefaultTitle(lng, lat));


        if (label) {
            ret.label = label;
            ret.marker.setLabel(new BMap.Label(label, { offset: new BMap.Size(20, -10) }));
        }

        if (onclick){
            ret.cbclick = onclick;
            ret.fordelete_click = (e)=>{PointDefaultClick(e, ret);};
            ret.marker.addEventListener("click", ret.fordelete_click);
        }

        if (onDrag){
            ret.cbDrag = onDrag;
            ret.fordelete_drag = (e)=>{
                console.log('drag inside');
                PointDefaultDrag(e, ret);};
            ret.marker.addEventListener("dragend", ret.fordelete_drag);
        }
    }
    return ret;
}

function MovePoint(point, lng, lat, dis){
    if (!point){
        return ;
    }
    if (lng && lat){
        if (!point.point || !point.marker){
            return;
        }
        point.point.lng = lng;
        point.point.lat = lat;
        point.marker.setPosition(point.point);
        if (point.circle){
            point.circle.setCenter(point.point);
        }
        SetPointTitle(point, PointDefaultTitle(lng, lat));
    }
    if (dis){
        point.distance = dis;
        if (!point.circle){
            point.circle = new BMap.Circle(point.point, dis);
            point.circle.setStrokeColor("#0033CC");
            point.circle.setStrokeOpacity(0.7);
            point.circle.setStrokeWeight(3);
            point.circle.setFillColor("#0066B2");
            point.circle.setFillOpacity(0.7);
        }
        else{
            point.circle.setRadius(dis);
        }
    }
}

function PointDefaultTitle(lng, lat){
    return "经: " + lng + ", 纬: " + lat;
}

function PointDefaultClick(e, point){
    console.log(e.point.lng, e.point.lat);
    if (point.cbclick){
        point.cbclick(e, point);
    }
}


function PointDefaultDrag(e, point){
    console.log(e.point.lng, e.point.lat);
    point.point.lng = e.point.lng;
    point.point.lat = e.point.lat;
    SetPointTitle(point, PointDefaultTitle(e.point.lng, e.point.lat));
    if (point.circle){
        point.circle.setCenter(point.point);
    }
    if (point.cbDrag){
        point.cbDrag(e, point);
    }
}



function SetPointLabel(point, label){
    if (!point || !point.marker){
        return ;
    }
    point.label = label;
    point.marker.setLabel(new BMap.Label(label, { offset: new BMap.Size(20, -10) }));
}

function SetPointTitle(point, title){
    if (!point || !point.marker){
        return ;
    }

    point.marker.setTitle(title);
}

function SetPointDrag(point, b){
    if (!point || !point.marker){
        return ;
    }
    if (b){
        point.marker.enableDragging();
    }
    else {
        point.marker.disableDragging();
    }
}

function SetPointJump(point, b){
    if (!point || !point.marker){
        return;
    }
    point.marker.setAnimation(b?BMAP_ANIMATION_BOUNCE:null);
}

function CreatePictureMarker(point, id, img, name, gender, sign, onclick){
    function ComplexCustomOverlay(point, id, img, name, gender, sign){
        this._point = point;
        this._id = id;
        this._img = img;
        this._name = name + ' - ' + gender;
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
        div.className
        div.style.zIndex = this._zzz = BMap.Overlay.getZIndex(this._point.lat);
        div.style.position = "absolute";
        div.style.backgroundColor = "#6BADCA";
        div.style.border = "1px solid #0000ff";
        div.style.color = "white";
        div.style.height = "36px";
        div.style.padding = "2px";
        // div.style.lineHeight = "50px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px";
        div.onclick = function(e){
            e.preventDefault();
            if (onclick){
                onclick(that._id);
            }
        };
        var imgNode = document.createElement("img");
        imgNode.src = this._img;
        imgNode.alt = this._name;
        imgNode.style.width = "30px";
        imgNode.style.height = "30px";
        imgNode.style.zIndex = this._zzz + 1;


        var nameNode = document.createElement("h3");
        var nameText = document.createElement("span");
        nameText.appendChild(document.createTextNode(""));
        nameNode.appendChild(nameText);
        
        var signNode = document.createElement("p");
        var signText = document.createElement("span");
        signText.appendChild(document.createTextNode(""));
        signNode.appendChild(signText);
        
        var describeNode = document.createElement("div");
        describeNode.appendChild(nameNode);
        describeNode.appendChild(signNode);
        

        var arrow = this._arrow = document.createElement("div");
        arrow.style.background = "url(/label.png) no-repeat";
        arrow.style.position = "absolute";
        arrow.style.width = "11px";
        arrow.style.height = "10px";
        arrow.style.top = "34px";
        arrow.style.left = "10px";
        arrow.style.overflow = "hidden";
        arrow.style.zIndex = this._zzz - 1;

        div.appendChild(imgNode);
        div.appendChild(describeNode);
        div.appendChild(arrow);

        div.onmouseover = function(){
            this.style.backgroundColor = "#EE5D5B";
            this.style.borderColor = "#BC3B3A";
            this.getElementsByTagName("span")[0].innerHTML = that._name;
            this.getElementsByTagName("span")[1].innerHTML = that._sign;

            arrow.style.backgroundPosition = "0px -20px";
            imgNode.style.width = "96px";
            imgNode.style.height = "96px";

            // this.style.height = "102px";
            this.style.height = null;

            this.style.zIndex = 9999;
        }

        div.onmouseout = function(){
            this.style.backgroundColor = "#6BADCA";
            this.style.borderColor = "#0000ff";
            this.getElementsByTagName("span")[0].innerHTML = '';
            this.getElementsByTagName("span")[1].innerHTML = '';

            arrow.style.backgroundPosition = "0px 0px";
            imgNode.style.width = "30px";
            imgNode.style.height = "30px";

            this.style.height = "36px";

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

function CreatePicturePoint(lng, lat, id, time, img, name, gender, sign, onclick){
    let ret = {
        point: null,
        marker: null,
        myid: time,
        id: id,
    };
    ret.point = new BMap.Point(lng, lat);
    ret.marker = CreatePictureMarker(ret.point, id, img, name, gender, sign, onclick);
    return ret;
}



const BasePoint = {
    CreatePoint: BaiduPoint,
    CreatePicturePoint: CreatePicturePoint,
    MovePoint: MovePoint,
    SetLabel: SetPointLabel,
    SetTitle: SetPointTitle,
    EnableDrag: SetPointDrag,
    EnableJump: SetPointJump,
};

export default BasePoint;



