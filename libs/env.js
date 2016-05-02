const fs = require('fs');

function setEnv(env) {
    _envConfigValues = null;
    var configStr = JSON.stringify(env, null, '\t');
    fs.writeFileSync(_envFilename, configStr);
    console.log("Environment variables written to " + _envFilename);
    _envConfigValues = getConfigValues();
}

function getConfigValues() {
    if (_envConfigValues) {
        return _envConfigValues;
    }

    try {
        var fstats = fs.statSync(_envFilename);
        if (fstats && fstats.isFile()) {
            var obj = JSON.parse(fs.readFileSync(_envFilename, 'utf8'));
            configValue = obj;
            return configValue;
        }
    } catch (e) {
    }
}

function getEnv(extras) {
    var configValue = getConfigValues();
    if (configValue || extras) {
        var all = {};
        merge(all, process.env);
        merge(all, configValue);
        merge(all, extras);
        return all;
    }
    else {
        return process.env;
    }
}

function merge(all, obj) {    
    if (obj) {
        for (var k in obj) {
            all[k] = obj[k];
        }
    }
}

var _envFilename = "config-env.json";
var _envConfigValues = null;

function setFilename(filename) {
    _envFilename = filename;
}

module.exports.set = setEnv;
module.exports.get = getEnv;
module.exports.setFilename = setFilename

