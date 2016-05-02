var mdparser = require('./libs/mdparser');

function getnextstep(step) {
    var step = Number(step);
    if (Number.isNaN(step)) {
        step = -1;
    }
    return step + 1;
}

function resolveEnv(env){
    // Resolve upto 5 levels
    for(var i=0;i<5;++i) {
        var allSymbolsResolved   = true;
        for(var property in env){
            if (typeof (env[property]) == 'string') {
                    env[property] = env[property].replace(/\$\((.*?)\)/g, function(match, $1) {
                        return env[$1] || match;
                    });
                    if(env[property].indexOf("$(") > -1) {
                        allSymbolsResolved = false;
                    }
            }                  
        } 
        if(allSymbolsResolved){
            break;
        }
    }
    return env;
}
    
function process(in_msg, callbacktopic) {
    var msg = (typeof (in_msg) == 'string') ? JSON.parse(in_msg) : in_msg;
    
    if(msg.env) {
        msg.env = resolveEnv(msg.env);
    }
    var result =
        {
            msg: msg,
            target: ''
        };
    if (msg.exitcode && msg.exitcode != 0) {                
        return null;
    }

    //msg = msg.toString().replace(/'/g, "\"");
    result.msg.callbacktopic = callbacktopic;
    result.msg.step = getnextstep(result.msg.step);    
    result.msg.exitcode = undefined;   
    
    //Get next command
    var cmd = mdparser.getcommand(result.msg.testspec, result.msg.step, result.msg.env);
    if (cmd) {
        result.msg.command = cmd.command;
        result.target = cmd.target;
        return result;
    }

    return null;
}

module.exports.process = process;
