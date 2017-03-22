
import pymongo

import md5

import Queue
import threading


from db_const import *
from base import error_print








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

class opt():
    def __init__(self):
        self.connect = pymongo.MongoClient(global_db_url)
        self.queue = Queue.Queue()
        self.mutex = threading.Lock()
        self.thread = None
        self.entertable = {
            'update':{"enter": self.update, "check": []}
        }
    def enter(self, name, obj):
        if name not in self.entertable:
            return None
        one = self.entertable[name]
        for key in one["check"]:
            if obj[key] is None:
                return None
        return one["enter"](obj)
    def bulk_opt(self, collection, db, coll):
        try:
            if not coll:
                if not db:
                    db = self.connect.get_database(global_db_name)
                coll = db.get_collection(collection)
            bulk = coll.initialize_unordered_bulk_op()
            return bulk
        except Exception as e:
            error_print(e)
        return None
    def bulk_update(self, obj):
        '''
        '''
    def update(self, obj):
        pass


###################### Enter ###########################

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
    global_unique_opt_obj_mx.release()
    return global_unique_opt_obj

def enter(name, obj):
    try:
        one = get_unique_opt()
        if not one:
            return None
        return one.enter(name, obj)
    except Exception as e:
        error_print(e)
    return None