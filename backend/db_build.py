from base import *

import pymongo

import db_const



def clear_database():
    connect = None
    try:
        connect = pymongo.MongoClient(db_const.global_db_url)
    except Exception as e:
        error_print(e)
    if not connect:
        return
    db = connect.get_database(db_const.global_db_name)
    for one in db_const.global_db_table_list:
        try:
            db.drop_collection(one)
        except Exception as e:
            error_print(e)

def index_database():
    connect = None
    try:
        connect = pymongo.MongoClient(db_const.global_db_url)
    except Exception as e:
        error_print(e)
    if not connect:
        return
    db = connect.get_database(db_const.global_db_name)

    for pair in db_const.global_db_table_list:
        collection = db.get_collection(pair[0])
        one = pair[1]
        for key in one:
            if not one[key]:
                continue
            index = [(key, one[key][0])]
            unique = one[key][1]
            try:
                collection.create_index(index, unique=unique)
            except Exception as e:
                error_print(e)


