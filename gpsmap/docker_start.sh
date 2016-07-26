#!/bin/sh

# mongod
mongod -f /etc/mongod.conf


# uwsgi
systemctl start emperor.uwsgi.service

# nginx
nginx -s stop
nginx


