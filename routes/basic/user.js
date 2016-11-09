var express = require('express');
var router = express.Router();
var User = require("../../models/User");
var Step = require('../../utils/Step');
var credentials = require('../../credentials');
var emailUtil = require("../../utils/emailUtil")(credentials);
var md5 = require('../../utils/md5Util');
var mongoose = require("mongoose");
router.get('/findPass', function (req, res, next) {
    res.render('basic/findPass', {title: '找回密码', layout: "layout/logReg"});
});

function asembleReq(req) {
    var _id = req.body._id || req.query._id || "";
    var nickname = req.body.nickname || req.query.nickname || "";
    var motto = req.body.motto || req.query.motto || "";
    var email = req.body.email || req.query.email || "";
    var passpod = req.body.passpod || req.query.passpod || "";
    var password = req.body.password || req.query.password || "";
    return {
        _id: _id,
        nickname: nickname,
        motto: motto,
        email: email,
        passpod: passpod,
        password: password,
    }
}

router.post('/findPass/valid', function (req, res, next) {
    var form = asembleReq(req);
    var result = {};
    //校验邮箱
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
        result.success = false;
        result.msg = "邮箱格式错误";
        return result;
    }
    Step.Step(function (result, entire) {
            var control = this;
            searchUser(User, form, control);
        }, function (result, entire) {
            var control = this;
            testPassPod(req, form, control);
        }, function (result, entire) {
            console.log("findPass/valid 过程描述 : " + entire);
            var rst = {};
            if (1 == result) {
                rst.success = true;
                res.json(rst);
            } else {
                rst.success = false;
                var errMsg = entire[entire.length - 1];
                rst.msg = errMsg.substring(errMsg.indexOf("."));;
                res.json(rst);
            }

        }
    );

});
function searchUser(UserModel, form, control) {
    UserModel.find({email: form.email}, function (err, users) {
        var errDesc = "";
        if (err) {
            errDesc = "检索用户名错误 ";
            console.error(errDesc + err);
            control.end(control.index + "." + errDesc);
        }
        if (users.length == 0) {
            errDesc = "没有检索到注册邮箱 ";
            console.error(errDesc);
            control.end(control.index + "." + errDesc);
        } else if (users.length == 1) {
            control.step(1);
        }
    });
}
function testPassPod(req, form, control) {
    var errDesc = "";
    var pp = req.session.passpod;
    if (form.passpod.toLocaleString().toLowerCase() != pp) {
        errDesc = "验证码不正确 ";
        console.error(errDesc + pp);
        control.end(control.index + "." + errDesc);
    } else {
        control.step(1);
    }
}

router.post('/findPass/post', function (req, res, next) {
    var form = asembleReq(req);
    Step.Step(function (result, entire) {
            var control = this;
            updateUserFindPass(User, form, control);
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                sendFindPassEmail(form, control);
            }
        }, function (result, entire) {
            console.log("findPass/post 过程描述 : " + entire);
            var rst = {};
            if (result == 1) {
                var toAddress = form.email.replace(/(^\w+)@/gi, "http://mail@");
                rst.success = true;
                rst.msg = "请登录邮箱修改密码";
                rst.url = toAddress;
                res.json(rst);
            } else {
                rst.success = false;
                rst.msg = entire[entire.length - 1];
                res.json(rst);
            }
        }
    );

});
function updateUserFindPass(UserModel, form, control) {
    var errDesc = "";
    var query = {email: form.email};
    var update = {findPass: true};
    var options = {upsert: true, new: true};
    UserModel.findOneAndUpdate(query, update, options, function (err, doc) {
        if (err) {
            errDesc = "状态更新错误 ";
            console.error(errDesc + err);
            control.end(control.index + "." + errDesc);
        }
        if (doc.findPass == true) {
            control.step(1);
        }
    });
}
function sendFindPassEmail(form, control) {
    var subject = "findPass";
    var body = "请点击<a href='http://localhost:3000/user/changePass?email=" + form.email + "'>修改密码</a>，重置HomeBlog密码。";
    emailUtil.send(form.email, subject, body, control);
}

router.get('/changePass', function (req, res, next) {
    res.render('basic/changePass', {title: '修改密码', layout: "layout/logReg", email: req.query.email});
});
router.post('/changePass/post', function (req, res, next) {
    var form = asembleReq(req);
    var errDesc = "";
    var query = {email: form.email};
    var update = {findPass: false, password: md5(form.password)};
    var options = {upsert: true, new: true};
    User.findOne(query, function (err, doc) {
        if (err) {
            errDesc = "密码重置错误 ";
            console.error(errDesc + err);
            res.render('basic/changePass', {title: '修改密码', layout: "layout/logReg", msg: errDesc});
        }
        if (doc.findPass==true) {
            User.findOneAndUpdate(query, update, options, function (err, doc) {
                if (err) {
                    errDesc = "密码重置错误 ";
                    console.error(errDesc + err);
                    res.render('basic/changePass', {title: '修改密码', layout: "layout/logReg", msg: errDesc});
                }
                if (doc.findPass == false) {
                    res.redirect(303, '/login');
                }
            });
        }else{
            errDesc = "未开启密码重置";
            console.error(errDesc + err);
            res.render('basic/changePass', {title: '修改密码', layout: "layout/logReg", msg: errDesc});
        }

    });


});

router.get('/basicInfo', function (req, res, next) {
    res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1"});
});
router.post('/basicInfo/post', function (req, res, next) {
    var form = asembleReq(req);
    var errDesc = "";
    var query = {_id: mongoose.Types.ObjectId(form._id)};
    var update = {nickname: form.nickname, motto: form.motto};
    var options = {upsert: true, new: true};
    User.findOne(query, function (err, doc) {
        if (err) {
            errDesc = "修改用户信息 ";
            console.error(errDesc + err);
            res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1", msg: errDesc});
        }
        if (doc!=null) {
            User.findOneAndUpdate(query, update, options, function (err, doc) {
                if (err) {
                    errDesc = "修改用户信息 ";
                    console.error(errDesc + err);
                    res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1", msg: errDesc});
                }
                if (doc.findPass == false) {
                    res.redirect(303, '/');
                }
            });
        }else{
            errDesc = "用户不存在";
            console.error(errDesc + err);
            res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1", msg: errDesc});
        }

    });


});
module.exports = router;
