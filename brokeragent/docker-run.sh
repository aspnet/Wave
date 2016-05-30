#!/bin/bash

if [ "$#" -ne 7 ]; then
    echo "Usage: ./docker-run.sh {hostname} {admin-password} {readuser-password} {broker} {port} {username} {password}"
    exit 1
fi

_HOSTNAME=$1
_ADMINPWD=$2
_READPWD=$3
_BROKER=$4
_PORT=$5
_USERNAME=$6
_PASSWORD=$7
docker stop $_HOSTNAME
docker rm $_HOSTNAME
_CONTAINERID=$(docker run --name $_HOSTNAME -p 1883-1884:1883-1884/tcp -e ADMINPWD=$_ADMINPWD -e READPWD=$_READPWD -e BROKER=$_BROKER -e PORT=$_PORT -e USERNAME=$_USERNAME -e PASSWORD=$_PASSWORD -h $_HOSTNAME -d dotnetperf/brokeragent) 
sleep 3 
docker logs $_CONTAINERID
