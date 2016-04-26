var mdparser = require('./libs/mdparser');

function getnextstep(step) {
    var step = Number(step);
    if (Number.isNaN(step)) {
        step = -1;
    }
    return step + 1;
}

function process(in_msg, callbacktopic) {
    var msg = in_msg;
    var result =
        {
            msg: JSON.parse(msg),
            target: ''
        };

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
