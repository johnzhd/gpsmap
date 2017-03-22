#!/bin/sh

basepath=$(cd `dirname $0`; pwd)

echo "$basepath"

systemctl stop emperor.uwsgi.service

baseRoot='/usr/share/gpsmap/'

if [ -d "$baseRoot" ]; then 
    echo "RM"
    rm -rf "$baseRoot"www
    rm -rf "$baseRoot"backend
else
    echo "MKDIR"
    mkdir "$baseRoot"
fi

cp -r "$basepath"/../www       "$baseRoot"
cp -r "$basepath"/../backend   "$baseRoot"


systemctl start emperor.uwsgi.service

nginx -s reload

