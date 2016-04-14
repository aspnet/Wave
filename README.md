# Command Portal
A simple node-red based remote command scheduler. The flows can be invoked either through http or can be initiated through an MQTT payload. The flow subscribes to a topic which is the hostname. 

|Topic|Description|
|----|-----------|
|`hostname`| Subscribed by the host | 
| `hostname/config` | Birth message which is retained and includes config details like IP |
| `hostname/status` | Last executed command | 
  

### Configuration 
1.  The Broker is configured through and environment variable - 

  ```cmd
  setx -M CMDPORT_MQTT_BROKER=172.30.168.182
  ```

  ```sh
  export CMD_MQTT_BROKER=localhost
  ```
  
2. Set `username` and `password` in [`node-red-flows\flows_Dispatcher_cred.json`](node-red-flows\flows_Dispatcher_cred.json)
