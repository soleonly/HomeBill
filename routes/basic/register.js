var express = require('express');
var md5 = require('../../utils/md5Util');
var router = express.Router();
var User = require("../../models/User.js");
var Step = require('../../utils/Step');
var credentials = require('../../credentials');
var emailUtil = require("../../utils/emailUtil")(credentials);
//var mongoose = require("mongoose");
/* GET login page. */
router.get('/', function (req, res, next) {
    res.render('basic/register', {title: '账号注册', layout: "layout/logReg"});
});
function asembleReq(req) {
    var username = req.body.username || req.query.username || "";
    var nickname = req.body.nickname || req.query.nickname || "";
    var email = req.body.email || req.query.email || "";
    var password = req.body.password || req.query.password || "";
    var valid = req.body.valid || req.query.valid || "";
    var validOrig = username + nickname + email + password;
    return {
        username: username,
        nickname: nickname,
        email: email,
        password: password,
        valid: valid,
        validOrig: validOrig
    }
}
function valid(form) {
    var result = {};
    //校验username
    if (!/^[a-z][a-z_0-9]{4,18}$/i.test(form.username)) {
        result.success = false;
        result.msg = "用户名格式错误";
        return result;
    }
    //校验name
    if (!/\w+/.test(form.nickname)) {
        result.success = false;
        result.msg = "昵称格式错误";
        return result;
    }
    //校验邮箱
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
        result.success = false;
        result.msg = "邮箱格式错误";
        return result;
    }
    result.success = true;
    result.valid = md5(form.validOrig);
    return result;
}
router.post('/valid', function (req, res, next) {
    var form = asembleReq(req);
    res.json(valid(form));
});
router.post('/post', function (req, res, next) {
    var form = asembleReq(req);
    var md = md5(form.validOrig);
    if (form.valid !== md) {
        res.render('basic/register', {title: '账号注册', layout: "layout/logReg", form: form, msg: "非法信息"});
        return;
    }
    form.password = md5(form.password);
    Step.Step(function (result, entire) {
            var control = this;
            searchUserForPost(res, User, form, control);
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                sendRegisterEmail(res, form, control);
            }
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                saveUser(res, User, form, control);
            }
        }, function (result, entire) {
            console.log("register/post 过程描述 : " + entire)
        }
    );
});

function searchUserForPost(res, UserModel, form, control) {
    UserModel.find({username: form.username}, function (err, users) {
        if (err) {
            var errDesc = "检索用户名错误 ";
            console.error(errDesc + err);
            res.render('basic/register', {title: '账号注册', layout: "layout/logReg", form: form, msg: errDesc});
            control.end(control.index + "." + errDesc);
        }
        if (users.length > 0) {
            errDesc = "用户名已存在 ";
            console.log(errDesc + form.username);
            res.render('basic/register', {title: '账号注册', layout: "layout/logReg", form: form, msg: errDesc});
            control.end(control.index + "." + errDesc);
        }
        control.step(1);
    });
}
function sendRegisterEmail(res, form, control) {
    var subject = "active account";
    var body = "请点击<a href='http://localhost:3000/register/active?username=" + form.username + "&valid=" + form.valid + "'>激活</a>，开始使用HomeBlog。";
    emailUtil.send(form.email, subject, body, control);
}
function saveUser(res, userModel, form, control) {
    form.available = false;
    form.create = new Date();
    new userModel(form).save(function (err, user) {
            var errDesc = "请登录邮箱激活用户 ";
            if (err) {
                errDesc = "用户保存错误 "
                console.error(errDesc + err);
                res.render('basic/register', {
                    title: '账号注册',
                    layout: "layout/logReg",
                    form: form,
                    msg: errDesc
                });
                control.end(control.index + "." + errDesc);
            } else {
                var toAddress = form.email.replace(/(^\w+)@/gi, "http://mail@");
                res.render('basic/login', {
                    title: '登录',
                    form: form,
                    layout: "layout/logReg",
                    msg: errDesc,
                    url: toAddress
                });
                control.step(1);
            }

        }
    );
}
function searchUserForActive(res, UserModel, form, control) {
    UserModel.find({username: form.username}, function (err, users) {
        var errDesc = "";
        if (err) {
            errDesc = "检索用户名错误 ";
            console.error(errDesc + err);
            res.render('basic/login', {title: '账号注册', layout: "layout/logReg", form: form, msg: errDesc});
            control.end(control.index + "." + errDesc);
        }
        if (users.length == 0) {
            errDesc = "没有检索到用户 ";
            console.log(errDesc + form.username);
            res.render('basic/login', {
                title: '账号注册',
                layout: "layout/logReg",
                form: {username: form.username},
                msg: errDesc
            });
            control.end(control.index + "." + errDesc);
        } else if (users.length == 1) {
            if(users[0].available==true){
                errDesc = "检索到用户已经激活 ";
                console.log(errDesc + form.username);
                res.render('basic/login', {
                    title: '账号注册',
                    layout: "layout/logReg",
                    form: {username: form.username},
                    msg: errDesc
                });
                control.end(control.index + "." + errDesc);
            }else{
                control.step(users[0]);
            }
        }
    });
}
router.get('/active', function (req, res, next) {
    var form = asembleReq(req);
    Step.Step(function (result, entire) {
        var control = this;
        searchUserForActive(res, User, form, control);
    }, function (result, entire) {
        var control = this;
        if (result != undefined) {
            if (result.valid != form.valid) {
                var errDesc = "校验字符串有问题";
                res.render('basic/login', {
                    title: '登录',
                    form: {username: form.username},
                    layout: "layout/logReg",
                    msg: errDesc
                });
                control.end(control.index + "." + errDesc);
            } else {
                control.step(1);
            }
        }
    }, function (result, entire) {
        var control = this;
        if (result == 1) {
            var query = {username: form.username, valid: form.valid};
            var update = {available: true};
            var options = {upsert: true, new: true};
            User.findOneAndUpdate(query, update, options, function (err, doc) {
                if (err) {
                    var errDesc = "用户激活错误";
                    console.error(errDesc + err);
                    res.render('basic/login', {
                        title: '登录',
                        layout: "layout/logReg",
                        form: {username: form.username},
                        msg: errDesc
                    });
                    control.end(control.index + "." + errDesc);
                } else {
                    res.render('basic/login', {title: '登录', layout: "layout/logReg", form: {username: form.username}});
                    control.step(1);
                }
            });
        }
    }, function (result, entire) {
        console.log("register/active 过程描述 : " + entire)
    });

});
module.exports = router;
