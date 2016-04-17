#Cmdport Client CLI

The client is just a wrapper on top of the node MQTT implemenation. The main change is that it reads credentials from a file called `_creds.json`. 
The credentials file can be generated using setup.js as follows.

```
./setup.js broker username password
```

Once the credentials have been stored. You can run the following command to execute a command remotely. 

```
./cmdport.js send -t 'target_host' -m 'command to execute' 
```

As a test you can subscribe to all topics as well using the cmdport client as it is just a simple wrapper over mqtt. 

```
./cmdport.js subscribe -t '#' -v
host-nix/config {"hostname":"host-nix","arch":"x64","ostype":"Linux","os":"linux","ips":["10.21.0.5"]}
host-win/config {"hostname":"host-host","arch":"x64","ostype":"Windows_NT","os":"win32","ips":["10.30.169.104"]}
host-Linux1/config {"hostname":"host-Linux1","arch":"x64","ostype":"Linux","os":"linux","ips":["10.2.0.1"]}
```