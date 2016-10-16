/**
 * Created by liuqiangjian on 8/12/2016.
 */
var crypto = require('crypto');
module.exports = function (key) {
    var md5 = crypto.createHash("md5");
    md5.update(key);
    return md5.digest('hex');
}