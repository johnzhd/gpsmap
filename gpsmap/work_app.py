# -*- coding: utf-8 -*-
import calc_postion
import datetime

import backend
import json

import io

from flask import Flask, render_template, make_response
from flask import request
from flask_restful import reqparse, abort, Api, Resource


app = Flask(__name__)
api_loader = Api(app)

parser = reqparse.RequestParser()
for pa in ['la1', 'lo1', 'd1',
           'la2', 'lo2', 'd2',
           'la3', 'lo3', 'd3', 'EP', 'data', 'name', 'id',
           'start', 'end', 'tunit', 'count',
           'device', 'action', 'latitude', 'longitude']:
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

## Show Main page
@app.route('/', methods=['GET'])
def index():
    return html_template("index")

## For debug show demo page
@app.route('/demo', methods=['GET'])
def demo():
    return html("demo")

## Show calc points page
@app.route('/cpoints', methods=['GET'])
def cpoints():
    return html_template("cpoints")

## Show calc points page
@app.route('/opoints', methods=['GET'])
def opoints():
    return html_template("opoints")


## Show near points page
@app.route('/npoints', methods=['GET'])
def npoints():
    return html_template("npoints")



@app.route('/name', methods=['GET'])
def js_page():
    return html("name")




@app.route('/calc', methods=['GET'])
def calc():
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
        if not r:
            return '{"success": 0}'
        # calc
        return  '{{"success": 1, "la":{0}, "lo":{1}, "dis":{2} }}'.format( r[0], r[1], r[2] )
    except Exception as e:
        return '{"success": 0}'


@app.route("/upload", methods=['GET', 'POST'])
def upload():
    args = parser.parse_args()
    try:
        if 'data' not in args or not args['data']:
            return '{"success": 0}'
        if backend.unique_push_data(args['data']):
            return '{"success": 1}'
    except Exception as e:
        print("{0} {1}".format(__name__, e))
        pass
    return '{"success": 0}'


@app.route("/show", methods=['GET', 'POST'])
def show():
    args = parser.parse_args()
    try:
        ret = backend.unique_show_name(args['name'] or None)
        if ret:
            data = { "success": 1,
                    "data": ret}
            ret = json.dumps(data, indent= None)
            return ret
    except Exception as e:
        print("{0} {1}".format(__name__, e))
    return '{"success": 0}'



@app.route("/result", methods=['GET', 'POST'])
def result():
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
        print("{0} {1}".format(__name__, e))
        pass
    return '{"success": 0}'

@app.route("/near", methods=['GET', 'POST'])
def near():
    args = parser.parse_args()
    try:
        latitude = float(args['latitude'])
        longitude = float(args['longitude'])
        count = int(args['count'])
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
        print("{0} {1}".format(__name__, e))
        pass
    return '{"success": 0}'


@app.route("/origin", methods=['GET', 'POST'])
def origin():
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
        print("{0} {1}".format(__name__, e))
        pass
    return '{"success": 0}'

@app.route("/device", methods=['GET', 'POST'])
def device():
    args = parser.parse_args()

    a = 'get'
    if args['action']:
        a = args['action'].lower()
    if a == 'getall':
        ret = backend.unique_get_device_all()
        if ret:
            data = {"success": 1,
                    "data": ret}
            ret = json.dumps(data, indent=None)
            return ret
    if not args['device']:
        return '{"success": 0}'

    if a == 'set' and args['latitude'] and  args['longitude']:
        if backend.unique_set_device(args['device'], float(args['latitude']), float(args['longitude'])):
            return '{"success": 1}'
    elif a == 'delete':
        if backend.unique_delete_device(args['device']):
            return '{"success": 1}'
    else:
        ret = backend.unique_get_device(args['device'])
        if ret:
            data = {"success": 1,
                    "data": ret}
            ret = json.dumps(data, indent=None)
            return ret
    return '{"success": 0}'

@app.route("/becareful", methods=['GET', 'POST'])
def becareful():
    args = parser.parse_args()
    action = args["action"]
    name = args["name"]
    i = args["id"]
    if name != "IknowPasswoRd" or i != "RisIngRiRi":
        return '{"success": 0}'
    if action not in ["users", "device", "points"]:
        return '{"success": 0}'
    ret = backend.unique_delete_information(action)
    if ret:
        return '{"success": 1}'
    return '{"success": 0}'

