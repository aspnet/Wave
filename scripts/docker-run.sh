#!/bin/bash

if [ "$#" -ne 5 ]; then
    echo "Usage: ./docker-run.sh {broker} {port} {username} {password} {hostname}"
    exit 1
fi

_BROKER=$1
_PORT=$2
_USERNAME=$3
_PASSWORD=$4
_HOSTNAME=$5
_CONTAINERID=$(docker run -e BROKER=$_BROKER -e PORT=$_PORT -e USERNAME=$_USERNAME -e PASSWORD=$_PASSWORD -h $_HOSTNAME -d dotnetperf/wave)
sleep 2 
docker logs $_CONTAINERID