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
    fs = require('fs'),
    utils = require('./libs/utils'),
    http = require('http'),
    Q = require('q');

function updateQosClientId(inputargs) {
    inputargs = inputargs.concat("--no-clean", "-i", os.hostname().toLowerCase() + "_controller")
    return inputargs;
}

function start(inputargs) {
    inputargs = updateQosClientId(inputargs);
    var args = args_util.process(inputargs);
    var myargs = minimist(inputargs, {
        string: ['--test', '--verbose', '--start', 'testspec', 'testenv', 'job']
    });

    if (!args.topic) {
        args.topic = 'job/' + os.hostname();
    }

    if (myargs.test) {
        args.topic = args.topic + '/test';
    }

    args.topic = args.topic.toLowerCase();

    var environment = {};
    
    var client = mqtt.connect(args);
     client.on('error', function(error) {
        console.log(error);
        return;    
     });
        client.on('close', function(error) {
        console.log(error);
        return;    
     });  
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
            log('['+topic+'] ' + msg);
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
    
            var nextcmd = msgProcessor.process(msg, args.topic);
            if (nextcmd == null) {
                log('[EndTest       ] ');
                //client.end();
                // setTimeout(function() {
                //     process.exit();
                // }, 1000);
                return;
            }
            var setenvPromise = Q.resolve();
            if(nextcmd.setenv) {
                for (var target in nextcmd.env) {
                    var newenv = nextcmd.env[target];
                    var envmsg = {
                        command: "setenv",
                        logdir: nextcmd.env[target]["logdir"],
                    }
                    if( typeof newenv["$path"] != 'undefined'){
                        envmsg.path = newenv["$path"];
                        delete newenv["$path"];
                    }
                    envmsg.env = newenv;
                    setenvPromise = sendCommand(nextcmd.env[target][target], envmsg);
                }
            }
            var clientTopic = nextcmd.target;

            //For the test we send it back to the controller.
            if (myargs.test) {
                clientTopic = args.topic;
            }
            
            setenvPromise.then (function() {
                sendCommand(clientTopic, nextcmd.msg);
            });
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

    function  sendCommand(topic, msg) {
                
        var promise;
            
        if (myargs.verbose) {
           promise = subscribeToTopic(topic + "/status")
            .then( function() {
                return subscribeToTopic(topic); 
            })            
            .then( function() {
                return subscribeToTopic(topic+"/output");
            });
        }
        
        promise = promise.then ( function() {
            return cmdportSend(topic, msg);
            });
         return promise;
    };

function cmdportSend(topic, msg){
            var deferred = Q.defer();
        log('[Send          ]' +   topic + ': ' + JSON.stringify(msg));        
            cmdport.send(topic, msg);
        deferred.resolve();
        return deferred.promise;                
}
    function subscribeToTopic(clientTopic) {
        var deferred = Q.defer();
        if (!clientTopic) {
            deferred.resolve();
            return deferred.promise;
        }
        if (subscriptions[clientTopic]) {
            deferred.resolve();
            return deferred.promise;           
        }

        subscriptions[clientTopic] = {
            handler: function (t, msg) {
                console.log(colors.yellow(util.format("[%s]%s: ", t, msg)));
            }
        }

        client.subscribe(clientTopic, {
            qos: 0
        }, function (err, result) {
            if (err) {
                console.log(colors.red("ERR: " + err));
                return deferred.reject("Error in susbscribing to "+clientTopic);
                //process.exit(1);
            }
            console.log("[Subscribe     ]" + clientTopic+":");
            deferred.resolve();
        });                
        return deferred.promise;
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
    
    if(myargs.job || (myargs.testenv && myargs.testspec) ) {
        cmdport.start(myargs);
    }
}

module.exports.start = start;

if (require.main === module) {
    console.log(" Starting...")
    start(process.argv.slice(2))
}