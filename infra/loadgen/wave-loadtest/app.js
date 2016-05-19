#!/usr/bin/env node

var loadtest = require('loadtest');
var common = require('./libs/common');
var minimist = require('minimist');
var url = require('url');
                
common.setup();

var timedFunc = (function () {
    var lastCall = 0;
    return function (latency, result, error) {        
        if (new Date() - lastCall < 1000)
            return false;
        lastCall = new Date();
        outputLatency(latency,result, error);
    }
})();

function outputLatency(latency, result, error) {        
    console.log("%j", latency);
}

var options = {
    url: 'http://localhost:8000',
    maxRequests: 1000,
    rps : 100,
    concurrency : 10,
    keepalive : true,
    statusCallback: timedFunc
};

function startLoadTest() {
    loadtest.loadTest(options, function (error) {
        if (error) {
            return console.error('Got an error: %s', error);
        }
        if(process.env.NODE_ENV){
            console.log('Tests run successfully');    
        }        
        common.shutdown();
    });
}

function start(inputargs) {
    var args = minimist(inputargs);

    try {
        var result = url.parse(args["_"][0]);
        if (!result.hostname) {
            throw Error("Invalid URL");
        }
        
        options.url = args["_"][0];
        
        startLoadTest();
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

if (require.main === module) {
    start(process.argv.slice(2))
}

