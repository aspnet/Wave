const fs = require('fs');
const path = require('path');
const os = require('os');

function set(logpath) {
    var fullpath = path.resolve(logpath);
    var exists = dirExists(fullpath);
    if (exists) {
        var configStr = JSON.stringify(fullpath, null, '\t');
        fs.writeFile(_configFilename, configStr, function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("Logpath written to " + _configFilename);
        });

        _logpath = fullpath;
    }

    return exists;
}

function dirExists(fullpath) {
    var isDir = false;
    try {
        var fstats = fs.statSync(fullpath);
        if (fstats && fstats.isDirectory()) {
            isDir = true;
        }
    } catch (e) {
    }

    return isDir;
}

function get() {
    if (!_logpath) {
        try {
            var fstats = fs.statSync(_configFilename);
            if (fstats && fstats.isFile()) {
                var fullpath = JSON.parse(fs.readFileSync(_configFilename, 'utf8'));
                if (dirExists(fullpath)) {
                    _logpath = fullpath;
                }
            }
        } catch (e) {
        }
    }
    return _logpath;
}

var _configFilename = path.resolve("config-log.json");
var _logpath = null;

function init(localdir) {
    var current = get();
    if (!current) {
        var initdir = path.resolve(localdir);
        if (!fs.existsSync(initdir)) {
            fs.mkdirSync(initdir);
        }

        _logpath = initdir
    }
}

function resolveFilename(seed) {
    var seed = seed || os.hostname();
    var filename = require('util').format("agent_%s_log.txt", seed);
    var fullpath = path.resolve(_logpath, filename);
    return fullpath;
}

module.exports.init = init
module.exports.setlogdir = set;
module.exports.resolveFilename = resolveFilename;

