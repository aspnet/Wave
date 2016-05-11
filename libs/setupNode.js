const envUtil = require('./env')

module.exports.setup = function (msg) {
    var isSimple = true;
    var payload = msg.payload;

    // Parse JSON and fetch out the cmd and 
    // callback topic.
    try {
        console.log(msg.payload);
        payload = JSON.parse(msg.payload);
        isSimple = false; //Successfully parsed JSON and hence is a complex command;
        msg.requestpayload = payload;
        msg.callbacktopic = payload.callbacktopic;
    } catch (e) {
        console.log(e)
    }

    //Setup environment variables and cwd;
    // For simple commands .env .cwd will be undefined. 
    try {
        var envVars = envUtil.get(payload.env);
        msg.env = envVars;
        
        //Set the current working directory.
        var directory = envUtil.getCwd(payload.cwd);
        msg.cwd = envUtil.resolve(directory, envVars);

        //Simple commands have the command in the payload.
        msg.payload = envUtil.resolve(isSimple ? payload : payload.command, envVars);

    } catch (e) {
        console.log("Exception during environment setup " + e)
    }

    return msg;
};