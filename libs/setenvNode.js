const env = require('./env');
const logutil = require('./log');

module.exports.set = function (msg) {
    msg.payload = 'hostname';
    
    var req = msg.requestpayload;    
    var options = req ? req.options : null;
    
    if (options) {
        if (options.logdir) {
            var created = logutil.setlogdir(options.logdir)
            if (created === false) {
                msg.payload = "ERR_NOLOGDIR";
            }
        }

        var success = env.set(options.env, options.path, options.cwd);
        if (success === false) {
            msg.payload = "ERR_INCORRECT_ENV"
            return msg;
        }
    }

    return msg;
}