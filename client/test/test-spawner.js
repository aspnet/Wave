#!/usr/bin/env node

var isWin = /^win/.test(process.platform);
var spawner = require('../libs/spawner.js');
spawner.options.verbose = true;

var procInfo = {};

if (isWin) {
    procInfo = {
        command: "cmd.exe /c set TEST  && dir explorer.exe /b",
        cwd: "c:/windows",
        env: {
            TEST: "RandomTestValue"
        }
    };
}
else {
    procInfo = {
        command: "printenv TEST",
        cwd: "/usr",
        env: {
            "TEST": "RandomNonWindowsValue"
        }
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


