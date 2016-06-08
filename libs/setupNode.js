const envUtil = require('./env')

module.exports.setup = function (msg) {
    var payload = msg.payload;

    // Parse JSON and fetch out the cmd and 
    // callback topic.
    try {
        console.log(msg.payload);
        payload = JSON.parse(msg.payload);
        //Successfully parsed JSON and hence is a complex command;  
        msg.callbacktopic = payload.callbacktopic;
    } catch (e) {
        console.log("Simple command Received");
        payload = { command: payload };
    }

    //Setup environment variables and cwd;
    // For simple commands .env .cwd will be undefined. 
    try {

        //Set the requestpayload
        msg.requestpayload = payload;

        //Fix environment variables.
        var envVars = envUtil.get(payload.env);
        msg.env = envVars;

        // Set the current working directory.
        // Configuration commands use the cwd to store the value
        var directory = envUtil.getCwd(payload.cwd);
        msg.cwd = envUtil.resolve(directory, envVars);

        //Simple commands have the command in the payload.
        msg.payload = envUtil.resolve(payload.command, envVars);

    } catch (e) {
        console.log("Exception during environment setup " + e)
    }

    return msg;
};