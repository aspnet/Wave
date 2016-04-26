#!/usr/bin/env node
'use strict';

var fs = require('fs');
var util = require('util');
var process = require('process');

function getcommand(filename, index, env) {
    var cmd = getcommandText(filename, index);
    return applyEnv(cmd, env);
}

function getcommandText(filename, index, env) {
    var re = /\|\s*Command\s*\|\s*Host.*\n(?:(?:\|[\S:-]+)+)\n/m;
    var commandRe = /\|\s*`(.*)`\s*\|\s(\$\(.*\))\s\|\s*/m;
    var contents = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');
    var arrMatches = contents.match(re);
    if (arrMatches) {
        var commands = contents.substr(arrMatches.index + arrMatches[0].length).split('\n');
        if (commands && commands.length > index) {
            var command = commands[index];
            if (command) {
                var parts = command.match(commandRe);
                if (parts) {
                    var command = {
                        command: parts[1],
                        target: parts[2]
                    }
                    //console.log(command);
                    console.log(command);
                    return command;
                }
            }
        }
    }
};

function applyEnv(cmd, env) {
    if (cmd) {
        cmd.target = _replaceEnv(cmd.target, env);
        cmd.command = _replaceEnv(cmd.command, env);
    }
    return cmd;
}

function _replaceEnv(input, env) {
    if (typeof (input) == 'string')
        return input.replace(/\$\((.*?)\)/g, function(match, $1) {
            return env[$1] || match;
        });

    return null;
}

function cli() {
    var args = process.argv.slice(2);
    var filename = args[0];
    var index = args.length > 1 ? args[1] : 0;
    getcommand(filename, index);
}

if (require.main === module) {
    cli();
}

module.exports.getcommand = getcommand;
