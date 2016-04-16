# Command Portal

A simple node-red based remote command scheduler. The flows can be invoked either through http or can be initiated through an MQTT payload. The flow subscribes to a topic which is the hostname. 

|Topic|Description|
|----|-----------|
|`hostname`| Subscribed by the host | 
| `hostname/config` | Birth message which is retained and includes config details like IP |
| `hostname/status` | Last executed command | 
  

## Configuration - Ubuntu 14.04
 
 Git clone the repo and run the install script as follows. 
```
git clone http://github.com/sajayantony/cmdport
sudo ./cmdport/scripts/install.sh testbroker testuser testpassword
```
    
This sets up the flow and connects to the broker and makes the machine ready for remote commands. Refer [`install.sh`](/scripts/install.sh) for details.    
The following commands should be used to setup or remove the agent as needed. 
```
sudo update-rc.d cmdport defaults 
sudo update-rc.d -f cmdport remove
```

## Broker Configuration

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

5. To be able to connect to the broker you need to open up the port 1883 for Mosquitto. 
Follow the bread crumb  described below and add port 1883. 

    ```
    VM >> Settings >> Network Interfaces >> Network Interface >> Settings >> Network Security Group >> Settings >> Inbound Rules 
    ```
