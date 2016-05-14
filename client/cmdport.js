#!/usr/bin/env node
'use strict';

var path = require('path');

try {
    // a path we KNOW might not exists since it might not be configured.
    var credentials = require('./_creds')
}
catch (e) {
    console.log('Setup credentials using setup.js');
    return;
}

var broker = credentials.broker;

function cli(inputargs) {

    var modulesDir = path.resolve(path.join(__dirname, '../node_modules/'));
    var commist = require('commist')()
        , helpMe = require('help-me')({ dir: path.join(modulesDir, 'mqtt/doc') });

    commist.register('publish', require(path.join(modulesDir, 'mqtt/bin/pub')));
    commist.register('send', require(path.join(modulesDir, 'mqtt/bin/pub')));
    commist.register('subscribe', require(path.join(modulesDir, 'mqtt/bin/sub')));
    commist.register('clean', require('./clean'));
    commist.register('start', start);

    commist.register('version', function () {
        console.log('MQTT.js version:', require(path.join(modulesDir, 'mqtt/package.json')).version);
    });

    commist.register('help', helpMe.toStdout);
    var options =
        [
            "--hostname", broker.host,
            "--username", broker.username,
            "--password", broker.password,
            "-q", "1"
        ];

    var args = inputargs.concat(options);

    // Canonicalize the hostname.
    for (var i = 0; i <= args.length; i++) {
        if (args[i] == '-t') {
            args[i + 1] = args[i + 1].toLowerCase();
        }
    }

    if (null !== commist.parse(args)) {
        console.log('No such command:', '\n');
        helpMe.toStdout();
    }
}

if (require.main === module) {
    cli(process.argv.slice(2));
}

function send(topic, payload) {
    if (typeof (payload) != 'string') {
        payload = JSON.stringify(payload);
    }
    var args = ["send", "-t", topic, "-m", payload];
    cli(args);
}

function start(args) {
    var minimist = require('minimist');
    var fs = require('fs');
    var myargs = minimist(process.argv.slice(2), {
        string: ['testspec', 'testenv', 'job']
    });

    function startTest(test) {
        var msg = {
            testspec: test.testspec,
            env: JSON.parse(fs.readFileSync(test.testenv))
        };
        var args = ["send", "-t", myargs.topic, "-m", JSON.stringify(msg)];
        cli(args);
    }

    if (myargs.job) {
        var jobspec = JSON.parse(fs.readFileSync(myargs.job));
        for (var test in jobspec) {
            startTest(jobspec[test]);
        }
    } else if (myargs.testenv && myargs.testspec) {
        startTest(myargs);
    }

}

module.exports.cli = cli;
module.exports.send = send;
module.exports.start = start;
