var express = require('express');
var router = express.Router();
var ccap = require("../../utils/captchaUtil");

router.get('/captcha/:rand', function (req, res, next) {
    var result = ccap();
    //console.log(result.text);
    req.session.passpod = result.text;
    res.end(result.buffer);
});
module.exports = router;
