# Command Portal

A cross platform remote command executor. 

* Based on nodejs for platform abstraction 
* Uses MQTT broker for communication.
* Mark down based execution engine
* CLI for sending commands and viewing realtime outputs from targets.

## Overview

![Alt text](http://sajayantony.github.io/cmdport/images/diagram.svg)

|Topic|Description|
|----|-----------|
|`hostname`| Subscribed by the host |
|`hostname/async`| Subscribed by the host |
|`hostname/output`| User command output stream | 
| `hostname/status` | Retained messsage of last executed command | 
| `client/hostname/config` | Birth message which is retained and includes config details like IP |  

## Client CLI
For details of the command line client goto [`./client`](/client)

## Controller

The controller is a simple orchestrator that coordinates and sequences multiple commands. The controller subscribes on `job/controllerid` topic and uses commands from a markdown table as follows. 

| Command     | Host      |Description|
|-------------|-----------|-----------|
| `first.bat` | $(server) |server command| 
| `.\second.bat $(server) $(serverurl)` | $(client) | Client command |

* [`Environment variables`](/../../issues/9) may be persisted across commands in the agent which will be available in a spawned process.
* `logdir` can be changed as a part of the [environment command](/client#setting-environment-variables). 


## Agent Configuration

#### Windows 

Install Node if needed. 
```
msiexec /i https://nodejs.org/dist/v5.11.0/node-v5.11.0-x64.msi /passive
```
Setup the agent with the required credentials. 
```ps
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "&{$target='c:\cmdport\';$broker='test';$username='test';$password='test';iex ((new-object net.webclient).DownloadString('https://raw.githubusercontent.com/aspnet/Wave/master/scripts/Install.ps1'))}" 
```

#### Ubuntu 14.04
 
 Git clone the repo and run the install script as follows. 
```
git clone http://github.com/aspnet/Wave
sudo ./cmdport/scripts/install.sh testbroker testuser testpassword
```
    
This sets up the flow and connects to the broker and makes the machine ready for remote commands. Refer to [`install.sh`](/scripts/install.sh) for details.    
The following commands should be used to setup or remove the agent as needed. 
```
sudo update-rc.d cmdport defaults 
sudo update-rc.d -f cmdport remove
```

#### Docker

[![Docker Pulls](https://img.shields.io/docker/pulls/dotnetperf/wave.svg?maxAge=2592000?style=plastic)](https://hub.docker.com/r/dotnetperf/wave/)

The docker image is based of the `node:argon` image and contains the agent that can be started using the following commands and the logs command enables you to see if the broker succcessfully connected or not. 

```
docker pull dotnetperf/wave
docker run --name wave1 -p 8001:8000 -e BROKER=[broker] -e USERNAME=[username] -e PASSWORD=[password] -h [hostname] -d dotnetperf/wave
docker logs wave1
```
The image takes 3 environment variables and the hostname which is used to setup the credentials in the agent. 
Refer to the [Dockerfile](scripts/Dockerfile) 

To connect to the running instance use the following command to start an interactive shell. 

```
docker exec -it wave1 /bin/sh
```

Once you are done with the agent, you can use the following commands to stop the container and delete the image if necessary. 

```
docker stop wave1 && docker rm wave1
docker rmi dotnetperf/wave
```

If you are deploying containers on Ubuntu VM on Hyper-V, then:
 - run `nm-tool` on the Ubuntu VM and pick any one of the DNS addresses in the output
 - `sudo vi /etc/default/docker` and add the DNS ip to DOCKER_OPTS parameter.
 - `sudo service docker restart`

## Broker Setup

The following instructions are for a standard [`Mosquitto`](http://mosquitto.org/) MQTT broker. 

1. Use the following instructions to setup an MQTT broker for command dispatch. 
    
    ```
    sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
    sudo apt-get update
    sudo apt-get -y install mosquitto
    sudo apt-get -y install mosquitto-clients
    ```
2. Configure the password and disable anonymous access

    ```
    sudo mosquitto_passwd -c /etc/mosquitto/pwfile  <username>
    sudo nano /etc/mosquitto/mosquitto.conf
    ```

3. Add the following 

    ```
    password_file /etc/mosquitto/pwfile
    allow_anonymous false
    ```

4.  Restart the service 

    ```
    sudo service mosquitto restart
    ```

5. To be able to connect to the broker you need to open up the port 1883 for Mosquitto. The following setup is for an azure VM. Follow the bread crumb  described below and allow incoming packets for port 1883 for Azure VMs.
    ```
    VM >> Settings >> Network Interfaces >> Network Interface >> Settings >> Network Security Group >> Settings >> Inbound Rules 
    ```
