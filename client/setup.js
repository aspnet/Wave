#!/usr/bin/env node
var path = require('path');
var util = require('util');

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

var objstr = JSON.stringify(config, null, '\t');
var configStr = util.format("var _creds = %s; \r\nif(typeof module != 'undefined') { \n\tmodule.exports = _creds; \n} \r\n", objstr)
var fs = require('fs');
var filename = path.resolve(__dirname, "./_creds.js");
fs.writeFile(filename, configStr, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("Configuration written to " + filename);
});

