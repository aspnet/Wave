const fs = require('fs');


const isInterruptRegex = ( /^win/.test(process.platform) ? /^[\s]*shutdown\s+/ : /^[\s]*sudo[\s]+shutdown\s+/ );
const backupFileLocation = '.recovery'

function isInterrupt(cmd) {
    return isInterruptRegex.test(cmd.toLowerCase())
}

function backup(msg) {
    var cmd = msg.payload;
	if (isInterrupt(cmd)) {
        var msgStr = JSON.stringify(msg);
        fs.writeFileSync(backupFileLocation, msgStr);
    }
    return msg;
}

function interrupt(msg) {
    var cmd = msg.requestpayload.command;
    if (isInterrupt(cmd) && msg.payload.exitcode == 0) {
        return null;
    }
    else {
        return msg;
    }
}

function cleanup(msg) {
    if (fs.existsSync(backupFileLocation)) {
        fs.unlinkSync(backupFileLocation);
    }
    return msg;
}

function recover(msg) {
    if (fs.existsSync(backupFileLocation)) {
        var msgStr = fs.readFileSync(backupFileLocation);
        var msg = JSON.parse(msgStr);
        // since we checked for exitcode == 0 before we interrupt
        // We can claim that the exit code was 0 and send it to the topic
        msg.payload = { exitcode : 0 }
        return msg;
    }
    else {
        return null;
    }
}

module.exports.backup = backup;
module.exports.interrupt = interrupt;
module.exports.cleanup = cleanup;
module.exports.recover = recover;
