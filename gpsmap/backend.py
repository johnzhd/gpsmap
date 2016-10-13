import pymongo


import datetime
import json

import Queue
import threading
import time

import calc_postion
from pprint import pprint

import md5

from baselib import error_print


global_db_name = "gpsmapName"
global_db_url = "mongodb://gpsmap:gpsmap@127.0.0.1:27017/"+global_db_name

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
global_key_img = "img"
global_key_gender = "gender"
global_key_device = "device"

global_default_base_time = datetime.datetime(1970,1,1,0,0,0,0)
global_default_uint_time = 60 * 10


global_care_keys = [global_key_la, global_key_lo, global_key_list, global_key_sendtime]

global_origin_keys = [global_key_uid, global_key_la, global_key_lo, global_key_sendtime, global_key_dis]

'''
origin:
  _id: obj()
  loc:
    type: "Point"
    coordinates: []
  distance: "300"
  sendtime: "2016-01-01 01:01:01"
  time: "2016-01-01 01:01:01"
  id : "string"

calc:
  _id: obj()
  id: "string"
  time: "2016-01-01 01:01:01"
  loc:
    type: "Point"
    coordinates: []
  distance: "300"
  level: 0 unused
         1 High
         ...
         5 Low


'''


def md5String(s):
    try:
        s = s.encode(encoding="utf-8")
        return md5.new(s).hexdigest()
    except Exception as e:
        error_print(e)
        return None

def CreateUID(obj):
    '''
    change to use name md5
    '''
    ## global_key_uid
    ## global_key_img
    md5key_list = [global_key_name]

    try:
        m = md5.new()
        ret = ""
        for key in md5key_list:
            if key not in obj:
                return obj[global_key_uid]
            value = obj[key].encode(encoding="utf-8")
            m.update(value)
            ret += "{0:04d}".format(len(value))

        ret_m = m.hexdigest()
        if not ret_m:
            return obj[global_key_uid]
        return ret + ret_m
    except Exception as e:
        error_print(e)
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
    de = datetime.timedelta(seconds = s * tunit)
    return time_format(start + de)

def fretch_gps_from_data(data):
    try:
        return data["loc"]["coordinates"][1], data["loc"]["coordinates"][0], int(data["distance"])
    except Exception as e:
        return None, None, None

class opt():
    def __init__(self):
        self.connect = pymongo.MongoClient(global_db_url)
        self.queue = Queue.Queue()
        self.mutex = threading.Lock()
        self.thread = None
    def Start_Calc_Thread(self):
        if self.mutex.acquire():
            if not self.thread or not self.thread.is_alive():
                self.thread = None
                self.thread = threading.Thread(target=self.ThreadCore)
                self.thread.start()
            self.mutex.release()
    def ThreadCore(self):
        print("In Core.")
        while not self.queue.empty():
            try:
                ids = self.queue.get(False)
                print("Check ids {0}.".format(len(ids)))
                n = self.calc_list_id(ids)
                print("Update ids {0}.".format(n))
                n = self.UpdateUser(ids)
                print("Update users {0}.".format(n))
            except Exception as e:
                break
        print("Quit Core.")

    def producer(self, data):
        # self.queue.put(data)
        # return true

        obj = self.produce_obj(data)
        if not obj:
            return None
        if global_key_la not in obj or global_key_lo not in obj or global_key_list not in obj:
            return None
        return self.producer_action(obj)
    def producer_action(self, obj):
        try:
            count = self.produce_bulk(obj, global_db_origin_collection, global_db_user_collection )
            return count
        except Exception as e:
            error_print(e)
            print(obj)
            pass
        return None
    def produce_obj(self, data):
        try:
            obj = json.loads(data)
            return obj
        except Exception as e:
            error_print(e)
            return None
    def produce_bulk(self, obj, opoints, users):
        if not obj:
            return None
        db = self.connect.get_database(global_db_name)
        o_coll = db.get_collection(opoints)
        u_coll = db.get_collection(users)
        o_bulk = o_coll.initialize_unordered_bulk_op()
        u_bulk = u_coll.initialize_unordered_bulk_op()

        ids = set()

        for origin in self.parser_obj(obj):
            data = self.produce_insert_origin(origin)
            if not data:
                continue
            o_bulk.insert( data )

            ids.add(data[global_key_uid])

            f, d = self.produce_update_user(origin)
            if not f or not d:
                continue

            u_bulk.find(f).upsert().update(d)

        self.start_calc_ids(list(ids))

        result = o_bulk.execute()
        count = result['nInserted']
        result = u_bulk.execute()
        # count = result['nUpserted'] + result['nModified']
        return count > 0
    def produce_insert_origin(self, origin):
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
    def produce_update_user(self, origin):
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
    def standardize_data(self, origin):
        if "sex" in origin:
            value = int(origin["sex"])
            del origin["sex"]
            try:
                if value == 1:
                    origin[global_key_gender] = "male"
                elif value == 2:
                    origin[global_key_gender] = "female"
                else:
                    origin[global_key_gender] = "none"
            except Exception as e:
                origin[global_key_gender] = "none"
        return origin
    def parser_obj(self, obj):
        for key in global_care_keys:
            if key not in obj:
                return
        if not obj[global_key_list]:
            return
        unique = {}
        unique[global_key_sendtime] = obj[global_key_sendtime]
        unique[global_key_la] = obj[global_key_la]
        unique[global_key_lo] = obj[global_key_lo]
        if global_key_device in obj:
            unique[global_key_device] = obj[global_key_device]
        for one in obj[global_key_list]:
            if global_key_dis not in one:
                continue

            uid = CreateUID(one)
            if not uid:
                continue

            ret = unique.copy()
            ret.update(one)
            ret[global_key_uid] = uid
            yield self.standardize_data(ret)

    def get_origin_points_data_from_db(self, i, start, end):
        f = {"id": i}
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
            error_print(e)
        return ret


    def cut_list_by_time(self, data, tunit):
        origin_list = {}
        base_time = global_default_base_time

        sorted(data, key=lambda x: x["time"])

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
            tunit = global_default_uint_time

        dic_data, base_time = self.cut_list_by_time(data, tunit)
        if not dic_data:
            return None


        new_ret = {}
        for minutes in dic_data:
            key = string_min_whole(minutes + 1, base_time, tunit)

            r = self.zone_and_calc(dic_data[minutes], id, key)
            new_ret[key] = r
        
        return new_ret
    def translate_calc_to_ui(self, new_ret, i):
        ret = []
        for key in new_ret:
            if not new_ret[key]:
                continue
            d = new_ret[key]
            ret.append({global_key_uid: i,
                                "time": d["time"],
                                "latitude": d["loc"]["coordinates"][1],
                                "longitude": d["loc"]["coordinates"][0],
                                "distance": d["distance"]
                                })
        return ret
    def check_and_calc(self, i, start, end, tunit):
        data = self.get_origin_points_data_from_db(i, start, end)
        if not data:
            return None

        ret = self.check_and_calc_with_data(data, tunit, i)
        if not ret:
            return None

        return self.translate_calc_to_ui(ret, i)

    def zone_and_calc(self, l, i, tm):
        if len(l) < 3:
            return None
        r = calc_postion.calc_list(l, global_EP, fretch_gps_from_data)
        if r:
            ret = {}
            ret[global_key_uid] = i
            ret["loc"] = {"type": "Point", "coordinates" : [r[1], r[0]]}
            ret["distance"] = r[2]
            ret["time"] = tm
            ret["level"] = r[3]
            return ret
        return None

    def start_calc_ids(self, ids):
        # push in Queue
        # in no threading
        # start threading
        if not ids:
            return
        self.queue.put(ids)
        self.Start_Calc_Thread()

    def calc_list_id(self, ids):
        tunit = global_default_uint_time
        db = self.connect.get_database(global_db_name)
        u_coll = db.get_collection(global_db_calc_collection)
        u_bulk = u_coll.initialize_unordered_bulk_op()
        count = 0
        for i in ids:
            if not i:
                continue
            ret = self.calc_one_id(i, u_coll, u_bulk, tunit)
            if ret:
                count += ret
        if count > 0:
            try:
                result = u_bulk.execute()
                count = result['nUpserted'] + result['nModified']
                return count
            except Exception as e:
                error_print(e)
        return None
    def calc_one_id(self, i, u_coll, u_bulk, tunit):
        last_time = None
        try:
            it = u_coll.find({global_key_uid: i}, {"_id":0, "time": 1}).sort("time", pymongo.DESCENDING).limit(1)
            for one in it:
                last_time = one["time"]
        except Exception as e:
            return None

        data = self.get_origin_points_data_from_db(i, last_time, None)
        if not data or len(data) < 3:
            return None

        ret = self.check_and_calc_with_data(data, tunit, i)

        try:
            max = len(ret)
            count = 0

            for key in ret:
                count += 1
                d = ret[key]

                f = {global_key_uid: i, "level": 0, "time": key}

                if not d:
                    if count >= max: ## In the last time zone, We won't insert None to db
                        count -= 1
                        break
                    d = f
                u_bulk.find(f).upsert().update_one({"$set": d})
                d = None
                f = None
            return count
        except Exception as e:
            error_print(e)
        return None

    def UpdateUser(self, ids):
        db = self.connect.get_database(global_db_name)
        uniset = {}
        try:
            t_coll = db.get_collection(global_db_origin_collection)
            for i in ids:
                if i not in uniset:
                    uniset[i] = {}
                else:
                    continue
                f = {"id": i}
                n = t_coll.find(f).count()
                uniset[i]["ocount"] = n
            t_coll = db.get_collection(global_db_calc_collection)
            for key in uniset:
                f = {"id": key}
                n = t_coll.find(f).count()
                uniset[key]["pcount"] = n

            t_coll = db.get_collection(global_db_user_collection)
            u_bulk = t_coll.initialize_unordered_bulk_op()
            for key in uniset:
                u_bulk.find({"id": key}).update({"$set": uniset[key]})
            result = u_bulk.execute()
            count =  result['nModified']
            return count
        except Exception as e:
            error_print(e)
        return None


    def NearPoint(self, lat, lng, count):
        if not count:
            count = 20
        point = {"type": "Point", "coordinates": [lng, lat]}
        f = {"loc": {"$near": {"$geometry": point}}}
        c = {"_id": 0, "loc":1, "id": 1, "time": 1, "level": 1, "distance": 1}
        db = self.connect.get_database(global_db_name)
        coll = db.get_collection(global_db_calc_collection)
        it = coll.find(f, c) ## sort by $near
        ret = {}
        for one in it:
            if len(ret) >= count:
                break
            try:
                if one['id'] not in ret:
                    ret[one['id']] = one
                    continue
                if one['level'] > 0 and one['level'] < ret[one['id']]['level']:
                    ret[one['id']] = one
                    continue
                if one['time'] > ret[one['id']]['time']:
                    ret[one['id']] = one
                    continue
            except Exception as e:
                continue
        if not ret:
            return None

        c = {"_id": 0, "name": 1, "time": 1, "id": 1, "ocount": 1, "pcount": 1,
            "img":1, "sign": 1, global_key_gender: 1}
        coll = db.get_collection(global_db_user_collection)
        for key in ret:
            tmp = ret[key]
            ret[key] = {global_key_uid: key,
                                "time": tmp["time"],
                                "latitude": tmp["loc"]["coordinates"][1],
                                "longitude": tmp["loc"]["coordinates"][0],
                                "distance": tmp["distance"]
                                }
            f = {"id": key}
            try:
                it = coll.find(f, c).sort("time", pymongo.DESCENDING).limit(1)
                for one in it:
                    ret[key].update(one)
            except Exception as e:
                pass
        if ret:
            tmp = []
            for key in ret:
                tmp.append(ret[key])
            ret = tmp
        return ret
        ## update by user


    '''
    UI action
    '''
    def create_filter_for_user(self, obj):
        regex_list = ["name", "sign", "province", "city"]
        bool_list = {"country": "CN"}
        select_list = {"gender": ("female", "male")}
        match_list = ["id", "device"]
        gte_list = ["ocount", "pcount"]
        time_list = ["start", "end"]

        for key in ["ocount", "pcount"]:
            if key in obj and obj[key] is not None:
                obj[key] = int(obj[key])

        f = {}
        for key in obj:
            if not obj[key]:
                continue
            if key in regex_list:
                f[key] = {'$regex': obj[key], '$options': "i"}
                continue
            if key in bool_list:
                if obj[key] == bool_list[key]:
                    f[key] = obj[key]
                else:
                    f[key] = {"$not": {"$eq": bool_list[key]}}
                continue
            if key in select_list:
                try:
                    s = str(obj[key]).lower()
                    if s in select_list[key]:
                        f[key] = s
                except Exception as e:
                    pass
                continue
            if key in match_list:
                 f[key] = obj[key]
                 continue
            if key in gte_list:
                f[key] = {"$gte": obj[key]}
                continue
            if key in time_list:
                obj[key] = string_standard(obj[key])
                if "time" not in f:
                    f["time"] = {}
                if key == "start":
                    f["time"]["$gte"] = obj[key]
                elif key == "end":
                    f["time"]["$lte"] = obj[key]
                continue
        return f
    def create_row_for_user(self):
        return {"_id": 0,
            "name": 1, "time": 1, "id": 1,
            "device": 1, "ocount": 1, "pcount": 1,
            "country":1, "province":1, "city":1,
            "img":1, "sign": 1, global_key_gender: 1}
    def show_search(self, obj):
        f = self.create_filter_for_user(obj)
        c = self.create_row_for_user()
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_user_collection)
            r = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            for d in r:
                ret.append(d)
            return ret
        except Exception as e:
            error_print(e)
        return None

    def show_name(self, name):
        f = self.create_filter_for_user({"name": name})
        c = self.create_row_for_user()
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_user_collection)
            r = collection.find(f, c).sort("time", pymongo.DESCENDING)
            ret = []
            for d in r:
                ret.append(d)
            return ret
        except Exception as e:
            error_print(e)
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
                if "loc" in d and "coordinates" in d["loc"] and len(d["loc"]["coordinates"]) > 1:
                    tmp["latitude"] = d["loc"]["coordinates"][1]
                    tmp["longitude"] = d["loc"]["coordinates"][0]
                else:
                    continue
                if "time" in d:
                    tmp["time"] = d["time"]
                else:
                    continue

                if "sendtime" in d:
                    tmp["sendtime"] = d["sendtime"]
                if "distance" in d:
                    tmp["distance"] = d["distance"]
                
                ret.append(tmp)
            return ret
        except Exception as e:
            error_print(e)
        return None
    def origin_points_uni(self, id, start, end):
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

            uniset = {}
            min_time = None
            for d in r:
                tmp = {}
                if "loc" in d and "coordinates" in d["loc"] and len(d["loc"]["coordinates"]) > 1:
                    tmp["latitude"] = d["loc"]["coordinates"][1]
                    tmp["longitude"] = d["loc"]["coordinates"][0]
                else:
                    continue
                if "time" in d:
                    tmp["time"] = d["time"]
                else:
                    continue

                if "sendtime" in d:
                    tmp["sendtime"] = d["sendtime"]
                if "distance" in d:
                    tmp["distance"] = d["distance"]
                
                if not min_time or min_time["time"] > tmp["time"]:
                    min_time = tmp;

                if (tmp["latitude"], tmp["longitude"]) not in uniset or uniset[(tmp["latitude"], tmp["longitude"])]["time"] < tmp["time"]:
                    uniset[(tmp["latitude"], tmp["longitude"])] = tmp;

            ret = []
            if min_time:
                if  (min_time["latitude"], min_time["longitude"]) in uniset and uniset[(min_time["latitude"], min_time["longitude"])]["time"] == min_time["time"]:
                    del uniset[(min_time["latitude"], min_time["longitude"])]
                ret.append(min_time)

            for one in uniset.itervalues():
                ret.append(one)
            return ret
        except Exception as e:
            error_print(e)
        return None


    '''
    Device Action
    '''

    def set_device(self, task, device, la, lo):
        f = {"device": device, "task": task}
        data ={"$set": {"device": device,
                        "loc": {"type": "Point", "coordinates" : [lo, la]},
                        "time": time_now()} }
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            r = collection.update_one(f, data, True)
            return r.modified_count or r.upserted_id
        except Exception as e:
            error_print(e)
        return None

    def device_obj(self, task, data):
        try:
            obj = json.loads(data)
            tmp = []
            task_len = len(task)
            max_name = ''
            name = "!"
            for one in obj:
                if "latitude" not in one or "longitude" not in one:
                    continue
                name = "!"
                if "device" in one and one["device"][0:task_len] == task:
                    name = str(one["device"])
                    if max_name < name:
                        max_name = name
                tmp.append((name, one["latitude"], one["longitude"]))
            tmp = sorted(tmp, key=lambda x: x[0])
            number = 0
            if max_name:
                try:
                    number = int(max_name[task_len:])
                except Exception as e:
                    error_print(e)
                    pass
            if number < 1:
                number = 1
            else:
                number += 1
            ret = {}
            
            for one in tmp:
                name = one[0]
                if name in ret or name == "!":
                    name = "{0}{1:04d}".format(task, number)
                    number += 1
                ret[name] = (one[1], one[2])
            return ret
        except Exception as e:
            error_print(e)
            pass
        return None

    def setall_device(self, task, data):
        # find all task point
        # loop data
        # bulk insert update delete
        # 
        # 
        obj = self.device_obj(task, data)
        if not obj:
            if data is None:
                return None
            ### remove all
            return self.delete_all_device(task)
        f = {"task": task}
        c = {"_id": 1, "device": 1, "loc": 1, "time": 1}
        action = []
        db = self.connect.get_database(global_db_name)
        collection = db.get_collection(global_db_device_collection)
        bulk = collection.initialize_unordered_bulk_op()
        it = collection.find(f, c).sort("time", pymongo.DESCENDING)
        count = 0
        for one in it:
            if "device" not in one or one["device"] not in obj:
                bulk.find({"_id": one["_id"]}).remove()
                count += 1
                continue
            tmp = obj[one["device"]]
            data = {
                "$set": {
                    "device": one["device"],
                    "loc":{"type": "Point", "coordinates": [tmp[1], tmp[0]]},
                    "time": time_now(),
                    "task": task
                    }
                }
            bulk.find({"_id": one["_id"]}).upsert().update(data)
            count += 1
            del obj[one["device"]]
        for key in obj:
            data = {
                "device": key,
                "loc": {"type": "Point", "coordinates": [obj[key][1], obj[key][0]]},
                "time": time_now(),
                "task": task
                }
            bulk.insert(data)
            count += 1
        result = bulk.execute()
        count = result['nInserted'] +  result['nUpserted'] + result['nModified'] + result['nRemoved']
        if count:
            return self.get_device_all(task)
        return None
    def get_device(self, task, device):
        f = {"device": device, "task": task}
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
            error_print(e)
        return None
    def delete_device(self, task, device):
        f = {"device": device, "task": task}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            return collection.delete_one(f).deleted_count > 0
        except Exception as e:
            error_print(e)
        return None
    def delete_all_device(self, task):
        f = {"task": task}
        try:
            db = self.connect.get_database(global_db_name)
            collection = db.get_collection(global_db_device_collection)
            return collection.delete_many(f).deleted_count
        except Exception as e:
            error_print(e)
        return None
    def get_device_all(self, task):
        f = {"task": task}
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
            error_print(e)
        return None
    def delete_information(self, t):
        if not t:
            return None
        try:
            db = self.connect.get_database(global_db_name)
            count = 0
            collection = None
            if t == "users":
                collection = db.get_collection(global_db_user_collection)
            elif t == "device":
                collection = db.get_collection(global_db_device_collection)
            elif t == "points":
                collection = db.get_collection(global_db_origin_collection)
            elif t == "result":
                collection = db.get_collection(global_db_calc_collection)
            if not collection:
                return count
            result = collection.delete_many({})
            if result:
                count = result.deleted_count
            return count
        except Exception as e:
            error_print(e)
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
            error_print(e)
            pass
    global_unique_opt_obj_mx.release()
    return global_unique_opt_obj

def unique_push_data(data):
    obj = get_unique_opt()
    if not obj:
        return None
    return obj.producer(data)


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




def unique_show_name(name):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.show_search({"name":name})
    return ret

def unique_show_search(args):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.show_search(args)
    return ret

def unique_set_device(task, device, la, lo):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.set_device(task, device, la, lo)
    return ret

def unique_setall_device(task, data):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.setall_device(task, data)
    return ret

def unique_get_device(task, device):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.get_device(task, device)
    return ret

def unique_get_device_all(task):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.get_device_all(task)
    return ret

def unique_delete_device(task, device):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.delete_device(task, device)
    return ret

def unique_delete_information(t):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.delete_information(t)
    return ret


def unique_NearPoint(lat, lng, count):
    obj = get_unique_opt()
    if not obj:
        return None
    ret = obj.NearPoint(lat, lng, count)
    return ret
