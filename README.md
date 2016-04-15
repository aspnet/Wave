# Command Portal

A simple node-red based remote command scheduler. The flows can be invoked either through http or can be initiated through an MQTT payload. The flow subscribes to a topic which is the hostname. 

|Topic|Description|
|----|-----------|
|`hostname`| Subscribed by the host | 
| `hostname/config` | Birth message which is retained and includes config details like IP |
| `hostname/status` | Last executed command | 
  

## Configuration
 
1. The Broker is configured through and environment variable - 

    ```cmd
    setx -M CMDPORT_MQTT_BROKER=127.0.0.1
    ```
    ```sh
    export CMDPORT_MQTT_BROKER=localhost
    ```

2. Set `username` and `password` in [`node-red-flows\flows_Dispatcher_cred.json`](node-red-flows/flows_Dispatcher_cred.json)

3. Setting up cmdport on an Azure Ubuntu VM 
    ```
	sudo apt-get -y install mosquitto-clients 	
	sudo apt-get -y install git
	sudo apt-get -y install nodejs
	sudo apt-get -y install npm
	sudo ln -s /usr/bin/nodejs /usr/sbin/node
	git clone http://github.com/sajayantony/cmdport
	cd cmdport
	npm install
	node app.js
    ```

4. Setup and environment variable which can be picked up by the flow. 
    ```
    sudo nano /etc/environment
    CMDPORT_MQTT_BROKER=<BROKER_ADDRESS>
    ```

5. Configure the the app to startup on reboot - Make sure you configure /etc/init.d/cmdport with the following script. 
    ```
    !/bin/sh
    #/etc/init.d/cmdport

    export PATH=$PATH:/usr/local/bin
    export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules
    export HOME=/home/{username}
    export CMDPORT_MQTT_BROKER={BROKER_ADDRESS}
    
    case "$1" in
        start)
            exec forever --sourceDir=/home//cmdport -p /home/aspnet/.forever app.js
        ;;
        stop)
            exec forever stop --sourceDir=/home/{username}/cmdport app.js
        ;;
        *)
        echo "Usage: /etc/init.d/cmdport {start|stop}"
        exit 1
        ;;
    esac

    exit 0
    ```

6. Make the script an executable.  
    ```
    sudo chmod 755 /etc/init.d/cmdport
    ```

7. The following commands setup or remove the agent as needed. 
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
