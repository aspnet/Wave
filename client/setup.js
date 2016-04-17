#!/usr/bin/env node
var util = require('util');

if (process.argv.length < 5) {
    console.log("Usage : \r" + "setup {broker} {username} {password}")
    return;
}

var configStr = JSON.stringify(config, null, '\t');
var configuration = util.format(configFormat, configStr);

var fs = require('fs');
var filename = path.resolve(__dirname, "./_creds.json");
fs.writeFile(filename, configuration, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("Configuration written to " + filename);
});

