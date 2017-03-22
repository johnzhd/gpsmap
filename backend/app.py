from base import error_print
import db_enter
import json


from flask import Flask, render_template, make_response
from flask import request
from flask_restful import reqparse, abort, Api, Resource


app = Flask(__name__)
api_loader = Api(app)

app_parser = reqparse.RequestParser()
for key in ['EP', 'data', 'name', 'id',
           'start', 'end', 'tunit', 'count',
           'device', 'action', 'latitude', 'longitude']:
    app_parser.add_argument(key)

def html(name, page):
    args = app_parser.parse_args()
    args['name_js'] = name + '.js'
    args['name_css'] = name + '.css'
    if not args["id"]:
        args["id"] = ''
    return render_template(page, **args)


def UItoObject(ui):
    try:
        obj = json.loads(ui)
        return obj
    except Exception as e:
        error_print(e)
    return None

def ObjectToUI(obj):
    try:
        if obj is None:
            return '{"success": 0}'
        tmp = {"success": 1, "data": obj}
        ui = json.dumps(tmp)
        if ui:
            return ui
    except Exception as e:
        error_print(e)
    return '{"success": 0}'


@app.route("/", methods=['GET','POST'])
def index():
    return html("index", "template_html.html")


@app.route("/api/<name>", method=['GET','POST'])
def enter(name):
    args = app_parser.parse_args()
    try:
        obj = None
        if args["data"] is not None:
            obj = UItoObject(args["data"])
        if not obj:
            return '{"success": 0}'
        ret = db_enter.enter(name, obj)
        return ObjectToUI(ret)
    except Exception as e:
        error_print(e)
    return '{"success": 0}'
