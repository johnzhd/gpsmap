function base_time_second_to_string(second) {
    var d = new Date(second * 1000);
    return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}


function base_time_string_to_second(tstr) {
    try{
    return Date.parse(tstr.replace(/-/g, "/")) / 1000;
    }
    catch(e){
        console.log(e);
    }
    return NaN;
}

function base_time_now() {
    var d = new Date()
    var now = d.getTime() / 1000;
    return now;
}

const TimeAPI = {
    Now: base_time_now,
    SecondToString: base_time_second_to_string,
    StringToSecond: base_time_string_to_second
};

export default TimeAPI;
