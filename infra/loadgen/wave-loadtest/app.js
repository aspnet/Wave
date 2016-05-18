#!/usr/bin/env node

var loadgen = require('./lib/loadgen');
var minimist = require('minimist');
var url = require('url');

//TODO : Specify concurrency and rps. 
function start(inputargs) {
    var args = minimist(inputargs);

    try {
        var result = url.parse(args["_"][0]);
        if (!result.hostname) {
            throw Error("Invalid URL");
        }

        var options = {
            url: args["_"][0]
        }

        loadgen.startLoadtest(options);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

if (require.main === module) {
    start(process.argv.slice(2))
}