#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Usage: ./install.sh {broker} {username} {password}"
    exit 1
fi

pushd `dirname $0` > /dev/null

#Install dependencies.
sudo apt-get -y install mosquitto-clients
sudo apt-get -y install git
sudo apt-get -y install nodejs
sudo apt-get -y install npm
sudo ln -s /usr/bin/nodejs /usr/sbin/node

#install forever.
sudo npm install -g forever

#Ensure removing the cmdport that is existing if any at all.
sudo update-rc.d -f cmdport remove

#Move upto the root to install packages for cmdport
pushd ../
sudo npm install

INSTALL_PATH=`pwd`
echo ==========================================
echo "INSTALL PATH = $INSTALL_PATH"
echo "USER HOME = $HOME"
echo ==========================================

#Setup the credentials
./setup.js $1 $2 $3

#SETUP home and install path variables in the init.d script
sed  -e "s#{installpath}#$INSTALL_PATH#g" -e "s#{home}#$HOME#g" ./scripts/cmdport > _cmdport
sudo mv _cmdport /etc/init.d/cmdport
cat /etc/init.d/cmdport
sudo chmod 755 /etc/init.d/cmdport
sudo update-rc.d cmdport defaults
sudo forever list
sudo /etc/init.d/cmdport start </dev/null &>/dev/null &
