var loadtest = require('loadtest');
var __dev_server = null;

function start()
{
    if(process.env.NODE_ENV == 'development'){
        var startServer = loadtest.startServer;
        __dev_server = startServer({ port: 8000 });
    }
}

module.exports.shutdown = function(){
    if(__dev_server){
        __dev_server.close();
        __dev_server = null;
    }
}

module.exports.setup = function(){
    start();
};