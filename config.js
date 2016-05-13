var os = require('os')
var credUtil = require('./libs/credUtil');

try {
    // a path we KNOW might not exists since it might not be configured.
    var credentials = require('./client/_creds');

    // Docker containers might have environment variables set and we need to clear them out. 
    credUtil.clearEnv();
}
catch (e) {
    console.log('Setup credentials using setup.js');
    return;
}

try {
    var ver = require('./artifacts/version.json')    
}
catch (e) {
    // ...
}

var config = {};
config.broker = credentials.broker;
config.clientid = credentials.clientid || os.hostname().toLowerCase();
config.version = ver || {};
module.exports = config;