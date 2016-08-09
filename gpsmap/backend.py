import pymongo


import datetime
import json

import Queue
import threading
import time

import calc_postion
from pprint import pprint

import md5


global_db_name = "gpsmapName"
global_db_url = "mongodb://gpsmap:gpsmap@127.0.0.1:27017/"+global_db_name
# global_db_url = "mongodb://gpsmap:gpsmap@192.168.228.129:27017/" + global_db_name

global_db_origin_collection = "origin"
global_db_calc_collection = "calc"
global_db_user_collection = "userextern"
global_db_device_collection = "device"


global_key_la = "latitude"
global_key_lo = "longitude"
global_key_list =  "items"
global_key_sendtime = "sendtime"
global_key_uid = "id"
global_key_dis = "distance"
global_key_name = "name"
global_key_device = "device"

global_care_keys = [global_key_la, global_key_lo, global_key_list, global_key_sendtime]

global_origin_keys = [global_key_uid, global_key_la, global_key_lo, global_key_sendtime, global_key_dis]

def md5String(s):
    try:
        print(type(s))
        s = s.encode(encoding="utf-8")
        print(type(s))
        bin = md5.new(s).hexdigest()
        return bin
    except Exception as e:
        print("{0} --- {1}".format(__name__, e))
        return None

def CreateUID(obj):
    '''
    change to use name md5
    '''
    global global_key_uid
    global global_key_name
    if global_key_name in obj:
        o = obj[global_key_name]

        m = md5String(o)
        if not m:
            return None
        return "{0:08d}{1}".format(len(o), m)
    elif global_key_uid in obj:
        return obj[global_key_uid]
    return None


"""
origin :
{
   "id", "time", "sendtime", "distance",
   "loc": { type: "Point", coordinates: [ 40, 5 ] }

}

{
"id" : 1
"time" : -1
"loc" : "2dsphere"
}


userextern
{
"id": 1
"time": -1
}


calc
{
"id": 1
"loc": "2dsphere"
"distance": 
"time": -1
}



device
{
"device": 1
"loc" : "2dsphere"
"time": -1
}


"""



global_timedelta = datetime.timedelta(minutes=5)

global_calc_timedelta = datetime.timedelta(minutes=1)

global_EP = 50

global_timeformat_string = "%Y-%m-%d %H:%M:%S"
global_timeformat_string_minutes = "%Y-%m-%d %H:%M"


def time_format(date):
    return date.strftime(global_timeformat_string)

def string_to_time(s):
    try:
        return datetime.datetime.strptime(s, global_timeformat_string)
    except Exception as e:
        return None


def string_standard(s):
    try:
        return time_format(string_to_time(s))
    except Exception as e:
        return None
def time_now():
    return time_format( datetime.datetime.now() )



def string_time_to_unit(start, check, tunit):
    try:
        c = string_to_time(check)
        d = c - start
        ret = d.total_seconds() / tunit
        return int(ret)
    except Exception as e:
        return None

def string_min_whole(s, start, tunit):
    if not tunit:
        tunit = 60
    de = datetime.timedelta(seconds = s * tunit)
    return time_format(start + de)

def fretch_gps_from_data(data):
    try:
        return data["loc"]["coordinates"][1], data["loc"]["coordinates"][0], int(data["distance"])
    except Exception as e:
        return None, None, None

class uid_obj():
    def __init__(self):
        self.uid = ""
        self.la = 0.0
        self.lo = 0.0

class opt():
    global global_db_url
    global global_db_name
    global global_db_origin_collection
    global global_db_calc_collection
    global global_db_user_collection
    global global_key_la
    global global_key_lo
    global global_key_list
    global global_key_sendtime
    global global_key_uid
    global global_key_dis
    global global_key_name
    global global_key_device
    global global_care_keys
    global global_origin_keys
    global global_timedelta
    global global_EP
    global global_timeformat_string
    global global_calc_timedelta
    def __init__(self):
        self.connect = None
        self.queue = Queue.Queue()

        self.connect = pymongo.MongoClient(global_db_url)
        # self.thread = threading.Thread(target=self.consumer)
        # self.thread.start()
        time.sleep(1)
    def producer(self, data):
        # self.queue.put(data)
        # return true

        obj = self.data_to_obj(data)
        if not obj:
            return None
        if global_key_la not in obj or global_key_lo not in obj or global_key_list not in obj:
            return None
        return self.consumer_action_bulk(obj)
    def consumer(self):
        while True:
            try:
                self.connect = pymongo.MongoClient(global_db_url)
                while True:
                    self.consumer_core()
                self.connect.close()
            except Exception as e:
                print("{0} --- {1}".format(__name__, e))
                pass
    def consumer_action_bulk(self, obj):
        try:
            count = self.obj_to_bulk(obj, global_db_origin_collection, global_db_user_collection )
            return count
        except Exception as e:
            print("{0} ---- {1}".format(__name__, e))
            pass
        return None
    def consumer_action_one(self, obj):
        for origin in self.parser_obj(obj):
            self.insert_origin_postion( origin )
            self.update_insert_userinfo( origin )
    def consumer_action(self, obj):
        # self.consumer_action_one(obj)
        self.consumer_action_bulk(obj)
    def consumer_core(self):
        print( "In consumer" )
        try:
            while True:
                if not self.connect:
                    return
                data = self.queue.get()
                if not data:
                    continue
                obj = self.data_to_obj(data)
                if not obj:
                    continue
                if global_key_la not in obj or global_key_lo not in obj or global_key_list not in obj:
                    continue
                
                self.consumer_action(obj)
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
    def bulk_list(self, name, bulk):
        db = self.connect.get_database(global_db_name)
        collection = db.get_collection(name)
        bulk = collection.initialize_unordered_bulk_op()
        ret = collection.bulk_write(bulk)
        count = ret.inserted_count + ret.modified_count + ret.upserted_count
        return count
    def data_to_obj(self, data):
        try:
            obj = json.loads(data)
            return obj
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            return None
    def obj_to_bulk(self, obj, opoints, users):
        if not obj:
            return None
        db = self.connect.get_database(global_db_name)
        o_coll = db.get_collection(opoints)
        u_coll = db.get_collection(users)
        o_bulk = o_coll.initialize_unordered_bulk_op()
        u_bulk = u_coll.initialize_unordered_bulk_op()

        for origin in self.parser_obj(obj):
            data = self.origin_to_insert(origin)
            if not data:
                continue
            o_bulk.insert( data )


            f, d = self.origin_to_update(origin)
            if not f or not d:
                continue

            u_bulk.find(f).upsert().update(d)

        result = o_bulk.execute()
        count = result['nInserted']
        result = u_bulk.execute()
        # count = result['nUpserted'] + result['nModified']
        return count > 0
    def origin_to_insert(self, origin):
        try:
            for n in global_origin_keys:
                if n not in origin:
                    return None
            data = {}
            data[global_key_uid] = str(origin[global_key_uid])
            data[global_key_dis] = str(origin[global_key_dis])
            data[global_key_sendtime] = str(origin[global_key_sendtime])
            data["loc"] = { "type": "Point", "coordinates": [ float(origin[global_key_lo]), float(origin[global_key_la]) ] }
            data["time"] = time_now()
            return data
        except Exception as e:
            pass
        return None
    def origin_to_update(self, origin):
        try:
            data = origin.copy()
            for key in global_origin_keys[1:]:
                if key in data:
                    del data[key]
            data["time"] = time_now()

            f = {global_key_uid: data[global_key_uid]}
            d = {}
            if "device" in data:
                d["$addToSet"] = {"device": data["device"]}
                del data["device"]
            d["$set"] = data
            d["$inc"] = {"ocount": 1}
            return f, d
        except Exception as e:
            pass
        return None, None

    def parser_obj(self, obj):
        for i in global_care_keys:
            if i not in obj:
                return
        unique = {}
        unique[global_key_sendtime] = obj[global_key_sendtime]
        unique[global_key_la] = obj[global_key_la]
        unique[global_key_lo] = obj[global_key_lo]
        if global_key_device in obj:
            unique[global_key_device] = obj[global_key_device]
        for i in obj[global_key_list]:
            if global_key_dis not in i:
                continue

            uid = CreateUID(i)
            if not uid:
                continue

            ret = unique.copy()
            ret.update(i)
            ret[global_key_uid] = uid
            yield ret

    def get_last_postion(self, uid):
        now = datetime.datetime.now() - global_timedelta
        now = time_format(now)
        f = { global_key_uid : uid, "time": {"$gt": now}, "loc.coordinates": {"$exists": True} }
        c = {"_id": 0, "loc": 1, global_key_dis: 1, "time": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_origin_collection)
            it = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            last_point = []
            for i in it:
                try:
                    pair = (i["loc"]["coordinates"][1], i["loc"]["coordinates"][0])
                    if pair in last_point:
                        continue
                    last_point.append(pair)
                    s = {global_key_lo: i["loc"]["coordinates"][0],
                        global_key_la: i["loc"]["coordinates"][1],
                        global_key_dis: i[global_key_dis]
                        }
                    ret.append(s)
                except Exception as e:
                    print("{0} --- {1}".format(__name__, e))
                    continue
            if len(ret) > 1:
                return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None
    def insert_origin_postion(self, obj):
        data = self.origin_to_insert(obj)
        if not data:
            return None
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_origin_collection)
            id = collection.insert_one(data).inserted_id
            return id
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None
    def insert_calc_postion(self, uid, la, lo, dis):
        if not uid or not la or not lo:
            return None
        if not dis:
            dis = 0.0
        data = {global_key_uid: uid,
                "loc": { "type": "Point", "coordinates": [ la, lo ] },
                global_key_dis: dis,
                "time": time_now()}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_calc_collection)
            id = collection.insert_one(data).inserted_id
            return id
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None
    def get_counts(self, f, collection_name):
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(collection_name)
            return collection.count(f)
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return 0
    def update_insert_userinfo(self, obj):
        try:
            f, d = self.origin_to_update(obj)
            if not f or not d:
                return None
            
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_user_collection)
            id = collection.update_one(f, d, True).upserted_id
            return id
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None

    def check_namelist(self, name):
        f = {"name": name}
        c = {"_id": 0, "id": 1, "time": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_user_collection)
            r = collection.find(f, c).sort([("id", pymongo.ASCENDING), ("time", pymongo.DESCENDING)])
            if r:
                ret = {}
                for d in r:
                    if d["id"] not in ret or d["time"] > ret[d["id"]]:
                        ret[d["id"]] = d["time"]
                r = []
                for key in ret:
                    r.append({ "id": key, "time": ret[key] })
                return r
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None
    def get_origin_points_data_from_db(self, id, start, end):
        f = {"id":id}
        c = {"_id": 0, "loc.coordinates":1, "time":1, "distance":1}
        ret = []
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_calc_collection)

            if start:
                f["time"] = {}
                f["time"]["$gte"] = start
            if end:
                if "time" not in f:
                    f["time"] = {}
                f["time"]["$lte"] = end


            origin_collection = db.get_collection(global_db_origin_collection)
            r = origin_collection.find(f, c).sort("time", pymongo.ASCENDING)
            for d in r:
                ret.append(d)
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return ret
    def cut_list_by_time(self, data, tunit):
        origin_list = {}
        base_time = None
        if data and data[0] and "time" in data[0]:
            base_time = string_to_time(data[0]["time"])
        if not base_time:
            return origin_list
        for d in data:
            if not d:
                continue
            try:
                minutes = string_time_to_unit(base_time, d["time"], tunit)
                if minutes is None:
                    continue
                if minutes not in origin_list:
                    origin_list[minutes] = []
                origin_list[minutes].append(d)
            except Exception as e:
                continue
        return origin_list, base_time
    def check_and_calc_with_data(self, data, tunit, id):
        try:
            tunit = int(tunit)
        except Exception as e:
            tunit = 60
        print("Data length: {0}".format(len(data)))
        pprint(data)

        dic_data, base_time = self.cut_list_by_time(data, tunit)
        if not dic_data:
            return None

        print("dic_data length: {0}".format(len(dic_data)))

        new_ret = []
        for minutes in dic_data:
            r = self.zone_and_calc(dic_data[minutes], id, string_min_whole(minutes, base_time, tunit))
            if r:
                new_ret.append(r)

        ret = []
        for d in new_ret:
            ret.append({"id": id,
                                "time": d["time"],
                                "latitude": d["loc"]["coordinates"][1],
                                "longitude": d["loc"]["coordinates"][0],
                                "distance": d["distance"]
                                })
        return ret
    def check_and_calc(self, id, start, end, tunit):
        data = self.get_origin_points_data_from_db(id, start, end)
        if not data:
            return None

        return self.check_and_calc_with_data(data, tunit, id)

    def zone_and_calc(self, l, id, tm):
        if len(l) < 3:
            return None
        r = calc_postion.calc_list(l, global_EP, fretch_gps_from_data)
        if r:
            ret = {}
            ret["id"] = id
            ret["loc"] = {"type": "Point", "coordinates" : [r[1], r[0]]}
            ret["distance"] = r[2]
            ret["time"] = tm
            return ret
        return None

    def time_and_calc(self, d1, d2, d3, id):
        try:
            t1= string_to_time(d1["time"])
            t2= string_to_time(d2["time"])
            if t1 > t2:
                t = t1
                t1 = t2
                t2 = t
            t = string_to_time(d3["time"])
            if t < t1:
                t1 = t
            elif t > t2:
                t2 = t

            if t1 + global_calc_timedelta < t2:
                return None
            r = calc_postion.calc(d1["loc"]["coordinates"][1], d1["loc"]["coordinates"][0], int(d1["distance"]),
                                      d2["loc"]["coordinates"][1], d2["loc"]["coordinates"][0], int(d2["distance"]),
                                      d3["loc"]["coordinates"][1], d3["loc"]["coordinates"][0], int(d3["distance"]),
                                      global_EP)
            if not r:
                return None
            ret = {}
            ret["id"] = id
            ret["loc"] = {"type": "Point", "coordinates" : [r[1], r[0]]}
            ret["distance"] = r[2]
            ret["time"] = time_format(t2)
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None
    def remove_oldest_one(self, d):
        min_key = None
        min_time = None
        for key in d:
            if not min_time or min_time > d[key]["time"]:
                min_key = key
                min_time = d[key]["time"]
        if min_key:
            del d[min_key]
    def insert_calc_list(self, l):
        if not l:
            return
        requests = []
        for d in l:
            requests.append(pymongo.InsertOne(d))
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_calc_collection)
            collection.bulk_write(requests)
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        pass
    def show_namelist(self):
        return self.show_name(None)
    def show_name(self, name):
        f = {}
        if name:
            f['name'] = name
        c = {"_id": 0, "name": 1, "time": 1, "id": 1, "device": 1, "ocount": 1, "pcount": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_user_collection)
            r = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            for d in r:
                ret.append(d)
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None
    def origin_points(self, id, start, end):
        f = {"id": id}
        if start:
            f["time"]={}
            f["time"]["$gte"]=start
        if end:
            if "time" not in f:
                f["time"]={}
            f["time"]["$lte"]=end
        c = {"_id":0, "loc.coordinates": 1, "time": 1, "distance": 1, "sendtime": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_origin_collection)
            r = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            for d in r:
                tmp = {}
                if "time" in d:
                    tmp["time"] = d["time"]
                if "sendtime" in d:
                    tmp["sendtime"] = d["sendtime"]
                if "distance" in d:
                    tmp["distance"] = d["distance"]
                if "loc" in d and "coordinates" in d["loc"] and len(d["loc"]["coordinates"]) > 1:
                    tmp["latitude"] = d["loc"]["coordinates"][1]
                    tmp["longitude"] = d["loc"]["coordinates"][0]
                if tmp:
                    ret.append(tmp)
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None

    def set_device(self, device, la, lo):
        f = {"device": device}
        data ={"$set": {"device": device,
                        "loc": {"type": "Point", "coordinates" : [lo, la]},
                        "time": time_now()} }
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            r = collection.update_one(f, data, True)
            return r.modified_count or r.upserted_id
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None


    def get_device(self, device):
        f = {"device": device}
        c = {"_id": 0, "device": 1, "loc": 1, "time": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            r = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            for d in r:
                ret.append({ "device": d["device"],
                            "time": d["time"],
                            "latitude": d["loc"]["coordinates"][1],
                            "longitude": d["loc"]["coordinates"][0],
                            })
                return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None
    def delete_device(self, device):
        f = {"device": device}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            return collection.delete_one(f).deleted_count > 0
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None
    def get_device_all(self):
        f = {}
        c = {"_id": 0, "device": 1, "loc": 1, "time": 1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            r = collection.find(f, c).sort([("device", pymongo.ASCENDING), ("time", pymongo.DESCENDING)])
            t = {}
            for d in r:
                if d['device'] not in t:
                    t[d['device']] = {}
                elif t[d['device']]['time'] > d["time"]:
                    continue
                t[d['device']]['time'] = d["time"]
                t[d['device']]['latitude'] = d["loc"]["coordinates"][1]
                t[d['device']]['longitude'] = d["loc"]["coordinates"][0]
            ret = []
            for d in t:
                ret.append( {
                    'device': d,
                    'time': t[d]['time'],
                    'latitude': t[d]['latitude'],
                    'longitude': t[d]['longitude'],
                    } )
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
        return None

global_unique_opt_obj = None
global_unique_opt_obj_mx = threading.Lock()

def get_unique_opt():
    global global_unique_opt_obj
    global global_unique_opt_obj_mx

    global_unique_opt_obj_mx.acquire()
    if not global_unique_opt_obj:
        try:
            global_unique_opt_obj = opt()
        except Exception as e:
            global_unique_opt_obj = None
            print("{0} --- {1}".format(__name__, e))
            pass
    global_unique_opt_obj_mx.release()
    return global_unique_opt_obj

def unique_push_data(data):
    obj = get_unique_opt()
    if not obj:
        return None
    return obj.producer(data)


def unique_check_namelist(name):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.check_namelist(name)
    return ret

def unique_check_and_calc(id, start, end, tunit):
    obj = get_unique_opt()
    if not obj:
        return None
    start = string_standard(start)
    end = string_standard(end)
    ret = obj.check_and_calc(id, start, end, tunit)
    return ret

def unique_origin_points(id, start, end):
    obj = get_unique_opt()
    if not obj:
        return None
    start = string_standard(start)
    end = string_standard(end)
    ret = obj.origin_points(id, start, end)
    return ret



def unique_show_namelist():
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.show_namelist()
    return ret

def unique_show_name(name):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.show_name(name)
    return ret

def unique_set_device(device, la, lo):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.set_device(device, la, lo)
    return ret

def unique_get_device(device):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.get_device(device)
    return ret

def unique_get_device_all():
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.get_device_all()
    return ret

def unique_delete_device(device):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.delete_device(device)
    return ret



