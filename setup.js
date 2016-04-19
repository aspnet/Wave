#!/usr/bin/env node
var path = require('path');

if (process.argv.length < 5) {
    console.log("Usage : \r" + "setup {broker} {username} {password}")
    return;
}

var config = {};
config.broker = {
    host: process.argv[2],
    username: process.argv[3],
    password: process.argv[4],
};

var configStr = JSON.stringify(config, null, '\t');

var fs = require('fs');
var filename = path.resolve(__dirname, "./_creds.json");
fs.writeFile(filename, configStr, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("Configuration written to " + filename);
});

