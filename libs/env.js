const fs = require('fs');
const path = require('path');

function udpateConfig(key, value) {
    var config = getConfig() || {};

    // If the valid defined value has been passed then 
    // update the value in the config object.
    if (typeof (value) !== 'undefined') {
        config[key] = value;
    }

    // Clear the keys only if the value is null
    if (value == "") {
        delete config[key];
    }

    _configValues = config;
}

function getConfig() {
    if (!_configValues) {
        try {
            var fstats = fs.statSync(_configFilename);
            if (fstats && fstats.isFile()) {
                var obj = JSON.parse(fs.readFileSync(_configFilename, 'utf8'));
                _configValues = obj;
            }
        } catch (e) { }
    }

    return _configValues;
}

function get(commandEnv) {
    var env = getEnv(commandEnv);
    if (env) {
        var envPath = getPath(env);
        if (envPath) {
            if ((process.platform === 'win32')) {
                delete env.Path;
                env.PATH = envPath; // NODEJS spawn path  is case sensitive and is `PATH`.
            } else {
                env.PATH = envPath;
            }
        }

        //TODO : Fix the same for non-windows platforms. 
        resolveDependentVars(env);
    }

    return env || process.env;
}

function resolveDependentVars(env) {
    for (var k in env) {
        env[k] = resolveVariabale(env[k], env)
    }

    return env;
}

function resolveVariabale(input, env) {
    if (!input)
        return;

    if (process.platform === 'win32') {
        return input.replace(/%([^%]+)%/g, function (_, n) {
            return env[n] || ("%" + n + "%");
        });
    }
    return input;
}

function set(env, path, cwd) {
    try {
        var cwd = getCwd(cwd);

        udpateConfig("env", env);
        udpateConfig('extraPaths', path);
        udpateConfig('cwd', cwd);

        var configStr = JSON.stringify(_configValues, null, '\t');
        fs.writeFileSync(_configFilename, configStr);
        console.log("Environment Configuration  written to " + _configFilename);
        return true;
    } catch (e) { }
    return false;
}

function getCwd(directory) {
    //Check if we are trying to unset the directory.    
    if (directory == "") {
        return directory;
    }
    
    var configCwd = (getConfig() || {})["cwd"];
    var cwd = directory;
    if (cwd) {
        if ((path.isAbsolute(cwd) == false) && (configCwd)) {
            cwd = path.join(configCwd, cwd);
        }
    } else {
        // No overriding path and hence use the configured CWD.
        cwd = configCwd;
    }

    if (cwd) {
        // throw because you can't set a cwd that would 
        // mess up the agent.
        var fstats = fs.statSync(cwd);
        if (!fstats || !fstats.isDirectory()) {
            throw Error("Not a valid directory")
        }
        
        cwd = path.resolve(cwd);
    }

    return cwd;
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
module.exports.getCwd = getCwd;
module.exports.resolve = resolveVariabale
module.exports.setFilename = setFilename

