var express = require('express');
var router = express.Router();

router.get('/findPass', function (req, res, next) {
    res.render('basic/findPass', {title: '找回密码', layout: "layout/logReg"});
});

module.exports = router;
