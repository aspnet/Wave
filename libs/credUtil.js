module.exports.clearEnv = function(){
    delete process.env["BROKER"];
    delete process.env["USERNAME"];
    delete process.env["PASSWORD"]; 
}