const fs = require('fs');

function setEnv(env) {
    var configStr = JSON.stringify(env, null, '\t');
    fs.writeFile(_envFilename, configStr, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Environment variables written to " + _envFilename);
    });
}

function getEnv() {
    try {
        var fstats = fs.statSync(_envFilename);
        if (fstats && fstats.isFile()) {
            var all = {};
            for (var k in process.env) {
                all[k] = process.env[k]
            }
            var obj = JSON.parse(fs.readFileSync(_envFilename, 'utf8'));
            for (var k in obj) {
                all[k] = obj[k];
            }

            return all;
        }
    } catch (e) {
    }

    return process.env;

}

var _envFilename = "config-env.json";

function setFilename(filename) {
    _envFilename = filename;
}

module.exports.set = setEnv;
module.exports.get = getEnv;
module.exports.setFilename = setFilename

