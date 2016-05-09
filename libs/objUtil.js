module.exports.extend = function (obj, extra) {
    var clone = JSON.parse(JSON.stringify(obj));
    for (var i in extra) {
        clone[i] = extra[i];
    }
    return clone;
};