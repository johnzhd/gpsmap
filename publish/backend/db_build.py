import pymongo

import backend

def clear_db():
    connect = pymongo.MongoClient(backend.global_db_url)
    db = connect.get_database(backend.global_db_name)

    l = [backend.global_db_origin_collection,
            backend.global_db_user_collection,
            backend.global_db_device_collection,
            backend.global_db_calc_collection,
            backend.global_db_control_collection,
           ]
    for d in l:
        try:
            r = db.drop_collection(d)
        except Exception as e:
            print("{0} --- {1}".format(__name__, e))


def build_db():
    connect = pymongo.MongoClient(backend.global_db_url)
    db = connect.get_database(backend.global_db_name)
    try:
        r = db.create_collection(backend.global_db_origin_collection)
        collection = db.get_collection(backend.global_db_origin_collection)
        r = collection.ensure_index([("id", pymongo.ASCENDING)])
        r = collection.ensure_index([("time", pymongo.DESCENDING)])
        r = collection.ensure_index([("loc", pymongo.GEOSPHERE)])

    except Exception as e:
        print("{0} --- {1}".format(__name__, e))
    try:
        r = db.create_collection(backend.global_db_user_collection)
        collection = db.get_collection(backend.global_db_user_collection)
        r = collection.ensure_index([("id", pymongo.ASCENDING)])
        r = collection.ensure_index([("time", pymongo.DESCENDING)])
    except Exception as e:
        print("{0} --- {1}".format(__name__, e))

    try:
        r = db.create_collection(backend.global_db_device_collection)
        collection = db.get_collection(backend.global_db_device_collection)
        r = collection.ensure_index([("device", pymongo.ASCENDING)])
        r = collection.ensure_index([("time", pymongo.DESCENDING)])
        r = collection.ensure_index([("loc", pymongo.GEOSPHERE)])
    except Exception as e:
        print("{0} --- {1}".format(__name__, e))

    try:
        r = db.create_collection(backend.global_db_calc_collection)
        collection = db.get_collection(backend.global_db_calc_collection)
        r = collection.ensure_index([("id", pymongo.ASCENDING)])
        r = collection.ensure_index([("time", pymongo.DESCENDING)])
        r = collection.ensure_index([("loc", pymongo.GEOSPHERE)])
    except Exception as e:
        print("{0} --- {1}".format(__name__, e))

    try:
        r = db.create_collection(backend.global_db_control_collection)
        collection = db.get_collection(backend.global_db_control_collection)
        r = collection.ensure_index([(backend.global_key_sign, pymongo.ASCENDING)], unique=True)
        r = collection.ensure_index([("time", pymongo.DESCENDING)])
        r = collection.ensure_index([(backend.global_key_token, pymongo.ASCENDING)])
    except Exception as e:
        print("{0} --- {1}".format(__name__, e))

if __name__ == "__main__":
    clear_db()
    build_db()

