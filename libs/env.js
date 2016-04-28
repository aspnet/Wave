const fs = require('fs');

function setEnv(env) {
    var configStr = JSON.stringify(env, null, '\t');
    var fs = require('fs');
    fs.writeFile(_envFilename, configStr, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Environment variables written to " + _envFilename);
    });
}

function getEnv() {
    var obj = JSON.parse(fs.readFileSync(_envFilename, 'utf8'));
    return obj;
}

var _envFilename = "environmentVariables.json";

function setFilename(filename)
{
    _envFilename = filename;
}

module.exports.set = setEnv;
module.exports.get = getEnv;
module.exports.setFilename = setFilename

