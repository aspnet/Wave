const EventEmitter = require('events');
const util = require('util');
var spawn = require('child_process').spawn;
var isUtf8 = require('is-utf8');

var spawnerOptions = {
    verbose: false
}

function Spawner(options) {

    /*
    options 
    {
        command : "filepath"
        env : {
            key : value
        }
        cwd : 'Current Working directory'
        state: user state during callback.
    }
    */
    "use strict";

    //Make it an EventEmitter.
    EventEmitter.call(this);

    this.processes = {};

}
util.inherits(Spawner, EventEmitter);

var instance = new Spawner();

function startprocess(options) {

    var userstate = options.state;
    var args = options.command;
    args = args.match(/(?:[^\s"]+|"[^"]*")+/g);
    var command = args.shift();
    var cwd = options.cwd || process.cwd;
    var env = mergeEnv(options.env);
    var spawnOptions = {
        cwd: cwd,
        env: env,
    }

    var proc = spawn(command, args, spawnOptions);

    var procEntry = {
        pid: proc.pid,
        cmd: command,
        process: proc,
        options: spawnOptions,
        state: userstate,
        data: ''
    };

    instance.emit('spawn', procEntry)

    proc.stdout.on('data', function (data) {
        procEntry.data = isUtf8(data) ? data.toString() : data;
        instance.emit('data', procEntry);
    });

    proc.stderr.on('data', function (data) {
        procEntry.data = {
            stderr: isUtf8(data) ? data.toString() : new Buffer(data)
        }

        instance.emit('data', procEntry);
    });

    proc.on('close', function (code) {
        procEntry.exitcode = code;
        instance.emit('complete', procEntry);
    });

    proc.on('error', function (code) {
        procEntry.exitcode = code;
        instance.emit('complete', procEntry);
        instance.emit('error', procEntry);
    });
}

instance.on('data', function (procEntry) {
    if (spawnerOptions.verbose) {
        if (procEntry.exitcode) {
            console.log("Exiting process %s", procEntry.pid || JSON.stringify(procEntry.exitcode));
        }
        else {
            console.log("%s : %s", procEntry.pid, procEntry.data);
        }
    }
});

instance.on('spawn', function (proc) {
    instance.processes[proc.pid] = proc;
});

instance.on('complete', function (proc) {
    proc.data = JSON.stringify({ exitcode: proc.exitcode })
    instance.emit('data', proc);
    if (proc) {
        delete instance.processes[proc.pid];
    }
})

instance.on('error', function (proc) {
    console.log("ERR : %s", JSON.stringify(proc.exitcode));
})

function mergeEnv(env) {
    var all = {};
    for (var key in process.env) {
        all[key] = process.env[key]
    }
    if (env) {
        for (var k in env) {
            all[k] = env[k];
        }
    }
    return all;
}


module.exports.spawn = startprocess;
module.exports.options = spawnerOptions; 
