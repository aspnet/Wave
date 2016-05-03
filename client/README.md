#Cmdport Client CLI

The client is just a wrapper on top of the node MQTT implemenation. The main change is that it reads credentials from a file called `_creds.json`. 
The credentials file can be generated using setup.js as follows. **Make sure you npm install the modules needed.**

```
npm install
./setup.js broker username password
```

# Command Execution

## Synchonous Command Execution
Once the credentials have been stored. You can run the following command to execute a command remotely. 

```
./cmdport.js send -t "target_host" -m "command to execute"
```

## Async Command Execution
When we want to have a non-blocking command like killing a process or reboot if the machine goes into a bad state, we can use the async topic to push the command through to the machine. 
```sh
./cmdport.js send -t "target_host/async" -m "non-blocking command"
```

## Outputs & Status

Command execution publishes the output to the `host/output` topic and can be subscribed by the client. The status of the last command is published as a retained message on `host/status`. 
```sh
./cmdport.js subscribe -t "target_host/+"
```


## Logging
CmdPort writes the outputs from the command execution to its log file. The log file by default is piped to the flows directory as `agent_$hostname_$pid-log.txt`. To enable piping the logs to a custom location you can use the cmdport client and invoke a custom command `updatelogdir <LOGDIR>`.
```sh
./cmdport.js send -t "target_host" -m "updatelogdir <LOGDIR>"
```

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

# Command Formats 

## Basic Command Format

Commands can be directly executed or options can be passed in using json as follow. 

```
{
  command : "/home/aspuser/.dotnet/dotnet run"  
  cwd : "/home/aspuser/app/"
  logfile : "dotnet_out.txt"
}
```

## Setting Environment Variables. 

The following command enables the client to persist a set of environment variables which will be available when spawing a process on the node. 
`logdir` enables setting the output log location. Command fails if the `logdir` doesn't exist. 

```
{
	"command": "setenv",
	"env": {
		 "Test": "TestValue"
		}, 
	"logdir": "X:/logoutputpath" 
}
```
