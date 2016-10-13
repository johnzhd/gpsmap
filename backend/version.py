try:
    import queue as vQueue
except Exception as e:
    import Queue as vQueue


try:
    import hashlib
    def createMD5():
        return hashlib.md5()
except Exception as e:
    import md5
    def createMD5():
        return md5.new()

