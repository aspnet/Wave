const fs = require('fs-extra');
const util = require('util');
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
        return fs.ensureDirSync(fullpath);
    } catch (e) { }

    return false;
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

function resolveFilename(pid, logfile) {
    var filename = null;

    if (logfile) {
        var extension = path.extname(logfile);
        var name = extension ? path.basename(logfile, extension) : logfile;
        filename = util.format("%s_%s%s", name, pid, extension|| ".txt");
    }
    else {
        filename = util.format("agent_%s_log.txt", pid);
    }
    
    var fullpath = path.resolve(_logpath, filename);
    return fullpath;
}

function setConfigFilePath(filename) {
    _configFilename = filename;
}

module.exports.setFilename = setConfigFilePath;
module.exports.init = init
module.exports.setlogdir = set;
module.exports.resolveFilename = resolveFilename;

