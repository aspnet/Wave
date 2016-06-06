'use strict';

var mqtt = require('mqtt'),
    path = require('path'),
    fs = require('fs'),
    concat = require('concat-stream'),
    helpMe = require('help-me')({
        dir: path.join(__dirname, '..', 'doc')
    }),
    minimist = require('minimist');

function add_creds(args) {
    try {
        // a path we KNOW might not exists since it might not be configured.
        var credentials = require('./_creds')
    } catch (e) {
        console.log('Setup credentials using setup.js');
        return;
    }

    var broker = credentials.broker;
    var options = [
        "--hostname", broker.host,
        "--port", broker.port,
        "--username", broker.username,
        "--password", broker.password,
        "-q", "1"
    ];

    for (var i = 0; i <= args.length; i++) {
        if (args[i] == '-t') {
            args[i + 1] = args[i + 1].toLowerCase();
        }
    }
    args = args.concat(options);
    return args;
}

function add_additional_args(args) {
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
    });

    args.topic = args.topic || args._.shift();

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
            return args;
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

    return args;
}


module.exports.process = function(args) {
    args = add_creds(args);
    args = add_additional_args(args);
    return args;
}