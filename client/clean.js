#!/usr/bin/env node
'use strict';

var mqtt = require('mqtt')
    , colors = require('colors')
    , path = require('path')
    , fs = require('fs')
    , concat = require('concat-stream')
    , helpMe = require('help-me')({
        dir: path.join(__dirname, '..', 'doc')
    })
    , minimist = require('minimist');

function drain(args) {
    args = minimist(args, {
        boolean: ['delete-offline'],
        alias: {
            topic: 't',
            qos: 'q'
        },
        default: {
            topic: 'client/#',
            qos: 0
        }
    })

    if(!args['delete-offline']){
        console.log(colors.yellow("Specify --delete-offline to delete the stale configs"));
    }

    var client = mqtt.connect(args);

    client.on('connect', function () {
        client.subscribe(args.topic, { qos: args.qos }, function (err, result) {
            result.forEach(function (sub) {
                if (sub.qos > 2) {
                    console.error('subscription negated to', sub.topic, 'with code', sub.qos);
                    process.exit(1);
                }
            })
        });
    });

    // Wait for 3 seconds
    var waitTime = 3000;
    var lastMsg = {
        timestamp: new Date()
    };

    setInterval(function () {
        var current = new Date();
        var delta = current - lastMsg.timestamp;
        console.log("Wating... - [%s] ", delta/1000);
        if (delta < waitTime) {
            return true;
        }

        console.log("No messages during the last 3 seconds and so stopping clean. You can try running clean again to wait for more.")
        client.end();
        process.exit(0);
    }, waitTime);

    var deleted = {};
    client.on('message', function (topic, payload) {
        lastMsg.timestamp = new Date();
        TryDelete(client, topic, payload, args, deleted)
    });
}


function TryDelete(client, topic, payload, args, deleted) {
    var shouldDelete = true;
    var days = -1;
    var offline = true;
    try {
        payload = JSON.parse(payload);
        if (payload.timestamp) {
            var sourceDateTime = new Date(payload.timestamp);
            var current = new Date();
            days = Math.round((current - sourceDateTime) / (1000 * 60 * 60 * 24));
            offline = payload.status != 'online';
        }
    } catch (e) {
    }

    if ((days == -1) || offline) {
        days = colors.red(days)
    }
    else {
        days = colors.green("online " + days);
        topic = colors.green(topic);
        shouldDelete = false;
    }

    console.log("%s \t%s days %s", topic, days, shouldDelete ? "--will-delete" : 'ONLINE');
    if (args['delete-offline'] && shouldDelete) {
        if (!deleted[topic]) {
            deleted[topic] = payload;
            args.retain = true;
            client.publish(topic, '', args);
        }
    }
}

module.exports = drain;

if (require.main === module) {
    drain(process.argv.slice(2))
}