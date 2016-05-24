var loadtest = require('loadtest');
var url = require('url');

var timedFunc = (function () {
    var lastCall = 0;
    return function (latency, result, error) {
        if ((new Date() - lastCall < 1000) && !isLastRequest(latency)) 
            return false;
        lastCall = new Date();
        outputLatency(latency, result, error);
    }
})();

function isLastRequest(latency){
    return (_options.maxRequests && _options.maxRequests == latency.totalRequests);
}

function outputLatency(latency, result, error) {    
    console.log("%j", latency);
}

var _options = {
    url: 'http://localhost:8000',
    maxRequests: 100,
    rps: 100,
    concurrency: 1,
    keepalive: true,
    statusCallback: timedFunc
};

function startLoadtest(options, callback) {

    for (var k in _options) {
        _options[k] = _options[k];
    }

    for (var k in options) {
        _options[k] = options[k];
    }

    loadtest.loadTest(_options, function (error) {
        if (error) {
            return console.error('Got an error: %s', error);
        }
        if (callback) {
            callback(error);
        }
    });
}

module.exports.startLoadtest = startLoadtest;
module.exports.test = function () {
    var server = loadtest.startServer(
        {
            port: 8000,
            delay : 10,
            quiet: true
        });

    var options = {
        url: 'http://localhost:8000',
        maxRequests: 200,
        concurrency: 1,
        rps: 1      
    }

    startLoadtest(options, function (error) {
        if(error){
            console.log("Error " + error)
        }
                
        server.close();
    });
}