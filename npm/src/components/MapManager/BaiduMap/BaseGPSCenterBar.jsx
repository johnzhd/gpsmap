import styles from './BaseGPSCenterBar.less'
function baseGPSCenterBar(PushGo){
    function GPSCenterBar(){
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(175, 5);
    }
    GPSCenterBar.prototype = new BMap.Control();
    GPSCenterBar.prototype.initialize = function (map) {
        var inputLng = document.createElement("input");
        inputLng.id = "idLongitude";
        inputLng.type = "number";
        inputLng.className = styles.NumberBar;
        inputLng.placeholder = "经度(longitude)";
        var spansplit = document.createElement("span");
        spansplit.id = "idsplit";
        spansplit.innerHTML = "-";
        spansplit.className = styles.Light;
        var inputLat = document.createElement("input");
        inputLat.id = "idLatitude";
        inputLat.type = "number";
        inputLat.className = styles.NumberBar;
        inputLat.placeholder = "纬度(latitude)";
        var buttonGo = document.createElement("input");
        buttonGo.id = "idGo";
        buttonGo.type = "button";
        buttonGo.value = "Go";
        buttonGo.className = styles.baseinput;
        if (PushGo){
            buttonGo.onclick=function(event){ PushGo();};
        }
        var totalGPS = document.createElement("div");
        totalGPS.appendChild(inputLng);
        totalGPS.appendChild(spansplit);
        totalGPS.appendChild(inputLat);
        totalGPS.appendChild(buttonGo);
        // 将DOM元素返回
        
        map.getContainer().appendChild(totalGPS);
        return totalGPS;
    }
    var myGPSCenterBar = new GPSCenterBar();
    return myGPSCenterBar;
}

export default baseGPSCenterBar;