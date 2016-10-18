var ccap = require("ccap");
var captcha = ccap();

var ary = captcha.get();//ary[0] is captcha's text,ary[1] is captcha picture buffer.

var text = ary[0];

var buffer = ary[1];
console.log(text);
console.log(buffer);
