var express = require('express');
var credentials = require('../../credentials');
var httpUtil = require('../../utils/httpUtil')(credentials);
var router = express.Router();
var Step = require('../../utils/Step');

router.get('/', function (req, res, next) {
    function callback(d) {
        res.json(d);
    }
    function errorHandle(d) {
        console.error(e);
    }
    httpUtil.get("/rest/user/75", callback, errorHandle);
});


router.post('/post', function (req, res, next) {
    var reqJosnData = JSON.stringify(req.body);
    function callback(d) {
        res.json(d);
    }
    function errorHandle(d) {
        console.error(e);
    }
    httpUtil.post("/rest/user/75", reqJosnData, callback, errorHandle);
});

module.exports = router;
