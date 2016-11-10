var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    console.log("logout 用户 " + req.session.user.username　+" 退出");
    req.session.user = null;
    res.redirect("/login");
});

module.exports = router;
