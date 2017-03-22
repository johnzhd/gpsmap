import sys

import hashlib


def error_print(e):
    if not e:
        return
    print("{0} --- {1}".format(sys._getframe(1).f_code.co_name, e))

def hashOne(data):
    h = hashlib.new('sha256')
    h.update(data)
    return h.hexdigest()



