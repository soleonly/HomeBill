var express = require('express');
var md5 = require('../../utils/md5Util');
var router = express.Router();
var User = require("../../models/User.js");
var Step = require('../../utils/Step');

router.get('/findPass', function (req, res, next) {
    res.render('basic/findPass', {title: '找回密码', layout: "layout/logReg"});
});
function asembleReq(req) {
    var username = req.body.username || req.query.username || "";
    var password = req.body.password || req.query.password || "";
    var rememberMe = req.body.rememberMe || "";
    return {
        username: username,
        password: password,
        rememberMe: rememberMe,
    }
}
module.exports = router;
