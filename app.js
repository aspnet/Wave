var http = require('http');
var express = require("express");
var RED = require("node-red");
var path = require('path')
var os = require('os')
var process = require('process')
var config = require('./config');
const fs = require('fs');

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
var logslink = path.resolve('./node-red-flows/logslink/')
var locallogsdir = path.resolve('./node-red-flows/logs/');

var _setlogdir = function (msg) {
    var pid = msg.pid || 0;
    var filename = require('util').format("agent_%s_%s_log.txt", hostname, pid);
    var fullpath = path.resolve(logslink, filename);
    msg.filename = fullpath;
    return msg;
};

if (!fs.existsSync(locallogsdir)) {
    fs.mkdirSync(locallogsdir);
}

try {
    stats = fs.lstatSync(logslink);
    if (stats.isSymbolicLink()) {
    }
}
catch (e) {
}
fs.symlink(locallogsdir, logslink, 'dir', function (err, stats) {

});

var _updateloglink = function (msg) {
    if (msg.payload && (typeof msg.payload == 'string')) {
        var cmd = msg.payload.split(' ');
        if (cmd.length == 2 && cmd[0].toLowerCase() == 'updatelogpath') {
            var logpath = cmd[1];
            try {
                stats = fs.lstatSync(logslink);
                if (stats.isSymbolicLink()) {
                    fs.unlinkSync(logslink)
                }
            }
            catch (e) {
            }
            fs.symlink(logpath, logslink, 'dir', function (err, stats) {
            });

            //Noop Exe
            msg.payload = "hostname";
        }
    }

    return msg;
}

var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: "./node-red-flows",
    functionGlobalContext: {
        setlogfilename: _setlogdir,
        tryupdatelogpath: _updateloglink
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