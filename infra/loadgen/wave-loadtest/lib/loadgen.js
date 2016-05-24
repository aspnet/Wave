var loadtest = require('loadtest');
var url = require('url');

var timedFunc = function (options) {
    var lastCall = 0;
    return function (latency, result, error) {
        if ((new Date() - lastCall < 1000) && !isLastRequest(latency, options))
            return false;
        lastCall = new Date();
        outputLatency(latency, result, error);
    }
};

function isLastRequest(latency, options) {
    return (options.maxRequests && options.maxRequests == latency.totalRequests);
}

function outputLatency(latency, result, error) {
    console.log("%j", latency);
}

function startLoadtest(options, callback) {

    var _options = {
        url: 'http://localhost:8000',
        maxRequests: 100,
        rps: 100,
        maxSeconds : 15,
        concurrency: 1,
        keepalive: true,
    };

    for (var k in _options) {
        _options[k] = _options[k];
    }

    for (var k in options) {
        _options[k] = options[k];
    }

    _options.statusCallback = timedFunc(_options);

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
function  basicJsonTest(){
    var self = this;
    var options = {
        url: 'http://localhost:8000',
        maxRequests: 10,
        concurrency: 1,
        rps: 1
    }
        
    self.next = function(callback){
       self.callback = callback;
    };

    startLoadtest(options, function (error) {
        if (error) {
            console.log("Error " + error)
        }
        console.log("[TestComplete]:basicJsonTest")
        self.callback();              
    });
    
    return self;
}

function  timeoutTest(){       
    var options = {
        url: 'http://localhost:8000',        
        concurrency: 1,
        maxRequests : 1000000,
        maxSeconds : 5,
        rps: 1
    }

    startLoadtest(options, function (error) {
        if (error) {
            console.log("Error " + error)
        }
        console.log("[TestComplete]:timeoutTest")
        server.close();
    });
}

var server = null;

module.exports.test = function(){
    server = loadtest.startServer(
        {
            port: 8000,
            delay: 500,
            quiet: true
        });

    basicJsonTest()
    .next(timeoutTest);    
} 