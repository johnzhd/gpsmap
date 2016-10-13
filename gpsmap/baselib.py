import sys


def error_print(e):
    if not e:
        return
    print("{0} --- {1}".format(sys._getframe(1).f_code.co_name, e))

