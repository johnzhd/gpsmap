import styles from './BaseControl.less'
function baseControl(ShowMe, AccessMe, ClickRule){
    function CoreControl(){
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
        this.defaultOffset = new BMap.Size(5, 5);
    }
    CoreControl.prototype = new BMap.Control();
    CoreControl.prototype.initialize = function (map) {
        var input1 = document.createElement("input");
        input1.type = "button";
        input1.id = "idShow";
        input1.value="显示";
        input1.className=styles.baseinput;
        if (ShowMe){
            input1.onclick=function(event){ShowMe();};
        }
        var input2 = document.createElement("input");
        input2.type = "button";
        input2.id = "idAccess";
        input2.value="辅助";
        input2.className=styles.baseinput;
        if (AccessMe){
        input2.onclick=function(event){AccessMe();};
        }
        var input3 = document.createElement("input");
        input3.type = "button";
        input3.id = "idRule";
        input3.value="测距";
        input3.className=styles.baseinput;
        if (ClickRule){
        input3.onclick=function(event){ClickRule();};
        }

        var total = document.createElement("div");
        total.appendChild(input1);
        total.appendChild(input2);
        total.appendChild(input3);
        map.getContainer().appendChild(total);
        // 将DOM元素返回
        return total;
    };
    var myCoreControl = new CoreControl();
    return myCoreControl;
}

export default baseControl;