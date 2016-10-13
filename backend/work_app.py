# -*- coding: utf-8 -*-
import calc_postion
import datetime

import backend
import json

import io

from baselib import error_print

from flask import Flask, render_template, make_response
from flask import request
from flask_restful import reqparse, abort, Api, Resource


app = Flask(__name__)
api_loader = Api(app)

parser = reqparse.RequestParser()
for pa in ['la1', 'lo1', 'd1',
           'la2', 'lo2', 'd2',
           'la3', 'lo3', 'd3', 'EP',
           'data', 'name', 'id', 'task',
           'start', 'end', 'tunit', 'count',
           'device', 'action', 'latitude', 'longitude',
           'sign', 'gender', 'country', 'province', 'city',
           'ocount', 'pcount', 'distance'
           ]:
    parser.add_argument(pa)

def html_template(page):
    args = parser.parse_args()
    args['name_js'] = page + '.js'
    args['name_css'] = page + '.css'
    return render_template('points_template.html', **args)

def html(page):
    args = parser.parse_args()
    args['name_js'] = page + '.js'
    args['name_css'] = page + '.css'
    if not args["id"]:
        args["id"] = ''
    return render_template('template_html.html', **args)


def calc(unuse):
    args = parser.parse_args()
    try:
        la1 = float(args['la1'])
        lo1 = float(args['lo1'])
        d1 = float(args['d1'])
        la2 = float(args['la2'])
        lo2 = float(args['lo2'])
        d2 = float(args['d2'])
        la3 = float(args['la3'])
        lo3 = float(args['lo3'])
        d3 = float(args['d3'])
        EP = 100
        if args['EP']:
            EP = float(args['EP'])
        if not EP:
            EP = 100

        r = calc_postion.calc(la1, lo1, d1, la2, lo2, d2, la3, lo3, d3, EP)
        if r:
            return  '{{"success": 1, "la":{0}, "lo":{1}, "dis":{2} }}'.format( r[0], r[1], r[2] )
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


def upload(unuse):
    args = parser.parse_args()
    try:
        if 'data' not in args or not args['data']:
            return '{"success": 0}'
        if backend.unique_push_data(args['data']):
            return '{"success": 1}'
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


def show(unuse):
    args = parser.parse_args()
    try:
        ret = backend.unique_show_search(args)
        if ret:
            data = { "success": 1,
                    "data": ret}
            ret = json.dumps(data, indent= None)
            return ret
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


def result(unuse):
    args = parser.parse_args()
    if 'id' not in args or not args['id']:
        return '{"success": 0}'
    try:
        ret = backend.unique_check_and_calc(args['id'], args['start'], args['end'], args['tunit'])
        if ret:
            data = {"success": 1,
                    "data": ret}
            ret = json.dumps(data, indent=None)
            return ret
    except Exception as e:
        error_print(e)
    return '{"success": 0}'

def near(unuse):
    args = parser.parse_args()
    try:
        latitude = float(args['latitude'])
        longitude = float(args['longitude'])
        count = int(args['distance'])
        if not count:
            count = 20
        if latitude and longitude:
            ret = backend.unique_NearPoint(latitude,longitude, count)
            if ret:
                data = {"success": 1,
                    "data": ret}
                ret = json.dumps(data, indent=None)
                return ret
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


def origin(unuse):
    args = parser.parse_args()
    if 'id' not in args or not args['id']:
        return '{"success": 0}'
    try:
        ret = backend.unique_origin_points(args['id'], args['start'], args['end'])
        if ret:
            data = {"success": 1,
                    "data": ret}
            ret = json.dumps(data, indent=None)
            return ret
    except Exception as e:
        error_print(e)
    return '{"success": 0}'



def default_value(value, default, b):
    if value is None or len(value) == 0:
        return default
    if b:
        return value.lower()
    return value
    



def device(unuse):
    ##### 
    ##### 
    args = parser.parse_args()
    a = default_value(args['action'], 'get', True)
    task = default_value(args['task'], "node", False)
    ret = None
    if a == 'setall':
        ret = backend.unique_setall_device(task, args['data'])
    elif a == 'getall':
        ret = backend.unique_get_device_all(task)
    elif a == 'set':
        if args['device'] and args['latitude'] and args['longitude']:
            ret = backend.unique_set_device(task, args['device'], float(args['latitude']), float(args['longitude']))
    elif a == 'delete':
        if args['device']:
            ret = backend.unique_delete_device(task, args['device'])
    else:
        if args['device']:
            ret = backend.unique_get_device(task, args['device'])

    if ret:
        data = {"success": 1,
                "data": ret}
        try:
            ret = json.dumps(data, indent=None)
            return ret
        except Exception as e:
            error_print(e)
    return '{"success": 0}'

def becareful(unuse):
    args = parser.parse_args()
    action = args["action"]
    name = args["name"]
    i = args["id"]
    if name != "IknowPasswoRd" or i != "RisIngRiRi":
        return '{"success": 0}'
    if action not in ["users", "device", "points"]:
        return '{"success": 0}'
    try:
        ret = backend.unique_delete_information(action)
        if ret:
            return '{{"success": 1, "data": {0} }}'.format(ret)
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


def get_country_list(unuse):
    args = parser.parse_args()
    try:
        ret = backend.unique_Country(args['country'], args['province'], args['city'],
            args['start'], args['end'])
        if ret:
            data = {"success": 1,
                    "data": ret}
            ret = json.dumps(data, indent=None)
            return ret
    except Exception as e:
        error_print(e)
    return '{"success": 0}'




#main enter

global_main_enter = {}
# calc points /  origin points / near points / device points / 
for key in ["cpoints", "opoints", "npoints", "dpoints"]:
    global_main_enter[key] = html_template

for key in ["name", "baidumap"]:
    global_main_enter[key] = html

global_main_enter["calc"] = calc
global_main_enter["upload"] = upload
global_main_enter["show"] = show
global_main_enter["result"] = result
global_main_enter["near"] = near
global_main_enter["origin"] = origin
global_main_enter["device"] = device
global_main_enter["becareful"] = becareful
global_main_enter["country"] = get_country_list

## Show Main page
@app.route('/', methods=['GET'])
def index():
    return html_template("index")

@app.route("/api/<action>", methods=['GET', 'POST'])
def enter(action):
    try:
        action = action.lower()
    except Exception as e:
        error_print(e)
        abort(404)
        return
    if action not in global_main_enter:
        abort(404)
        return
    function = global_main_enter[action]
    return function(action)
