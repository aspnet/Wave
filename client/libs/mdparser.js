#!/usr/bin/env node
'use strict';

var fs = require('fs');
var util = require('util');

function getcommand(filename, index, env) {
    var contents = getContents(filename);
    if(contents == null) {
        return null;
    }
    var cmd = getcommandText(contents, index);
    return applyEnv(cmd, env);
}

function getContents(filename){
    var stat = fs.lstatSync(filename);
    if(stat.isFile()) {
       return fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');
    }
    return null;
    //if(filename.startWith("http"))    
}

function getcommandText(contents, index) {
    
    var re = /\|\s*Command\s*\|\s*Host.*\n(?:(?:\|[\S:-]+)+)\n/m;
    var commandRe = /\|\s*`(.*?)`\s*\|\s(\$\((.*?)\))\s*\|\s*/m;    
    var arrMatches = contents.match(re);
    if (arrMatches) {
        var commands = contents.substr(arrMatches.index + arrMatches[0].length).split('\n');
        if (commands && commands.length > index) {
            var command = commands[index];
            if (command) {
                //var parts = command.match(commandRe);
                var parts = command.split("|");
                if (parts) {
                    // Command is of the format `SomeCommand`
                    var cmd = parts[1].match(/`(.*?)`/m);
                    
                    // Target is of the format $(TARGET)
                    var targetName = parts[2].match(/\$\((.*?)\)/m);
                    
                    var command = {
                        command: cmd[1],
                        target: parts[2].trim(),
                        targetName: targetName[1]
                    };
                    
                    // cwd is of the format <config cwd="$(basepath)"/> 
                    var cwd = parts[1].match(/cwd=\"(.*?)\"/m);                    
                    if(cwd && cwd.length > 1) {
                        command.cwd = cwd[1];
                    }
                    command.async = false;                    
                    var async = parts[1].match(/async=\"(.*?)\"/m);
                    if(async && async.length >1) {
                        command.async = (async[1] == "true") ? true:false;
                    } 
                    return command;
                }
            }
        }
    }
    return "";
};

function applyEnv(cmd, env) {
    if (cmd) {
        for(var property in cmd) {
            cmd[property] = _replaceEnv(cmd[property], env[cmd.targetName]);
        }
        cmd.command = _replaceEnv(cmd.command, env[cmd.targetName]);
        
        if(/\.ps1/.test(cmd.command)) {
            if(!(/powershell.exe/.test(cmd.command))) {
                cmd.command = "powershell.exe -File " + cmd.command;
            }
        }
        
        var ps1 = cmd.command.match(/(\w+?)\.ps1/);
        if(ps1 && ps1.length > 1) {
            cmd.logfile = ps1[1] + ".log";
        }
        else{
            var exe = cmd.command.match(/cmd.exe \/c (\w+)/);
            if(exe && exe.length>1){
                 cmd.logfile=exe[1] + ".log"; 
            }
            else {
                var executable = cmd.command.match(/^\s*(\w+?)\s/);
                if(executable && executable.length>1) {
                    cmd.logfile = executable[1] + ".log";
                }
            }            
        }
    }
    return cmd;
}

function _replaceEnv(input, env) {
    if (typeof (input) == 'string')
        return input.replace(/\$\((.*?)\)/g, function(match, $1) {
            return env[$1] || match;
        });

    return input;
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
