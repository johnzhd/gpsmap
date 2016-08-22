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
    data = {"data": [{"latitude": 39.98672, "distance": "400", "sendtime": "2016-08-09 10:26:33", "longitude": 116.326718, "time": "2016-08-09 11:20:18"}, {"latitude": 39.986699, "distance": "100", "sendtime": "2016-08-09 10:25:58", "longitude": 116.323305, "time": "2016-08-09 11:19:44"}, {"latitude": 39.987259, "distance": "400", "sendtime": "2016-08-09 10:22:15", "longitude": 116.320197, "time": "2016-08-09 11:16:01"}, {"latitude": 39.98672, "distance": "400", "sendtime": "2016-08-09 10:21:39", "longitude": 116.326718, "time": "2016-08-09 11:15:25"}, {"latitude": 39.986699, "distance": "100", "sendtime": "2016-08-09 10:21:03", "longitude": 116.323305, "time": "2016-08-09 11:14:49"}, {"latitude": 39.988288, "distance": "200", "sendtime": "2016-08-09 10:13:09", "longitude": 116.323161, "time": "2016-08-09 11:06:54"}, {"latitude": 39.987259, "distance": "400", "sendtime": "2016-08-09 10:12:37", "longitude": 116.320197, "time": "2016-08-09 11:06:25"}, {"latitude": 39.98672, "distance": "400", "sendtime": "2016-08-09 10:12:04", "longitude": 116.326718, "time": "2016-08-09 11:05:49"}, {"latitude": 39.984432, "distance": "300", "sendtime": "2016-08-09 10:10:53", "longitude": 116.323583, "time": "2016-08-09 11:04:38"}, {"latitude": 39.988288, "distance": "100", "sendtime": "2016-08-09 10:06:08", "longitude": 116.323161, "time": "2016-08-09 10:59:54"}, {"latitude": 39.98672, "distance": "500", "sendtime": "2016-08-09 10:05:08", "longitude": 116.326718, "time": "2016-08-09 10:58:53"}, {"latitude": 39.986699, "distance": "200", "sendtime": "2016-08-09 10:04:37", "longitude": 116.323305, "time": "2016-08-09 10:58:22"}, {"latitude": 39.984432, "distance": "400", "sendtime": "2016-08-09 10:04:10", "longitude": 116.323583, "time": "2016-08-09 10:57:56"}, {"latitude": 39.988288, "distance": "100", "sendtime": "2016-08-09 09:59:49", "longitude": 116.323161, "time": "2016-08-09 10:53:35"}, {"latitude": 39.987259, "distance": "500", "sendtime": "2016-08-09 09:59:21", "longitude": 116.320197, "time": "2016-08-09 10:53:06"}, {"latitude": 39.98672, "distance": "500", "sendtime": "2016-08-09 09:58:49", "longitude": 116.326718, "time": "2016-08-09 10:52:34"}, {"latitude": 39.986699, "distance": "200", "sendtime": "2016-08-09 09:58:16", "longitude": 116.323305, "time": "2016-08-09 10:52:01"}], "success": 1}


    data = data["data"]
    try:
        data = sorted(data, lambda x,y: cmp(x["time"],y["time"]) )
    except Exception as e:
        print(e)
    ret = calc_postion.calc_list(data, 50, fretch)
    print(ret)

def debug_update_user():
    ids = ["00060c8aa6448a1bcb83674c844ee70abcbf", "00064262a5ec66a35756390bac2ce83d299f"]
    opt = backend.get_unique_opt()
    print(opt.UpdateUser(ids))

def debug_db_calc():
    ret = backend.unique_check_and_calc("00000002619568b478c919385fa768c63ec9a3dc", None, None, "3600")
    print("Done.\n")
    print(ret)



def debug_one_calc():
    ids = ["00060c8aa6448a1bcb83674c844ee70abcbf", "00064262a5ec66a35756390bac2ce83d299f"]
    opt = backend.get_unique_opt()
    print(opt.calc_list_id(ids))

if __name__ == "__main__":
    debug_update_user()



