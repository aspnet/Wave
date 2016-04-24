module.exports = function MessageProcessor(in_msg, callbacktopic) {
    var self = this;
    var msg = in_msg;
    self.out_msg = in_msg;
    self.out_target = '';
    process_message();

    function process_message() {
        msg = msg.toString().replace(/'/g, "\"");
        msg = JSON.parse(msg);
        self.out_msg = msg;
        self.out_msg.callbacktopic = callbacktopic;

        determine_next_step();
        fetch_command_and_target();
        apply_env();
    }

    function determine_next_step() {
        var step = Number(msg.step);
        if (Number.isNaN(step)) {
            step = -1;
        }
        self.out_msg.step = step + 1;
    }

    function fetch_command_and_target() {
        var fs = require('fs');
        var util = require('util');
        var re = /\|\s*Command\s*\|\s*Host.*\n(?:(?:\|[\S:-]+)+)\n/m;
        var commandRe = /\|\s*`(.*)`\s*\|\s(\$\(.*\))\s\|\s*/m;
        var contents = fs.readFileSync(msg.testspec, 'utf8').replace(/\r\n/g, '\n');
        var arrMatches = contents.match(re);
        if (arrMatches) {
            var commands = contents.substr(arrMatches.index + arrMatches[0].length).split('\n');
            var command = commands[self.out_msg.step];
            if (command) {
                var parts = command.match(commandRe);
                if (parts) {
                    self.out_msg.command = parts[1];
                    self.out_target = parts[2];
                    return;
                }
            }
            self.out_target = null;
            self.out_msg = null;
        }
    }

    function apply_env() {
        if (!self.out_target || !self.out_msg) {
            return;
        }
        self.out_target = self.out_target.replace(/\$\((.*?)\)/g, function(str, match) {
            return self.out_msg.env[match];
        });
        self.out_msg.command = self.out_msg.command.replace(/\$\((.*?)\)/g, function(match) {
            return self.out_msg.env[match];
        });
    }
}
