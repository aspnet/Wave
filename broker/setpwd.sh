#!/bin/bash
mosquitto_passwd -b /etc/mosquitto/pwfile admin $1
mosquitto_passwd -b /etc/mosquitto/pwfile readuser $2

