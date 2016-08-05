import pymongo


import datetime
import json

import Queue
import threading
import time

import calc_postion



global_db_url = "mongodb://gpsmap:gpsmap@127.0.0.1:27017/gpsmap"
# global_db_url = "mongodb://gpsmap:gpsmap@192.168.228.129:27017/gpsmap"
global_db_name = "gpsmap"
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
global_key_device = "device"

global_care_keys = [global_key_la, global_key_lo, global_key_list, global_key_sendtime]

global_origin_keys = [global_key_uid, global_key_la, global_key_lo, global_key_sendtime, global_key_dis]



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
    return datetime.datetime.strptime(s, global_timeformat_string)


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
        if not tunit:
            tunit = 60

        s = start
        if s > c:
            d = s - c
            ret = d.total_seconds() / tunit
            return int(ret)
    except Exception as e:
        return None

def string_min_whole(s, now, tunit):
    if not tunit:
        tunit = 60
    de = datetime.timedelta(seconds = s * tunit)
    return time_format(now - de)

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
        self.thread = threading.Thread(target=self.consumer)
        self.thread.start()
        time.sleep(1)
    def producer(self, data):
        self.queue.put(data)
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
                
                for origin in self.parser_obj(obj):
                    self.insert_origin_postion( origin )
                    self.update_insert_userinfo( origin )

                    #pair = self.get_last_postion(usr[global_key_uid])
                    #if not pair or len(pair) < 2:
                    #    continue
                    #r_calc = calc_postion.calc(origin[global_key_la], origin[global_key_lo], origin[global_key_dis],
                    #                           pair[0][global_key_la], pair[0][global_key_lo], pair[0][global_key_dis],
                    #                           pair[1][global_key_la], pair[1][global_key_lo], pair[1][global_key_dis],
                    #                           global_EP)
                    #if not r_calc:
                    #    continue
                    #self.insert_calc_postion( origin[global_key_uid], r_calc[0], r_calc[1], r_calc[2] )
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass

    def data_to_obj(self, data):
        try:
            obj = json.loads(data)
            return obj
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            return None
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
            ret = unique.copy()
            if global_key_uid not in i or global_key_dis not in i:
                continue
            ret.update(i)
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
        for n in global_origin_keys:
            if n not in obj:
                return None
        data = {}
        data[global_key_uid] = obj[global_key_uid]
        data[global_key_dis] = obj[global_key_dis]
        data[global_key_sendtime] = obj[global_key_sendtime]
        data["loc"] = { "type": "Point", "coordinates": [ float(obj[global_key_lo]), float(obj[global_key_la]) ] }
        data["time"] = time_now()
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
        data = obj.copy()
        for key in global_origin_keys[1:]:
            if key in data:
                del data[key]
        data["time"] = time_now()
        try:
            f = {global_key_uid: data[global_key_uid]}
            d = {}
            if "device" in obj:
                d["$addToSet"] = {"device": data["device"]}
                del data["device"]

            
            data["ocount"] = self.get_counts(f, global_db_origin_collection)
            data["pcount"] = self.get_counts(f, global_db_calc_collection)

            d["$set"] = data
            
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

    def check_and_calc(self, id, start, end, tunit):
        # find old result by id
        # try calc new
        # 
        f = {}
        f["id"] = id
        c = {"_id": 0, "loc.coordinates":1, "time":1, "distance":1}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_calc_collection)

            ## old time zone
            ## which already calc
            #if end:
            #    ## if newer time have result
            #    ## get old and then return
            #    f["time"] = {"$gte":end}
            #    r = collection.find(f, c).count()
            #    if r > 0:
            #        ## reset time limit start --> end
            #        f["time"] = {"$lte":end}
            #        if start:
            #            f["time"]["$gte"] = start
            #        r = collection.find(f, c).sort("time", pymongo.ASCENDING)
            #        ret = []
            #        for d in r:
            #            try:
            #                ret.append({"id": id,
            #                        "time": d["time"],
            #                        "latitude": d["loc"]["coordinates"][1],
            #                        "longitude": d["loc"]["coordinates"][0],
            #                        "distance": d["distance"]
            #                        })
            #            except Exception as e:
            #                # no key in d
            #                print("{0} --- {1}".format(__name__, e))
            #                pass
            #        print("debug return {0}".format("old calc enough"))
            #        return ret


            if start:
                f["time"] = {}
                f["time"]["$gte"] = start
            if end:
                if "time" not in f:
                    f["time"] = {}
                f["time"]["$lte"] = end

            ret = []
            new_ret = []
            max_time = ""

            ### push already calc
            #r = collection.find(f, c).sort("time", pymongo.ASCENDING)
            #for d in r:
            #    ret.append({"id": id,
            #                "time": d["time"],
            #                "latitude": d["loc"]["coordinates"][1],
            #                "longitude": d["loc"]["coordinates"][0],
            #                "distance": d["distance"]
            #                })
            #    if "time" in d and d["time"] > max_time:
            #        max_time = d["time"]

            ## calc new
            if max_time:
                if "time" not in f:
                    f["time"] = {}
                f["time"]["$gte"] = max_time
            origin_collection = db.get_collection(global_db_origin_collection)
            r = origin_collection.find(f, c).sort("time", pymongo.ASCENDING)
            origin_list = {}
            start_time = datetime.datetime.now()
            unit_time = 0
            try:
                unit_time = int(tunit)
            except Exception as e:
                unit_time = 0
            for d in r:
                if not d:
                    continue
                try:
                    minutes = string_time_to_unit(start_time, d["time"], unit_time)
                    if not minutes:
                        continue
                    if minutes not in origin_list:
                        origin_list[minutes] = []
                    origin_list[minutes].append(d)
                except Exception as e:
                    continue
                    pass
            for minutes in origin_list:
                r = self.zone_and_calc(origin_list[minutes], id, string_min_whole(minutes, start_time, unit_time))
                if r:
                    new_ret.append(r)
            if new_ret:
                ## calc record
                ## self.insert_calc_list(new_ret)
                for d in new_ret:
                    ret.append({"id": id,
                                "time": d["time"],
                                "latitude": d["loc"]["coordinates"][1],
                                "longitude": d["loc"]["coordinates"][0],
                                "distance": d["distance"]
                                })
            print("debug return {0}".format("365"))
            return ret
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))
            pass
        return None
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
        print(f)
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
    obj.producer(data)
    return True


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



