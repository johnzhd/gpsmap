#!/bin/sh


### dir ###

# for uwsgi unix domain socket
onedir="/tmp/uwsgi"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi

# for base root path
onedir="/usr/share/gpsmap/"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi

# for website root
onedir="/usr/share/gpsmap/www/"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi

# for restful api root
onedir="/usr/share/gpsmap/backend/"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi

# for save log or other files
onedir="/usr/share/gpsmap/uwsgi/"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi

# for uwsgi config
onedir="/etc/uwsgi/"
if [ ! -d "$onedir" ]; then
  mkdir "$onedir"
fi


### uwsgi ###
systemctl stop emperor.uwsgi.service

cp -f ./emperor.ini           /etc/uwsgi/
cp -f ./emperor.uwsgi.service /etc/systemd/system/

systemctl daemon-reload

systemctl start emperor.uwsgi.service

### nginx update ###

if [ -f /etc/nginx/conf.d/default.conf ]; then
mv  /etc/nginx/conf.d/default.conf   /etc/nginx/conf.d/default.conf.bak
fi

cp -f ./nginx.conf                      /etc/nginx/conf.d/

nginx -s reload
