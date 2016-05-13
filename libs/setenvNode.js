const env = require('./env');
module.exports.set = function(msg) {
    msg.payload = 'hostname';
    var req = msg.requestpayload;

    if (req.logdir) {
        var logutil = global.get('log');
        var created = logutil.setlogdir(req.logdir)
        if (created === false) {
            msg.payload = "ERR_NOLOGDIR";
        }
    }

    var success = env.set(req.env, req.path, req.cwd);
    if (success === false) {
        msg.payload = "ERR_INCORRECT_ENV"
        return msg;
    }

    return msg;
}