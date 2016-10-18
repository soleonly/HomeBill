/**
 * Created by liuqiangjian on 8/12/2016.
 */
var ccap = require("ccap");
module.exports = function () {
    var options = {
        width: 280,
        height: 34,
        offset: 75,
        quality: 50,
        fontsize: 32,
        //generate: function () {return "123456";}
    }
    var captcha = ccap(options);
    var ary = captcha.get();
    //ary[0] is captcha's text,ary[1] is captcha picture buffer.
    return {text: ary[0].toLocaleString().toLowerCase(), buffer: ary[1]}
}