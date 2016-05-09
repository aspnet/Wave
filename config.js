var os = require('os')
var credUtil = require('./libs/credUtil');

try {
    // a path we KNOW might not exists since it might not be configured.
    var credentials = require('./_creds');
    
    // Docker containers might have environment variables set and we need to clear them out. 
    credUtil.clearEnv();
}
catch (e) {
    console.log('Setup credentials using setup.js');
    return;
}

var config = {};
config.broker = credentials.broker;
config.clientid = credentials.clientid || os.hostname().toLowerCase();
module.exports = config;