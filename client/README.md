#Wave Client CLI

The client is a wrapper on top of the node MQTT implemenation. The main change is that it reads credentials from a file called `_creds.json`. 
The credentials file can be generated using setup.js as follows. **Make sure you npm install the modules needed.**

```
npm install
./setup.js broker username password
```

# Command Execution

## Basic Commands. 

|Commands    | Example | Description |
|------------|---------|-------------|
|Execute Sync|`./cmdport.js send -t "target_host" -m "command to execute"` | You can run the following command to execute a command remotely and they will be queued one after another on the target.|
|Execute Async|`./cmdport.js send -t "target_host/async" -m "non-blocking command"` |When we want to have a non-blocking command like killing a process or reboot if the machine goes into a bad state, we can use the async topic to push the command through to the machine. |
|Output/Status|`./cmdport.js subscribe -t "target_host/+"`| Command execution publishes the output to the `host/output` topic and can be subscribed by the client. The status of the last command is published as a retained message on `host/status`. |


## Commands with options. 

Commands can be directly executed or options can be passed in using json as follow. 

```
{
  command : "/home/aspuser/.dotnet/dotnet run"  
  cwd : "/home/aspuser/app/"
  logfile : "dotnet_out.txt"
}
```
|Option| Description |
|------|-------------|
|command | The executable that needs to be launced on the target machine. |
|cwd | The current workign directory that should be used when spawning the process.| 
| logfile | The file name used to output the stdout & stderr. The pid of the process is inserted into filename. So if the passed in filenamem is `output.txt` the output would be placed in `output_{pid}.txt` |  
| env | Set of key value pairs which will be set before launch of the process. | 

### Setting Environment Variables. 

Environment variables can be set in 2 ways 
1. Persisted variables using a `setenv` command 
2. Per command environment varialbles as a `env` option. 

When launching a process are composed using the following precedence 

```
parent process variables <<  presistent variables << command environment vars
```

The following setenv command can be used to persist variables and configure the logdir as follows. 

```
{
	"command": "setenv",
	"env": {
		 "Test": "TestValue"
		},	 
	"logdir": "X:/logoutputpath" 
}
```

|Variable|Description|
|--------|-----------|
|env| Key value pairs which will be setup before a command process is launched.|
|logdir | The directory used to save the output log files. If the directory doesnt exist then it is created. If there is a failure in creation of the directory, the command fails. | 

# Management operations 

| Command | Description | 
|---------|-------------|
| `./cmdport.js subscribe -t "client/+"` |  Client notifications -  To get notification and birth messages for clients use the `client/+` topic. |
| `./cmdport.js publish -t "client/[hostname]/config" -p -n -r` | Remove host - Sends a null message to delete the config info | 
| `./cmdport.js subscribe -t '#' -v` | Subscribe to Universe - Used for debugging the broker and viewing all message. |


### Debugging the broker 

As a test you can subscribe to all topics as well using the cmdport client as it is just a simple wrapper over mqtt. 

```
./cmdport.js subscribe -t '#' -v
host-nix/config {"hostname":"host-nix","arch":"x64","ostype":"Linux","os":"linux","ips":["10.21.0.5"]}
client/host-win/config {"hostname":"host-host","arch":"x64","ostype":"Windows_NT","os":"win32","ips":["10.30.169.104"]}
client/host-Linux1/config {"hostname":"host-Linux1","arch":"x64","ostype":"Linux","os":"linux","ips":["10.2.0.1"]}
```
