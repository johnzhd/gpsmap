import $ from 'jquery';
import UrlList from './UrlList';

function xAJAX (url, param, cb, method){
    if (url === undefined){
        throw "break";
    }
    let mark = url;
    url = UrlList.FormatURL(url)
    if (!url){
        return;
    }
    if (!method){
        method = 'GET';
    }

    $.ajax({
        url: url,
        type: method,
        data: param,
        dateType: 'json',
        cache: false,
        success: function (d) {
            var data = null;
            var err = null;
            if (typeof (d) == "string") {
                try{
                    data = eval('(' + d + ')');
                }
                catch(e){
                    console.log("json error", e);
                    err = e;
                }
            }
            else {
                data = d;
            }

            if (cb && data){
                cb(data.success, data.data, err, mark);
            }

        }.bind(this),
        error: function (xhr, status, err) {

            console.log("error", err);
            if (cb){
                cb(false, [], err, mark);
            }
        }.bind(this)
    });
}

export default xAJAX;
