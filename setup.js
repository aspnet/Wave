#!/usr/bin/env node

var path = require('path');
var util = require('util');
var os = require('os');
var minimist = require('minimist');

function cli(args) {
    args = minimist(args, {
        string: ['hostname', 'username', 'password'],
        alias: {
            hostname: ['h', 'host'],
            port: 'p',
            clientid: 'id',
            username: 'u',
            password: 'P',
        },
        default: {
            clientid: os.hostname().toLowerCase(),
            port: 1883
        }
    });

    if (!args.host || !args.username || !args.password) {
        console.log("Usage : \r" + "setup -h {broker} [-p {port}] -u {username} -P {password} [--id clientid] ")
        return;
    }

    var config = {};
    config.broker = {
        host: args.host,
        port: args.port,
        username: args.username,
        password: args.password,
    };
    
    config.clientid = args.clientid;  

    var objstr = JSON.stringify(config, null, '\t');
    var configStr = util.format("var _creds = %s; \r\nmodule.exports = _creds; \r\n", objstr)
    var fs = require('fs');
    var filename = path.resolve(__dirname, "./client/_creds.js");
    fs.writeFile(filename, configStr, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Configuration written to " + filename);
    });
}

if (require.main === module) {
    cli(process.argv.slice(2));
}