#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Usage: ./docker-run.sh {hostname} {username} {password}"
    exit 1
fi

_HOSTNAME=$1
_USERNAME=$2
_PASSWORD=$3
docker stop $_HOSTNAME
docker rm $_HOSTNAME
_CONTAINERID=$(docker run --name $_HOSTNAME -p 1883-1884:1883-1884/tcp -e USERNAME=$_USERNAME -e PASSWORD=$_PASSWORD -h $_HOSTNAME -d dotnetperf/broker)
sleep 2 
docker logs $_CONTAINERID
