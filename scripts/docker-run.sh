#!/bin/bash

if [ "$#" -ne 4 ]; then
    echo "Usage: ./docker-run.sh {broker} {username} {password} {hostname}"
    exit 1
fi

_BROKER=$1
_USERNAME=$2
_PASSWORD=$3
_HOSTNAME=$4

docker run --name wave -p 8000:8000 -e BROKER=$_BROKER -e USERNAME=$_USERNAME -e PASSWORD=$_PASSWORD -h $_HOSTNAME -d aspnet/wave