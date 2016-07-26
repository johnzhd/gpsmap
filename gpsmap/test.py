import backend



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


if __name__ == "__main__":
    debug()



