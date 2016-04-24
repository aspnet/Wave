var os = require('os');
var colors = require('colors');
var sleep = require('sleep');

var controllertopic = 'job/' + os.hostname() + '/test';

const spawn = require('child_process').spawn;

const controller = spawn('nodejs', ['controller.js', '--test', '--verbose']);
controller.on('close', function(code) {
    console.log('controller exited with code ' + code);
    if (code == 0) {
        console.log('Test Status: Success');
    }
    agent.kill('SIGHUP');
});
controller.stdout.on('data', function(data) {
    process.stdout.write(colors.green('[Controller]: ') + data);
});
console.log(colors.green('[Controller] Started - Listening on '+ controllertopic));

var agenttopic = 'client/+/test';
const agent = spawn('nodejs', ['./cmdport.js', 'subscribe', '-t', agenttopic]);
agent.stdout.on('data', function(data) {
    console.log(colors.blue('[Agent]: InMsg') + data);
    console.log(colors.yellow('[Test]: ') + "OutMsg to " + controllertopic + " " + data);
    var test = spawn('nodejs', ['./cmdport.js', 'send', '-t', controllertopic, '-m', data]);

});
console.log(colors.blue('[Agent] Started - Listening on '+ agenttopic));

sleep.sleep(2);

console.log(colors.yellow("[Test]: ") + " Kickoff test run - Sending message to " + controllertopic + ": { 'testspec': './test.md', 'env': {'server': 'M1', 'client': 'M2' }}");
const test = spawn('nodejs', ['./cmdport.js', 'send', '-t', controllertopic, '-m', "{ 'testspec': './test.md', 'env': {'server': 'M1', 'client': 'M2' }}"]);
test.on('close', function(code) {
    console.log('testcmd exited with code ' + code);
});
