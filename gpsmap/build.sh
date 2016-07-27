#!/bin/sh

## system 

curl http://mirrors.aliyun.com/repo/Centos-7.repo | grep -v aliyuncs > /etc/yum.repos.d/CentOS-Base.repo

cp -f ./system/nginx.repo    /etc/yum.repos.d/
cp -f ./system/mongodb.repo  /etc/yum.repos.d/

yum makecache

yum install -y mongodb-org

yum install -y nginx

## python

yum -y groupinstall  "Development Tools"
yum -y install python-devel


mkdir ~/buildtemp/
curl https://bootstrap.pypa.io/get-pip.py > ~/buildtemp/get-pip.py
python ~/buildtemp/get-pip.py

pip install uwsgi
pip install Flask
pip install Flask_restful

pip install pymongo
pip install utm


## project
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

python ./db_build.py

mongod -f /etc/mongod.conf --shutdown
cp -f ./system/mongod_auth.conf /etc/mongod.conf


###

systemctl start mongod
chkconfig mongod on

systemctl start emperor.uwsgi.service
systemctl enabled emperor.uwsgi.service


