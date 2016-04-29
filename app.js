var http = require('http');
var express = require("express");
var RED = require("node-red");
var path = require('path')
var os = require('os')
var process = require('process')
var config = require('./config');
const fs = require('fs');
const env = require('./libs/env')
const log = require('./libs/log')
if (!config.broker || !config.broker.host) {
    return;
}

// Create an Express app
var app = express();

// Add a simple route for static content served from 'public'
app.use("/", express.static("public"));

// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var hostname = os.hostname().toLowerCase();


var basedir = './node-red-flows/';
var localdir = path.resolve(path.join(basedir), 'logs/');
log.init(localdir);

var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: "./node-red-flows",
    functionGlobalContext: {
        logutil: log,
        env: env

    },
    verbose: false,
    flowFile: "./node-red-flows/flows_Dispatcher.json",
    mqtt_dynamic:
    {
        broker: config.broker.host,
        broker_username: config.broker.username,
        broker_password: config.broker.password,
        clientid: hostname,
        clientconfig: {
            "hostname": hostname,
            "arch": os.arch(),
            "ostype": os.type(),
            "os": os.platform(),
            "ips": GetClientIPs(),
            "timestamp": new Date()
        }
    }
};

env.setFilename(path.join(settings.userDir, "environmentVars.json"));

// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(8000);

// Start the runtime
RED.start();

console.log("=================================================");
console.log("Flows Dir      : " + path.resolve(settings.userDir));
console.log("Node-Red Url   : http://localhost:8000/red/");
console.log("=================================================");


function GetClientIPs() {
    var ifaces = os.networkInterfaces();
    var ips = [];
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            ips.push(iface.address);
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
            }
            ++alias;
        });
    });
    return ips;
}
