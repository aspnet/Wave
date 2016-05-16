apt-get update
apt-get upgrade -y
apt-get -y install software-properties-common
apt-add-repository -y ppa:mosquitto-dev/mosquitto-ppa
apt-get update
apt-get -y install mosquitto
apt-get -y install mosquitto-clients
