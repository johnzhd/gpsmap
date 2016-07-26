#!/bin/sh

# prepare

mkdir /tmp/uwsgi
mkdir /usr/share/gpsmap/
mkdir /usr/share/gpsmap/uwsgi
mkdir /usr/share/gpsmap/www
mkdir /usr/share/gpsmap/www/static
mkdir /usr/share/gpsmap/www/templates

# website
cp -f ./*.py              /usr/share/gpsmap/www/
cp -f ./templates/*.html  /usr/share/gpsmap/www/templates/
cp -f ./static/*.js       /usr/share/gpsmap/www/static/
cp -f ./static/*.css      /usr/share/gpsmap/www/static/
cp -f ./static/*.ico      /usr/share/gpsmap/www/static/


# uwsgi
cp -f ./system/emperor.ini /usr/share/gpsmap/uwsgi/emperor.ini
cp -f ./system/emperor.uwsgi.service  /etc/systemd/system/


# nginx
mv  /etc/nginx/conf.d/default.conf   /etc/nginx/conf.d/default.conf.bak
cp -f ./system/nginx.conf                      /etc/nginx/conf.d/


# mongodb
cp -f ./system/mongod.conf /etc/
mongod -f /etc/mongod.conf

mongo 127.0.0.1:27017/admin ./system/mongo_admin.js 
mongo 127.0.0.1:27017/gpsmap ./system/mongo_gpsmap.js 

pip install pymongo, utm
python ./db_build.py

mongod -f /etc/mongod.conf --shutdown
cp -f ./system/mongod_auth.conf /etc/mongod.conf


###





