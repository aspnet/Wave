!#/bin/sh

if [ "$#" -ne 3 ]; then
    echo "Usage: ./install.sh {broker} {username} {password}"
    exit 1
fi

sudo apt-get -y install mosquitto-clients   
sudo apt-get -y install git
sudo apt-get -y install nodejs
sudo apt-get -y install npm
sudo ln -s /usr/bin/nodejs /usr/sbin/node

#install forever. 
sudo npm install -g forever

#Ensure removing the cmdport that is existing if any at all. 
sudo update-rc.d -f cmdport remove 
cd ~
git clone http://github.com/sajayantony/cmdport
cd cmdport
npm install
echo ==========================================
echo "INSTALL PATH = $HOME"
echo ==========================================
INSTALL_PATH=$HOME
sudo sed  -e "s#{INSTALL_PATH}#$INSTALL_DIR#g" -e "s#{broker}#$1#g" -e "s#{username}#$2#g" -e "s#{password}#$3#g" > /etc/init.d/cmdport
cat /etc/init.d/cmdport
sudo chmod 755 /etc/init.d/cmdport
sudo update-rc.d cmdport defaults 
sudo forever list