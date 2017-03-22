import base
import httplib
import urllib
import json

global_host = "127.0.0.1"
global_port = "80"

global_net_response_success = "success"
global_net_response_data = "data"


global_net_request_data = "data"


global_net_protocal_path_key ={
    ################### backend call ########################
    # heartbeat from real pc
    "realpc": {
        "ip": ("127.0.0.1:8080", "real pc ip:port"),
        "subcount": (0, "count of virtual machine"),
        "cpu": (78, "cpu usage %"),
        "memory": (1.6, "memory usage GB"),
        "totalmemory": (16, "memory usage GB"),
        "disk": (3.2, "memory usage GB"),
        "totaldisk": (2048, "memory usage GB"),
    },
    # upload datas from real pc
    "upload": {
        "sendtime": ("1970-01-01 00:00:00", "time on real pc"),
        "latitude": ("39.106947", "device's latitude"),
        "longtitude": ("117.178986", "device's longtitude"),
        "device": ("TASKNAME_IP:PORT_Number", "device point name"),
        "items": [
            {
                "id": ("AAAAdemotestAAAA", "id"),
                "name": ("AAAAAA", "person name"),
                "gender": (1, "int 1 for male 2 for female"),
                "country": ("CN", "country"),
                "province": ("Beijing", "province"),
                "city": ("Beijing", "city"),
                "sign": ("AAAsign utf8 AAA", "signature"),
                "img": ("http://wx.qq.com/", "url for weixin head icon"),
            },
        ]
    },
    # request device from real pc
    # request device from front UI
    # set one device from front UI
    "device": {
        "ip": ("127.0.0.1:8080", "real pc ip:port"),
        "device": ("TASKNAME_IP:PORT_Number", "device point name"),
        "dname": ("TASKNAME", "task name"),
        "action": ("get", '''
            get: ip dname => device point list,
            get: device => device point,
            set: ip dname device latitude longtitude => device point,
            disable: device => device point
            '''),
        "latitude": ("39.106947", "device's latitude"),
        "longtitude": ("117.178986", "device's longtitude"),
        ### device point
        ### [{"device", "latitude", "longtitude", "gpsstatus"}]
        ### device point list
        ### [{"device", "latitude", "longtitude", "gpsstatus"}, {"device", "latitude", "longtitude", "gpsstatus"}, ]
    },

    ############################# get datas ###########################
    ## Get information
    ## request with filter values
    ## get response data

    # request user from front UI
    "user": {
        "name": ("AA", "search name"),
        "sign": ("AA", "search sign"),
        "country": ("CN", "search country"),
        "province": ("Beijing", "search province"),
        "city": ("Beijing", "search city"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        ### [{
        ###    "id":"", "name":"", "gender":"", "country":"", "province":"", "city": "", "sign": "", "img":"", "time":""
        ###  },]
    },
    # request task from front UI
    "friendtask":{
        "name": ("TASKNAME", "friend task name in database this key name fname"),
        "ip": ("127.0.0.1:8080", "real pc ip:port"),
        "status": ("enabled", "search task status"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "target": ("AA", "search target in targets"),
        ### [{
        ###   "fname", "count", "targets", "createtime", "starttime", "notes", "status", "frequency", "ip"
        ### },]
    },
    # request task from front UI
    "gpstask": {
        "name": ("TASKNAME", "in database this key name dname"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "status": ("enabled", "search task status"),
        ### 
        ### [{
        ###   "dname", "count", "createtime", "notes", "status",
        ###   "items": [{"device", "latitude", "longtitude", "time", "frequency", "ip", "account", "password", "gpsstatus"},]
        ### },]
    },
    # request task from real pc
    "pctask":{
        "ip": ("127.0.0.1:8080", "real pc ip:port"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "status": ("enabled", "search task status"),
        ### 
        ### [{
        ###   "ip", "count", "time", "status", "memory", "totalmemory", "disk", "totaldisk",
        ###   "gps": [{"device", "latitude", "longtitude", "time", "frequency", "ip", "account", "password", "gpsstatus"},],
        ###   "friend": [{"fname", "targets":[], "status", "frequency", "starttime", "createtime", "notes"}],
        ### },]
    },
    
    # request origin points record from front UI
    "origin": {
        "id": ("AAAAdemotestAAAA", "user id"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "near": (["117.178986", "39.106947"], "near the point to search"),
        ### [{"latitude", "longtitude", "distance", "time"}, ]
    },

    # request calc result from front UI
    "calc": {
        "id": ("AAAAdemotestAAAA", "user id"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "near": (["117.178986", "39.106947"], "near the point to search"),
        "level": (1, "Confidence Level"),
        ### [{"latitude", "longtitude", "distance", "time"}, ]
    },

    # request friend circle from front UI
    "friend": {
        "target": ("id", "weixin id"),
        "id": ("id", "weixin account id"),
        "name": ("AA", "weixin name contain string"),
        "sign": ("AA", "weixin signature contain string"),
        "start": ("1970-01-01 00:00:00", "start search time"),
        "end": ("1970-01-01 00:00:00", "end search time"),
        "near": (["117.178986", "39.106947"], "near the point to search"),
        ### [{
        ###   "id", "name","img":[], "sign", "time", "content", "latitude", "longtitude",
        ### },]
    },
    ################################ set settings or New task or New real PC #####################
    # set new gps task
    #    add point to gps task    call [device] with action set
    #    delete point to gps task call [device]
    # enabled gps task and lock real pc
    #    disabled gps task and release real pc
    # 1 first time
    #   add items into tpoint 
    # 2 enabled:
    #   update taskgps
    #   update items in tpoint enabled
    #   check items's ip status in realpc
    #   return status
    # 3 disabled:
    #   update taskgps
    #   update items in tpoint disabled
    #   return status
    "setgps":{
        "dname": ("TASKNAME", "gps task name should unique"),
        "notes": ("..", "define describe"),
        "status": ("enabled", "disabled or enabled"),
        "items": ([{
            "latitude", "longtitude", "frequency",
            "account", "password", "gpsstatus"
        },], "points"),
        "ip": ("127.0.0.1:8080", "work real pc"),
        ### [{
        ###    "device", "dname", "gpsstatus", "ip", 
        ### },]
    },

    # get real pc information    call [pctask]
    # get real pc list           call [pctask] without ip
}


###### net action base ####

def post_order(path, data):
    json_str = json.dumps(data, indent=None)
    pair = {global_net_request_data: json_str}
    data = urllib.urlencode(pair)
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": len(data)
        }
    conn = httplib.HTTPConnection( global_host, global_port, True, 3)
    conn.request("POST", "/api/{0}".format(path), data, headers)
    resp = conn.getresponse()
    body = resp.read()
    resp.close()
    if body:
        obj = json.loads(body)
        return obj
    return None

def is_ok_response(obj):
    return obj and obj["success"]

def getdemodata(path):
    ret = {}
    one = global_net_protocal_path_key[path]
    for key in one:
        print(one[key][1])
        ret[key] = one[key][0]
    if not ret:
        return ret
    return None


###### real PC #####

def realPC_heartjump():
    '''
    ip: local ip
    count: number of virtual android
    '''
    path = "realpc"
    request = getdemodata(path)

    ret = post_order(path, request)

    format_string = "miss server {0}"
    if is_ok_response(ret):
        format_string = "connect {0}"

    print(format_string.format(base.now_string()))

def upload():
    path = "upload"
    request = getdemodata(path)

    ret = post_order(path, request)
    result = "failed"
    if is_ok_response(ret):
        result = "success"
    print("upload {0}".format(result))
    
def device():
    path = "device"
    request = getdemodata(path)

    ret = post_order(path, request)

    if ret["success"]:
        print("action {0} success".format(request["action"]))
        data = []
        if "data" in ret and ret["data"]:
            data = ret["data"]
        for one in data:
            print(one["device"])
            print(one["latitude"])
            print(one["longtitude"])
    else:
        print("action {0} failed".format(request["action"]))


