var express = require('express');
var credentials = require('../../credentials');
var httpUtil = require('../../utils/httpUtil')(credentials);
var router = express.Router();
var Step = require('../../utils/Step');

router.get('/', function (req, res, next) {
    function callback(d,control) {
        res.json(d);
        control.step(1);
    }
    function errorHandle(e,control) {
        console.error(e);
        control.end(e);
    }

    Step.Step(function (result, entire) {
            var control = this;
            httpUtil.get("/rest/user/75", callback, errorHandle,control);
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                console.log(control.index);
                control.step(1);
            }
        }, function (result, entire) {
            console.log("register/post 过程描述 : " + entire)
        }
    );
});


router.post('/post', function (req, res, next) {
    var reqJosnData = JSON.stringify(req.body);
    function callback(d) {
        res.json(d);
    }
    function errorHandle(e) {
        console.error(e);
    }
    httpUtil.post("/rest/user/75", reqJosnData, callback, errorHandle);
});

module.exports = router;
