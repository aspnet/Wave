apt-get update
apt-get upgrade -y
apt-get -y install software-properties-common
apt-add-repository -y ppa:mosquitto-dev/mosquitto-ppa
apt-get update
apt-get -y install mosquitto
apt-get -y install mosquitto-clients
apt-get -y install git
curl -sL https://deb.nodesource.com/setup | sudo -
apt-get -y install nodejs
apt-get -y install npm
ln -s /usr/local/lib/node /usr/lib/node
ln -s /usr/local/bin/node-waf /usr/bin/node-waf
ln -s "$(which nodejs)" /usr/bin/node
