const envUtil = require('./env')

module.exports.setup = function (msg) {
    try {
        // Parse JSON and fetch out the cmd and 
        // callback topic.
        console.log(msg.payload)
        var payload = JSON.parse(msg.payload);
        msg.requestpayload = payload;
        msg.callbacktopic = payload.callbacktopic;
        var env = envUtil.get(payload.env);
        msg.env = env;
        msg.cwd = envUtil.resolve(payload.cwd, env);
        msg.payload = envUtil.resolve(payload.command, env);

    } catch (e) {
        console.log(e)
    }
    return msg;
};