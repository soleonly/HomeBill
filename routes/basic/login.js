var express = require('express');
var md5 = require('../../utils/md5Util');
var router = express.Router();
var User = require("../../models/User");
var Step = require('../../utils/Step');

router.get('/', function (req, res, next) {
    res.render('basic/login', {title: '登录', layout: "layout/logReg"});
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
function searchUserForLogin(res, UserModel, form, control) {
    UserModel.find({username: form.username}, function (err, users) {
        var errDesc = "";
        if (err) {
            errDesc = "检索用户名错误 ";
            console.error(errDesc + err);
            res.render('basic/login', {title: '账号登录', layout: "layout/logReg", form: form, msg: errDesc});
            control.end(control.index + "." + errDesc);
        }
        if (users.length == 0) {
            errDesc = "没有检索到用户 ";
            console.log(errDesc + form.username);
            res.render('basic/login', {
                title: '账号登录',
                layout: "layout/logReg",
                form: {username: form.username},
                msg: errDesc
            });
            control.end(control.index + "." + errDesc);
        } else if (users.length == 1) {
            if (users[0].available == false) {
                errDesc = "请登录邮箱激活 ";
                console.log(errDesc + form.username);
                var toAddress = users[0].email.replace(/(^\w+)@/gi, "http://mail@");
                res.render('basic/login', {
                    title: '登录',
                    form: form,
                    layout: "layout/logReg",
                    msg: errDesc,
                    url: toAddress
                });
                control.end(control.index + "." + errDesc);
            } else if (users[0].password != md5(form.password)) {
                errDesc = "密码错误 ";
                console.log(errDesc + form.username);
                res.render('basic/login', {
                    title: '登录',
                    form: form,
                    layout: "layout/logReg",
                    msg: errDesc,
                });
                control.end(control.index + "." + errDesc);
            } else {
                control.step(users[0]);
            }
        }
    });
}

function updateUserLogindate(res, UserModel, form, control) {
    var query = {username: form.username, available: true};
    var update = {lastLogin: new Date(), findPass: false};
    var options = {upsert: true, new: true};
    UserModel.findOneAndUpdate(query, update, options, function (err, doc) {
        if (err) {
            var errDesc = "用户登录错误";
            console.error(errDesc + err);
            res.render('basic/login', {
                title: '登录',
                layout: "layout/logReg",
                form: {username: form.username},
                msg: errDesc
            });
            control.end(control.index + "." + errDesc);
        } else {
            control.step(doc);
        }
    });
}
router.post('/post', function (req, res, next) {
    var form = asembleReq(req);
    Step.Step(function (result, entire) {
            var control = this;
            searchUserForLogin(res, User, form, control);
        }, function (result, entire) {
            var control = this;
            updateUserLogindate(res, User, result, control);
        }, function (result, entire) {
            var control = this;
            req.session.user = result;
            var rememberMeData = JSON.stringify({
                rememberMe: form.rememberMe,
                username: form.username,
                password: form.password
            })
            if (form.rememberMe == "on") {
                res.cookie('rememberMe', rememberMeData, {maxAge: 900000, path: '/'});
            } else {
                //res.clearCookie('rememberMe', {expires: -1, path: '/login'});
                res.clearCookie('rememberMe');
            }
            res.redirect('/');
            control.step(control.index + "." + result.username + "登录成功");
        }, function (result, entire) {
            console.log("register/post 过程描述 : " + entire);
        }
    );

});
module.exports = router;
