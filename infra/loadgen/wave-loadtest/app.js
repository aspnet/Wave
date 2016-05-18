#!/usr/bin/env node

var loadtest = require('loadtest');
var common = require('./libs/common');
var minimist = require('minimist');
var url = require('url');
                
common.setup();

function statusCallback(latency, result, error) {
    //console.log('Current latency %j, result %j', latency, error ? JSON.stringify(error) + (result||"").toString() : result);
    //console.log('----');
    //console.log('Request elapsed milliseconds: ', error ? error.requestElapsed : result.requestElapsed);
    //console.log('Request index: ', error ? error.requestIndex : result.requestIndex);
    //console.log('Request loadtest() instance index: ', error ? error.instanceIndex : result.instanceIndex);
    console.log("%j", latency);
}

var options = {
    url: 'http://localhost:8000',
    maxRequests: 1000,
    statusCallback: statusCallback
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

