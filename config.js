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

module.exports = config;