import sys
import md5
import datetime


global_timeformat_string = "%Y-%m-%d %H:%M:%S"
global_timeformat_string_minutes = "%Y-%m-%d %H:%M"



def funcname():
    return sys._getframe().f_code.co_name

def error_print(e):
    if not e:
        return
    print("{0} --- {1}".format(sys._getframe(1).f_code.co_name, e))



def md5String(s):
    try:
        s = s.encode(encoding="utf-8")
        return md5.new(s).hexdigest()
    except Exception as e:
        error_print(e)
        return None




def time_to_string(date):
    try:
        return date.strftime(global_timeformat_string)
    except Exception as e:
        return None

def string_to_time(s):
    try:
        return datetime.datetime.strptime(s, global_timeformat_string)
    except Exception as e:
        return None

def now_string():
    return time_to_string(datetime.datetime.now())

