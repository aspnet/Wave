#!/usr/bin/env node

var exec = require('child_process').exec,
    colors = require('colors'),
    os = require('os'),
    util = require('util'),
    minimist = require('minimist'),
    mqtt = require('mqtt'),
    args_util = require('./args-util.js'),
    msgProcessor = require('./messageprocessor.js'),
    cmdport = require('./cmdport'),
    fs = require('fs');

var Emitter = require('events').EventEmitter,
    emitter = new Emitter();

function updateQosClientId(inputargs) {
    inputargs = inputargs.concat("--no-clean", "-i", os.hostname().toLowerCase() + "_controller")
    return inputargs;
}

function start(inputargs) {
    inputargs = updateQosClientId(inputargs);
    var args = args_util.process(inputargs);
    var myargs = minimist(inputargs, {
        string: ['--test', '--verbose', '--start', 'testspec', 'testenv']
    });

    if (!args.topic) {
        args.topic = 'job/' + os.hostname();
    }

    if (myargs.test) {
        args.topic = args.topic + '/test';
    }

    args.topic = args.topic.toLowerCase();

    var client = mqtt.connect(args);

    client.on('connect', function () {
        client.subscribe(args.topic, { qos: args.qos }, function (err, result) {
            result.forEach(function (sub) {
                console.log("[Subscribe     ] " + args.topic);
                if (sub.qos > 2) {
                    console.error('subscription negated to', sub.topic, 'with code', sub.qos);
                    process.exit(1);
                }
            })
        });
    });
    var subscriptions = {};
    subscriptions[args.topic] = {
        handler: function (topic, msg) {
            log('[Receive       ] ' + msg);
            var msg = JSON.parse(msg);

            //Execute dummy message
            if (myargs.test) {
                // We know that we need to execute this as it has an undefined exitcode.
                if (msg.command && msg.exitcode == undefined) {
                    console.log("[Exec+Callback]  " + msg.command);
                    msg.exitcode = 0;
                    // Send message back to controller.
                    cmdport.send(args.topic, msg);
                    return;
                }
            }

            if (msg.testspec && msg.step == undefined)
                console.log(colors.blue("[StartTest     ] ") + msg.testspec)
            
            if(msg.exitcode && msg.exitcode != 0){
                console.log(colors.red("[Exec+Callback]  " + "ERR_EXITCODE" + msg.exitcode));
            }
            
            var nextcmd = msgProcessor.process(msg, args.topic);
            if (nextcmd == null) {
                log('[EndTest       ] ');
                client.end();
                setTimeout(function() {
                    process.exit();
                }, 1000);
                return;
            }

            var clientTopic = nextcmd.target;

            //For the test we send it back to the controller.
            if (myargs.test) {
                clientTopic = args.topic;
            }
            
            if(msg.env) {               
                var envmsg = {
                    command : "setenv",
                    env : msg.env,
                }
                var machineList = msg.env.machines.split(",");  
                for(var i=0; i< machineList.length; ++i){            
                    emitter.emit('send', machineList[i], envmsg );
                }  
            }
            emitter.emit('send', clientTopic, nextcmd.msg);
        }
    };

    client.on('message', function (topic, msg) {
        var subscription = subscriptions[topic];
        if (!subscription) {
            //Get client topic
            var clientTopic = getClientTopic(topic);
            subscription = subscriptions[clientTopic];
        }

        if (subscription) {
            subscription.handler(topic, msg);
        }
    });

    emitter.on('send', function (topic, msg) {
        if (myargs.verbose) {
            subscribeToOutput(client, subscriptions, topic);
        }
        log('[Send          ] ' +   topic + ': ' + JSON.stringify(msg));

        cmdport.send(topic, msg);
    })

    function subscribeToOutput(client, subscriptions, targetTopic) {
        var clientTopic = targetTopic + "/output"
        if (!clientTopic) {
            return;
        }
        if (subscriptions[clientTopic]) {
            return;
        }

        subscriptions[clientTopic] = {
            handler: function (t, msg) {
                console.log(colors.yellow(util.format("[%s]\t%s", t, msg)));
            }
        }

        client.subscribe(clientTopic, {
            qos: 0
        }, function (err, result) {
            if (err) {
                console.log(colors.red("ERR: " + err));
                process.exit(1);
            }
            console.log("[Subscribe     ]" + clientTopic);
        });
    }

    function getClientTopic(topic) {
        //Get client topic
        if (topic.indexOf('\\') > -1) {
            var match = topic.match(/(.*?)\//);
            if (match) {
                return match[1] + "/output";
            }
        }

        return topic = topic + "/output";
    }

    function log(msg) {
        if (myargs.verbose) {
            console.log(msg);
        }
    }

    function exec_cmd(cmd) {
        var child = exec(cmd,
            function (error, stdout, stderr) {
                if (stdout) {
                    console.log('stdout: ' + stdout);
                }
                if (stderr) {
                    console.log('stderr: ' + stderr);
                }
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    }
    
    if (myargs.testenv && myargs.testspec) {
        var msg = {
            testspec: args.testspec,
            env: JSON.parse(fs.readFileSync(args.testenv))
        };
        cmdport.send(args.topic, msg);
    }

}

module.exports.start = start;

if (require.main === module) {
    console.log(" Starting...")
    start(process.argv.slice(2))
}