#!/usr/bin/env node
'use strict';

var os = require('os');
var path = require('path');
var cmdport = require('../cmdport');
var controller = require('../controller');
var env = require('./test-localhost-env.json')

// Add localhost variable.
env.localhost = os.hostname().toLowerCase();
 
var controllertopic = ('job/' + os.hostname()).toLowerCase();
var payload = { 
        testspec : path.resolve(__dirname, './test-localhost.md'), 
        env: env
    };

controller.start(process.argv.slice(2).concat("--verbose"))
cmdport.send(controllertopic, payload);
setTimeout(function() {
    console.log("Exiting ...")
}, 5000);
return;