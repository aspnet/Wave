#!/usr/bin/env node

'use strict';

var exec = require('child_process').exec,
    util = require('util'),
    minimist = require('minimist'),
    mqtt = require('mqtt'),
    args_util = require('./args-util.js'),
    MessageProcessor = require('./messageprocessor.js');

var args = args_util.process(process.argv.slice(2));
var myargs = minimist(process.argv.slice(2), {
    string: ['--test', '--verbose', '-start']
});

if (!args.topic) {
    var os = require('os');
    args.topic = 'job/' + os.hostname();
}
if (myargs.test) {
    args.topic = args.topic + '/test';
}

var client = mqtt.connect(args);

client.on('connect', function() {
    client.subscribe(args.topic, {
        qos: args.qos
    }, function(err, result) {
        result.forEach(function(sub) {
            if (sub.qos > 2) {
                console.error('subscription negated to', sub.topic, 'with code', sub.qos);
                process.exit(1);
            }
        })
    });
});

client.on('message', process_message);

function process_message(topic, msg) {
    log('InMsg: ' + msg);
    var processor = new MessageProcessor(msg, args.topic);
    if (processor.out_target == null) {
        log('End of test spec.');
        if (myargs.test) {
            process.exit();
        }
        return;
    }
    var clientTopic = 'client/' + processor.out_target;
    if (myargs.test) {
        clientTopic = clientTopic + '/test';
    }
    log('OutMsg: To ' + clientTopic + ': ' + JSON.stringify(processor.out_msg));

    var cmd = util.format("node ./cmdport.js send -t '%s' -m '%s'", clientTopic, JSON.stringify(processor.out_msg));
    exec_cmd(cmd);
}

function log(msg) {
    if (myargs.verbose) {
        console.log(msg);
    }
}

function start_run() {
    if (myargs.start) {
        var cmd = util.format("node ./cmdport.js send -t '%s' -m '%s'", args.topic, JSON.stringify(myargs.start));
	exec_cmd(cmd);
    }

}
function exec_cmd(cmd)
{
        var child = exec(cmd,
            function(error, stdout, stderr) {
		if(stdout){ 
                console.log('stdout: ' + stdout);
	}
	if(stderr) {
                console.log('stderr: ' + stderr);
	}
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
}

start_run();
