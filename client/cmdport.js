#!/usr/bin/env node
'use strict';

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

    var commist = require('commist')()
        , helpMe = require('help-me')({ dir: './node_modules/mqtt/doc' });

    commist.register('publish', require('./node_modules/mqtt/bin/pub'));
    commist.register('send', require('./node_modules/mqtt/bin/pub'));
    commist.register('subscribe', require('./node_modules/mqtt/bin/sub'));
    commist.register('clean', require('./clean'));

    commist.register('version', function() {
        console.log('MQTT.js version:', require('./node_modules/mqtt/package.json').version);
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
    var args = process.argv.slice(2);
    if (typeof (payload) != 'string') {
        payload = JSON.stringify(payload);
    }
    args = ["send", "-t", topic, "-m", payload].concat(args);
    cli(args);
}

module.exports.cli = cli;
module.exports.send = send;