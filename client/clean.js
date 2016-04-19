#!/usr/bin/env node
'use strict';

var mqtt = require('mqtt')
    , path = require('path')
    , fs = require('fs')
    , concat = require('concat-stream')
    , helpMe = require('help-me')({
        dir: path.join(__dirname, '..', 'doc')
    })
    , minimist = require('minimist');

function drain(args) {
    args = minimist(args, {
        string: ['hostname', 'username', 'password', 'key', 'cert', 'ca'],
        integer: ['port', 'qos', 'keepAlive'],
        boolean: ['stdin', 'help', 'clean', 'insecure'],
        alias: {
            port: 'p',
            hostname: ['h', 'host'],
            topic: 't',
            qos: 'q',
            clean: 'c',
            keepalive: 'k',
            clientId: ['i', 'id'],
            username: 'u',
            password: 'P',
            protocol: ['C', 'l'],
            verbose: 'v',
            help: '-H',
            ca: 'cafile'
        },
        default: {
            host: 'localhost',
            qos: 0,
            retain: false,
            clean: true,
            keepAlive: 30 // 30 sec
        }
    })

    if (args.help) {
        return helpMe.toStdout('subscribe');
    }

    args.topic = args.topic || args._.shift();

    if (!args.topic) {
        console.error('missing topic\n')
        return helpMe.toStdout('subscribe');
    }

    if (args.key) {
        args.key = fs.readFileSync(args.key);
    }

    if (args.cert) {
        args.cert = fs.readFileSync(args.cert);
    }

    if (args.ca) {
        args.ca = fs.readFileSync(args.ca);
    }

    if (args.key && args.cert && !args.protocol) {
        args.protocol = 'mqtts';
    }

    if (args.insecure) {
        args.rejectUnauthorized = false;
    }

    if (args.port) {
        if (typeof args.port !== 'number') {
            console.warn('# Port: number expected, \'%s\' was given.', typeof args.port);
            return;
        }
    }

    if (args['will-topic']) {
        args.will = {};
        args.will.topic = args['will-topic'];
        args.will.payload = args['will-message'];
        args.will.qos = args['will-qos'];
        args.will.retain = args['will-retain'];
    }

    args.keepAlive = args['keep-alive'];

    var client = mqtt.connect(args);

    client.on('connect', function() {
        client.subscribe(args.topic, { qos: args.qos }, function(err, result) {
            result.forEach(function(sub) {
                if (sub.qos > 2) {
                    console.error('subscription negated to', sub.topic, 'with code', sub.qos);
                    process.exit(1);
                }
            })
        });
    });

    // Wait for 3 seconds
    var waitTime = 3000;
    var slidingwindow = {
        delta: waitTime,
        previous: new Date()
    };

    setInterval(function() {
        if (slidingwindow.delta < waitTime) {
            return true;
        }
        console.log("No messages during the last 3 seconds and so stopping clean. You can try running clean again to wait for more.")
        client.end();
        process.exit(0);
    }, waitTime);

    client.on('message', function(topic, payload) {
        var timestamp = new Date();
        slidingwindow.delta = timestamp - slidingwindow.previous;
        slidingwindow.previous = timestamp;

        if (args.verbose) {
            console.log(topic, payload.toString())
        } else {
            console.log(payload.toString())
        }
    });
}

function start(args) {

    // drain all messages     
    var cleanargs = minimist(args, {
        alias: {
            topic: 't',
        }
    });

    args = args.concat([
        "--no-clean",
        "-i", cleanargs.topic]);

    drain(args);
}

module.exports = start;

if (require.main === module) {
    start(process.argv.slice(2))
}