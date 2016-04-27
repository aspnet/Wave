#!/usr/bin/env node
'use strict';

var os = require('os');
var cmdport = require('../cmdport');
var controller = require('../controller');

var controllertopic = ('job/' + os.hostname() + '/test').toLowerCase();
var payload = { 
        testspec : './test.md', 
        env: { 
            server: 'dummySrv', 
            client: 'dummyClient' 
    }
 }


controller.start(process.argv.slice(2).concat("--test", "--verbose"))
cmdport.send(controllertopic, payload);
setTimeout(function() {
    console.log("Exiting ...")
}, 5000);