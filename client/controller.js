#!/usr/bin/env node
'use strict';

var exec = require('child_process').exec,
    os = require('os'),
    util = require('util'),
    minimist = require('minimist'),
    mqtt = require('mqtt'),
    args_util = require('./args-util.js'),
    msgProcessor = require('./messageprocessor.js'),
    cmdport = require('./cmdport');

function updateQosClientId(inputargs) {
    inputargs = inputargs.concat("--no-clean", "-i", os.hostname().toLowerCase() + "_controller")
    return inputargs;
}

function start(inputargs) {
    inputargs = updateQosClientId(inputargs);
    var args = args_util.process(inputargs);
    var myargs = minimist(inputargs, {
        string: ['--test', '--verbose', '--start']
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
                console.log("[Controller][Subscribe] " + args.topic);
                if (sub.qos > 2) {
                    console.error('subscription negated to', sub.topic, 'with code', sub.qos);
                    process.exit(1);
                }
            })
        });
    });

    client.on('message', function (topic, msg) {
        log('[Controller][Receive]<==: ' + msg);

        //Execute dummy message
        if (myargs.test) {
            var testmsg = JSON.parse(msg);
            // We know that we need to execute this as it has an undefined exitcode.
            if (testmsg.command && testmsg.exitcode == undefined) {
                console.log("[Controller][Exec+Callback] :" + testmsg.command);
                testmsg.exitcode = 0;
                // Send message back to controller.
                cmdport.send(args.topic, testmsg);
                return;
            }else{
                if(testmsg.testspec && testmsg.step == undefined)
                    console.log("[Contoller][StartTest]" + testmsg.testspec)
            }
        }
        
        var nextcmd = msgProcessor.process(msg, args.topic);
        if (nextcmd == null) {
            if (myargs.test) {
                log('End of test spec.');
                client.end();
                process.exit(0);
            }
            return;
        }

        var clientTopic = nextcmd.target;
        
        //For the test we send it back to the controller.
        if(myargs.test){
            clientTopic = args.topic;
        }
        
        log('[Controller][Send]==>' + clientTopic + ': ' + JSON.stringify(nextcmd));
        cmdport.send(clientTopic, nextcmd.msg);
    });

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
}



module.exports.start = start;

if (require.main === module) {
    console.log("[Controller] Starting...")
    start(process.argv.slice(2))
}
