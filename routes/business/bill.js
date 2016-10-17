var express = require('express');
var http = require('http');
var router = express.Router();
var Step = require('../../utils/Step');

router.get('/', function (req, res, next) {
    var options = {
        host: '127.0.0.1',
        port: '8080',
        path: '/HomeBill/rest/user/75',
        method: 'GET'
    }
    var reqPost = http.request(options, function (resPost) {
        var backdata = "";
        resPost.on('data', function (d) {
            backdata+=d;
        });
        resPost.on('end', function (d) {
            console.log(backdata);
            res.json(backdata);
        });
    });
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });
});


router.post('/post', function (req, res, next) {
    var reqJosnData = JSON.stringify(req.body);
    var postheaders = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': Buffer.byteLength(reqJosnData, 'utf8')
    };
    var optionspost = {
        host: '127.0.0.1',
        port: '8080',
        path: '/HomeBill/rest/user/75',
        method: 'POST',
        headers: postheaders
    };
    var reqPost = http.request(optionspost, function (resPost) {
        resPost.on('data', function (d) {
            res.send(d);
        });
    });
    reqPost.write(reqJosnData);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });
});
module.exports = router;
