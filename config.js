var os = require('os')

try {
    // a path we KNOW might not exists since it might not be configured.
    var credentials = require('./_creds')
}
catch (e) {
    console.log('Setup credentials using setup.js');
    return;
}

var config = {};
config.broker = credentials.broker;
config.clientid = credentials.clientid || os.hostname().toLowerCase();
module.exports = config;