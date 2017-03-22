import pymongo
import datetime


global_db_name = "gpsmapName"
global_db_ip = "127.0.0.1"
global_db_port = "27017"
global_db_username = "gpsmap:gpsmap"
global_db_url = "mongodb://{0}@{1}:{2}/{3}".format(
    global_db_username, global_db_ip, global_db_port, global_db_name)


global_key_la = "latitude"
global_key_lo = "longitude"
global_key_list =  "items"
global_key_sendtime = "sendtime"
global_key_uid = "id"
global_key_dis = "distance"
global_key_name = "name"
global_key_img = "img"
global_key_gender = "gender"
global_key_device = "device"

global_default_base_time = datetime.datetime(1970,1,1,0,0,0,0)
global_default_uint_time = 60 * 10


global_care_keys = [global_key_la, global_key_lo, global_key_list, global_key_sendtime]

global_origin_keys = [global_key_uid, global_key_la, global_key_lo, global_key_sendtime, global_key_dis]

#####

global_db_task_gps = "taskgps"
global_db_tpoint = "tpoint"  # detail for task

global_db_task_friend = "taskfriend"
global_db_fpoint = "fpoint"


global_db_status_pc = "realpc"

global_db_gps_origin = "gpsorigin"
global_db_gps_calc = "gpscalc"
global_db_gps_user = "gpsuser"



global_db_task_gps_key = {
    "dname": [pymongo.DESCENDING,True],  # "string"  task name
    "count": None,                       # int count of tpoint
    "createtime": None,                  # "string" "YYYY-mm-dd HH:MM:SS"
    "notes": None,                       # "string"
    "status": None,                      # "disabled" or "enabled"
}

global_db_status_pc_key = {
    "ip": [pymongo.DESCENDING, True],       # "string" "ip:port"
    "count": None,                          # int count of "virtual pc" report by pc
    "time": None,                           # "string" "YYYY-mm-dd HH:MM:SS"
    "status": None,                         # "disabled" or "enabled"
    "memory": None,
    "totalmemory": None,
    "disk": None,
    "totaldisk": None,
}

global_db_tpoint_key = {
    "device": None,                        # "string"  "ip:port_001"
    "loc": [pymongo.GEOSPHERE, False],     # {"type": "Point", "coordinates":[lng, lat]}
    "time": None,                          # "string" "YYYY-mm-dd HH:MM:SS"
    "frequency": None,                     # second   default 60*2
    "dname": [pymongo.DESCENDING, False],  # "string"  FK point to global_db_task_gps's dname
    "ip": [pymongo.DESCENDING, False],     # "string"  FK point to global_db_status_pc's ip
    "account": None,                       # "string" weixin account
    "password": None,                      # "string" weixin passwrod
    "gpsstatus": None,                     # "disabled" or "enabled"
}

global_db_task_friend_key = {
    "fname": [pymongo.DESCENDING, False],   # "string"  task name
    "count": None,                          # int count of "targets"
    "targets": None,                        # ["string", "string"]  target weixin account
    "createtime": None,                     # "string" "YYYY-mm-dd HH:MM:SS"
    "starttime": None,                      # "string" "YYYY-mm-dd HH:MM:SS"
    "notes": None,                          # "string"
    "status": None,                         # "disabled" or "enabled"
    "frequency": None,                      # second   default 60*2
    "ip": [pymongo.DESCENDING, False],      # "string"  FK point to global_db_status_pc's ip
}

global_db_fpoint_key = {
    "target": [pymongo.DESCENDING, False],  # "string"  target weixin name or id
    "id": [pymongo.DESCENDING, False],      # "string"  target weixin account id
    "name":  None,                          # "string" target weixin name
    "img": None,                            # ["string"] head images
    "sign": None,                           # "string" person signature
    "time": None,                           # "string" "YYYY-mm-dd HH:MM:SS"
    "content": None,                        # "string" content
    "loc": None,                            # {"type":"Point", "coordinates":[lng, lat]} location besided content
}



global_db_gps_origin_key = {
    "id": [pymongo.DESCENDING, False],      # "string"  FK point to global_db_gps_user's id
    "loc": [pymongo.GEOSPHERE, False],      # {"type": "Point", "coordinates":[lng, lat]}
    "distance": None,                       # "string" int meter
    "sendtime": None,                       # "string" "YYYY-mm-dd HH:MM:SS"
    "time": None,                           # "string" "YYYY-mm-dd HH:MM:SS"
}

global_db_gps_calc_key = {
    "id": [pymongo.DESCENDING, False],      # "string"  FK point to global_db_gps_user's id
    "loc": [pymongo.GEOSPHERE, False],      # {"type": "Point", "coordinates":[lng, lat]}
    "distance": None,                       # "string" int meter
    "time": None,                           # "string" "YYYY-mm-dd HH:MM:SS"
    "level": None,                          # int 1 high, 5 low
}

global_db_gps_user_key = {
    "id": [pymongo.DESCENDING, False],      # "string" user name or weixin account
    "name": [pymongo.DESCENDING, False],    # "string"
    "gender": None,                         # "string"
    "country": None,                        # "string"
    "province": None,                       # "string"
    "city": None,                           # "string"
    "sign": None,                           # "string"
    "img": None,                            # "string"
    "time": None,                           # "string" "YYYY-mm-dd HH:MM:SS"
}

global_db_table_list = [
    (global_db_task_gps, global_db_task_gps_key),
    (global_db_status_pc, global_db_status_pc_key),
    (global_db_tpoint, global_db_tpoint_key),

    (global_db_task_friend, global_db_task_friend_key),
    (global_db_fpoint, global_db_fpoint_key),

    (global_db_gps_origin, global_db_gps_origin_key),
    (global_db_gps_calc, global_db_gps_calc_key),
    (global_db_gps_user, global_db_gps_user_key),
    ]