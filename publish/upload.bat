@echo off

if "%2" == "V" {

SET user=de
SET pass=de
SET ip=192.168.228.129
SET root=/home/de/gpsmap/
}

if "%2" == "101" {

SET user=root
SET pass=123456
SET ip=193.168.14.101
SET root=/root/gpsmap/
}


if "%1" == "n" (
python auto.py -n
)

if "%1" == "d" (
python auto.py -n -d
)


SET local=%ip%:%root%

del /F /Q .\www\*
del /F /Q .\backend\*

copy ..\resource\*.ico .\www\
copy ..\resource\*.png .\www\
copy ..\npm\dist\* .\www\
copy ..\backendold\*.py .\backend\

pscp -r -l %user% -pw %pass% ./system/    %local%system/
pscp -r -l %user% -pw %pass% ./www/       %local%www/
pscp -r -l %user% -pw %pass% ./backend/   %local%backend/




