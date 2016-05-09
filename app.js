const http = require('http');
const express = require("express");
const RED = require("node-red");
const path = require('path')
const os = require('os')
const config = require('./config');
const env = require('./libs/env')
const log = require('./libs/log')
const ipUtil = require('./libs/ipUtil');
const objUtil = require('./libs/objUtil');
const setupNode = require('./libs/setupNode');

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

var basedir = path.resolve('./flows/');
env.setFilename(path.join(basedir, "_envVars.json"));

var localdir = path.join(basedir, 'logs/');
log.init(localdir);
log.setFilename(path.join(basedir, "_logdir.json"));

var clientconfig = {
    "clientid" : config.clientid,
    "hostname": hostname,
    "arch": os.arch(),
    "ostype": os.type(),
    "os": os.platform(),
    "ips": ipUtil.getIPs(),
    "timestamp": new Date()
};

var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: basedir,
    functionGlobalContext: {
        log: log,
        env: env, 
        setup : setupNode.setup
    },
    verbose: false,
    flowFile: path.join(basedir, 'flows_Dispatcher.json'),
    mqtt_dynamic:
    {
        broker: config.broker.host,
        broker_username: config.broker.username,
        broker_password: config.broker.password,
        clientid: config.clientid,
        clientconfig: objUtil.extend(clientconfig, { "status": "online" }),
        clientconfig_offline: objUtil.extend(clientconfig, { "status": "offline" })
    }
};

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
