#!/usr/bin/env node
'use strict';

var spawner = require('../libs/spawner.js');
spawner.options.verbose = true;
var procInfo = {
    command : "cmd.exe /c set TEST   && dir explorer.exe /b",
    cwd : "c:/windows",
    env : {
        TEST : "RandomTestValue"
    }    
}
function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

spawner.spawn(clone(procInfo));
procInfo.env.TEST = "test2";
spawner.spawn(clone(procInfo));

procInfo.env.TEST = "test3";
spawner.spawn(clone(procInfo));


