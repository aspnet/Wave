const fs = require('fs');
const path = require('path');

function saveConfig(key, value) {
    var config = getConfig() || {};
    config[key] = value;
    if (!value) {
        delete config[key];
    }
    var configStr = JSON.stringify(config, null, '\t');
    fs.writeFileSync(_configFilename, configStr);
    console.log("Environment Configuration  written to " + _configFilename);
    _configValues = getConfig();
}

function getConfig() {
    if (_configValues) {
        return _configValues;
    }

    try {
        var fstats = fs.statSync(_configFilename);
        if (fstats && fstats.isFile()) {
            var obj = JSON.parse(fs.readFileSync(_configFilename, 'utf8'));
            configValue = obj;
            return configValue;
        }
    } catch (e) {}
}

function get(commandEnv) {
    var env = getEnv(commandEnv);
    if (env) {
        var envPath = getPath(env);
        if (envPath) {
            if ((process.platform === 'win32')) {
                env.Path = envPath; // windows path is actually `Path`
                env.PATH = envPath; // NODEJS spawn path  is case sensitive and is `PATH`.
            } else {
                env.PATH = envPath;
            }
        }
    }
    
    return env || process.env;
}

function set(env, path)
{
      saveConfig("env", env);
      saveConfig('extraPaths', paths);
}

function getEnv(commandEnv) {
    var config = getConfig();
    // Merge if we need to modify the process environment variables.
    var shouldClone = (config && config['env']) || (config && config['extraPaths']) || commandEnv;
    if (shouldClone) {
        var all = {};
        merge(all, process.env);
        merge(all, config ? config.env : null);
        merge(all, commandEnv);
        return all;
    }

    return null;
}

function merge(all, obj) {
    if (obj) {
        for (var k in obj) {
            all[k] = obj[k];
        }
    }
}

function getPath(env) {
    var config = getConfig();
    var extraPaths = config ? config['extraPaths'] : null;
    if (extraPaths) {
        return extraPaths + path.delimiter + (env.PATH || env.Path);
    }

    return null;
}


var _configFilename = "config-env.json";
var _configValues = null;

function setFilename(filename) {
    _configFilename = filename;
}


module.exports.set = set;
module.exports.get = get;
module.exports.setFilename = setFilename

