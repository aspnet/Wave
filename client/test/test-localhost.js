#!/usr/bin/env node
'use strict';

var os = require('os');
var cmdport = require('../cmdport');
var controller = require('../controller');

var controllertopic = ('job/' + os.hostname()).toLowerCase();
var payload = { 
        testspec : './test-localhost.md', 
        env: { 
            server: 'os.hostname', 
            client: 'dummyClient',
            localhost : os.hostname().toLowerCase() 
    }
 }

controller.start(process.argv.slice(2).concat("--verbose"))
cmdport.send(controllertopic, payload);
setTimeout(function() {
    console.log("Exiting ...")
}, 5000);