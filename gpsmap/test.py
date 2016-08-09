import backend
import json


'''
db.origin.insertMany(
[
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:52:52", "time" : "2016-07-20 05:57:28", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:54:04", "time" : "2016-07-20 05:57:11", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:54:33", "time" : "2016-07-20 05:57:40", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:54:53", "time" : "2016-07-20 05:57:02", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:55:28", "time" : "2016-07-20 05:57:38", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:56:10", "time" : "2016-07-20 05:57:19", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:57:18", "time" : "2016-07-20 05:57:27", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "600", "sendtime" : "2016-07-20 08:57:50", "time" : "2016-07-20 05:57:59", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.329431, 39.987562 ] }, "distance" : "500", "sendtime" : "2016-07-20 09:04:08", "time" : "2016-07-20 06:29:15", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.318238, 39.992275 ] }, "distance" : "900", "sendtime" : "2016-07-21 09:25:10", "time" : "2016-07-21 06:29:05", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.324167, 39.981723 ] }, "distance" : "400", "sendtime" : "2016-07-21 09:24:07", "time" : "2016-07-21 06:29:34", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.319909, 39.987404 ] }, "distance" : "400", "sendtime" : "2016-07-21 09:33:42", "time" : "2016-07-21 06:39:28", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.324167, 39.981723 ] }, "distance" : "600", "sendtime" : "2016-07-21 09:33:32", "time" : "2016-07-21 06:39:38", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.318238, 39.992275 ] }, "distance" : "800", "sendtime" : "2016-07-21 09:33:59", "time" : "2016-07-21 06:39:58", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.327185, 39.986664 ] }, "distance" : "400", "sendtime" : "2016-07-21 09:34:08", "time" : "2016-07-21 06:40:25", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.324167, 39.981723 ] }, "distance" : "600", "sendtime" : "2016-07-21 09:34:39", "time" : "2016-07-21 06:40:34", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.319909, 39.987404 ] }, "distance" : "400", "sendtime" : "2016-07-21 09:34:47", "time" : "2016-07-21 06:43:19", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" },
{ "loc" : { "type" : "Point", "coordinates" : [ 116.324167, 39.981723 ] }, "distance" : "600", "sendtime" : "2016-07-21 10:32:00", "time" : "2016-07-21 07:42:24", "id" : "v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger" }
])

'''
def debug():
    r = backend.unique_check_and_calc("v1_7f99fb00db30c87dc28a6c974440024b53eaae4f558397b11b62412d30c83e260e40f885b91573d9b9a8331849ef05df@stranger",
                                      None, None, "3600")
    print(r)


def debug_bulk():
    obj = {
        "sendtime":"2016-05-01 12:33:55",
        "latitude":"39.106947",
        "longitude":"117.178986",

        "device":"node0005",
        "items":[
            {"id":"AAAAAAAAAAAAAAAAAAAAAAAAAAnew", "distance":"50", "name":"AAAAAAAtestAAAAAAAAnew"},
            {"id":"AAAAAAAAAAAAAAAAAAAAAAAAAAnew1", "distance":"50", "name":"AAAAAAAtestAAAAAAAAnew1"},
            {"id":"AAAAAAAAAAAAAAAAAAAAAAAAAAnew2", "distance":"50", "name":"AAAAAAAtestAAAAAAAAnew2"},
            {"id":"AAAAAAAAAAAAAAAAAAAAAAAAAAnew3", "distance":"50", "name":"AAAAAAAtestAAAAAAAAnew3"},
            ]
        }
    j_str = json.dumps(obj, indent=None)
    r = backend.unique_push_data(j_str)


import calc_postion
def fretch(obj):
    return obj["latitude"], obj["longitude"], obj["distance"]
def debug_calc():
    obj = {"data": [{"latitude": 22.809071, "distance": "300", "sendtime": "2016-08-08 01:44:05", "longitude": 108.39813, "time": "2016-08-08 14:37:50"}, {"latitude": 22.807072, "distance": "200", "sendtime": "2016-08-08 01:43:29", "longitude": 108.40105, "time": "2016-08-08 14:37:13"}, {"latitude": 22.804624, "distance": "200", "sendtime": "2016-08-08 01:41:53", "longitude": 108.398022, "time": "2016-08-08 14:35:37"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 01:41:09", "longitude": 108.401292, "time": "2016-08-08 14:34:53"}, {"latitude": 22.807081, "distance": "100", "sendtime": "2016-08-08 01:40:07", "longitude": 108.398076, "time": "2016-08-08 14:33:52"}, {"latitude": 22.809071, "distance": "300", "sendtime": "2016-08-08 01:39:44", "longitude": 108.39813, "time": "2016-08-08 14:33:30"}, {"latitude": 22.807072, "distance": "200", "sendtime": "2016-08-08 01:38:57", "longitude": 108.40105, "time": "2016-08-08 14:32:42"}, {"latitude": 22.804624, "distance": "200", "sendtime": "2016-08-08 01:37:06", "longitude": 108.398022, "time": "2016-08-08 14:30:52"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 01:36:16", "longitude": 108.401292, "time": "2016-08-08 14:30:00"}, {"latitude": 22.807081, "distance": "100", "sendtime": "2016-08-08 01:35:40", "longitude": 108.398076, "time": "2016-08-08 14:29:24"}, {"latitude": 22.807072, "distance": "200", "sendtime": "2016-08-08 01:34:21", "longitude": 108.40105, "time": "2016-08-08 14:28:05"}, {"latitude": 22.809071, "distance": "100", "sendtime": "2016-08-08 01:06:30", "longitude": 108.39813, "time": "2016-08-08 14:00:14"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 01:05:47", "longitude": 108.40105, "time": "2016-08-08 13:59:32"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 01:03:19", "longitude": 108.401292, "time": "2016-08-08 13:57:04"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 01:01:25", "longitude": 108.40105, "time": "2016-08-08 13:55:10"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 12:59:05", "longitude": 108.401292, "time": "2016-08-08 13:52:50"}, {"latitude": 22.809071, "distance": "100", "sendtime": "2016-08-08 12:57:51", "longitude": 108.39813, "time": "2016-08-08 13:51:36"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 12:57:05", "longitude": 108.40105, "time": "2016-08-08 13:50:52"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 12:54:35", "longitude": 108.401292, "time": "2016-08-08 13:48:19"}, {"latitude": 22.809071, "distance": "100", "sendtime": "2016-08-08 12:53:22", "longitude": 108.39813, "time": "2016-08-08 13:47:07"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 12:52:40", "longitude": 108.40105, "time": "2016-08-08 13:46:25"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 12:50:20", "longitude": 108.401292, "time": "2016-08-08 13:44:05"}, {"latitude": 22.809071, "distance": "100", "sendtime": "2016-08-08 12:48:56", "longitude": 108.39813, "time": "2016-08-08 13:42:42"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 12:48:10", "longitude": 108.40105, "time": "2016-08-08 13:41:55"}, {"latitude": 22.805165, "distance": "400", "sendtime": "2016-08-08 12:45:48", "longitude": 108.401292, "time": "2016-08-08 13:39:32"}, {"latitude": 22.809071, "distance": "100", "sendtime": "2016-08-08 12:44:27", "longitude": 108.39813, "time": "2016-08-08 13:38:13"}, {"latitude": 22.807072, "distance": "400", "sendtime": "2016-08-08 12:43:49", "longitude": 108.40105, "time": "2016-08-08 13:37:33"}], "success": 1}
    data = obj["data"]
    try:
        sorted(data, lambda x,y: cmp(x["time"],y["time"]) )
    except Exception as e:
        print(e)
    calc_postion.calc_list(data, 50, fretch)

def debug_db_calc():
    data = [{u'distance': u'400', u'loc': {u'coordinates': [108.40105, 22.807072]}, u'time': u'2016-08-08 13:37:33'},
    {u'distance': u'100', u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 13:38:13'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 13:39:32'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 13:41:55'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 13:42:42'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 13:44:05'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 13:46:25'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 13:47:07'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 13:48:19'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 13:50:52'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 13:51:36'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 13:52:50'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 13:55:10'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 13:57:04'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 13:59:32'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 14:00:14'},
    {u'distance': u'200',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 14:28:05'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.398076, 22.807081]},
    u'time': u'2016-08-08 14:29:24'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 14:30:00'},
    {u'distance': u'200',
    u'loc': {u'coordinates': [108.398022, 22.804624]},
    u'time': u'2016-08-08 14:30:52'},
    {u'distance': u'200',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 14:32:42'},
    {u'distance': u'300',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 14:33:30'},
    {u'distance': u'100',
    u'loc': {u'coordinates': [108.398076, 22.807081]},
    u'time': u'2016-08-08 14:33:52'},
    {u'distance': u'400',
    u'loc': {u'coordinates': [108.401292, 22.805165]},
    u'time': u'2016-08-08 14:34:53'},
    {u'distance': u'200',
    u'loc': {u'coordinates': [108.398022, 22.804624]},
    u'time': u'2016-08-08 14:35:37'},
    {u'distance': u'200',
    u'loc': {u'coordinates': [108.40105, 22.807072]},
    u'time': u'2016-08-08 14:37:13'},
    {u'distance': u'300',
    u'loc': {u'coordinates': [108.39813, 22.809071]},
    u'time': u'2016-08-08 14:37:50'}]

    # o = backend.opt()
    # ret = o.check_and_calc_with_data(data, "3600", "00000002bd95bb252a7186330b228c3d8983552a")
    ret = backend.unique_check_and_calc("00000002bd95bb252a7186330b228c3d8983552a", None, None, "3600")
    print("Done.\n")
    print(ret)

if __name__ == "__main__":
    debug_db_calc()



