var express = require('express');
var router = express.Router();
var User = require("../../models/User");
var Step = require('../../utils/Step');
var credentials = require('../../credentials');
var emailUtil = require("../../utils/emailUtil")(credentials);
var md5 = require('../../utils/md5Util');
var reqUtil = require('../../utils/reqUtil');
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
    var oldPassword = req.body.oldPassword || req.query.oldPassword || "";
    var valid = req.body.valid || req.query.valid || "";
    var validOrig = _id + email + passpod;
    return {
        _id: _id,
        nickname: nickname,
        motto: motto,
        email: email,
        passpod: passpod,
        password: password,
        oldPassword: oldPassword,
        valid: valid,
        validOrig: validOrig,
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
                rst.msg = errMsg.substring(errMsg.indexOf("."));
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
    var body = "请点击<a href='http://localhost:3000/user/forgetPass?email=" + form.email + "'>修改密码</a>，重置HomeBlog密码。";
    emailUtil.send(form.email, subject, body, control);
}

router.get('/forgetPass', function (req, res, next) {
    res.render('basic/forgetPass', {title: '忘记密码', layout: "layout/logReg", email: req.query.email});
});
router.post('/forgetPass/post', function (req, res, next) {
    var form = asembleReq(req);
    var errDesc = "";
    var query = {email: form.email};
    var update = {findPass: false, password: md5(form.password)};
    var options = {upsert: true, new: true};
    User.findOne(query, function (err, doc) {
        if (err) {
            errDesc = "密码重置错误 ";
            console.error(errDesc + err);
            res.render('basic/forgetPass', {title: '忘记密码', layout: "layout/logReg", msg: errDesc});
        }
        if (doc.findPass == true) {
            User.findOneAndUpdate(query, update, options, function (err, doc) {
                if (err) {
                    errDesc = "密码重置错误 ";
                    console.error(errDesc + err);
                    res.render('basic/forgetPass', {title: '忘记密码', layout: "layout/logReg", msg: errDesc});
                }
                if (doc.findPass == false) {
                    res.redirect(303, '/login');
                }
            });
        } else {
            errDesc = "未开启密码重置";
            console.error(errDesc + err);
            res.render('basic/forgetPass', {title: '忘记密码', layout: "layout/logReg", msg: errDesc});
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
        if (doc != null) {
            User.findOneAndUpdate(query, update, options, function (err, doc) {
                if (err) {
                    errDesc = "修改用户信息 ";
                    console.error(errDesc + err);
                    res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1", msg: errDesc});
                }
                req.session.user = doc;
                res.redirect(303, '/');

            });
        } else {
            errDesc = "用户不存在";
            console.error(errDesc + err);
            res.render('basic/basicInfo', {title: '修改用户信息', layout: "layout/contentCol1", msg: errDesc});
        }

    });
});

router.get('/changePass', function (req, res, next) {
    res.render('basic/changePass', {title: '修改密码', layout: "layout/contentCol1", _id: req.session.user._id});
});
router.post('/changePass/post', function (req, res, next) {
    var form = asembleReq(req);
    var errDesc = "";
    if (form._id == null || form._id == '') {
        errDesc = "修改密码错误,重新提交 ";
        console.error(errDesc + err);
        res.render('basic/changePass', {
            title: '修改密码',
            layout: "layout/contentCol1",
            msg: errDesc,
            _id: req.session.user._id
        });
    }
    var query = {_id: mongoose.Types.ObjectId(form._id), password: md5(form.oldPassword)};
    var query1 = {_id: mongoose.Types.ObjectId(form._id)};
    var update = {password: md5(form.password)};
    var options = {upsert: true, new: true};
    User.findOne(query, function (err, doc) {
        if (err) {
            errDesc = "修改密码错误 ";
            console.error(errDesc + err);
            res.render('basic/changePass', {title: '修改密码', layout: "layout/contentCol1", msg: errDesc});
        }
        if (doc != null) {
            User.findOneAndUpdate(query1, update, options, function (err, doc) {
                if (err) {
                    errDesc = "修改密码错误 ";
                    console.error(errDesc + err);
                    res.render('basic/changePass', {title: '修改密码', layout: "layout/contentCol1", msg: errDesc});
                }
                if (doc.findPass == false) {
                    res.redirect(303, '/login');
                }
            });
        } else {
            errDesc = "密码不正确";
            console.error(errDesc + err);
            res.render('basic/changePass', {title: '修改密码', layout: "layout/contentCol1", msg: errDesc});
        }

    });
});

router.get('/changeEmail', function (req, res, next) {
    res.render('basic/changeEmail', {
        title: '修改邮箱',
        layout: "layout/logReg",
        _id: req.session.user._id,
        email: req.session.user.email
    });
});


router.post('/changeEmail/valid', function (req, res, next) {
    var form = asembleReq(req);
    var result = {};
    //校验邮箱
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
        result.success = false;
        result.msg = "邮箱格式错误";
        return result;
    }
    if (form._id == null || form._id == '') {
        result.success = false;
        result.msg = "修改邮箱错误,重新提交 ";
        return result;
    }
    form._id = mongoose.Types.ObjectId(form._id);
    Step.Step(function (result, entire) {
            var control = this;
            searchUserById(User, form, control);
        }, function (result, entire) {
            var control = this;
            testPassPod(req, form, control);
        }, function (result, entire) {
            console.log("changeEmail/valid 过程描述 : " + entire);
            var rst = {};
            if (1 == result) {
                rst.success = true;
                res.json(rst);
            } else {
                rst.success = false;
                var errMsg = entire[entire.length - 1];
                rst.msg = errMsg.substring(errMsg.indexOf("."));
                res.json(rst);
            }
        }
    );
});
function searchUserById(UserModel, form, control) {
    UserModel.find({_id: form._id}, function (err, users) {
        var errDesc = "";
        if (err) {
            errDesc = "检索用户错误 ";
            console.error(errDesc + err);
            control.end(control.index + "." + errDesc);
        }
        if (users.length == 0) {
            errDesc = "没有检索到用户 ";
            console.error(errDesc);
            control.end(control.index + "." + errDesc);
        } else if (users.length == 1) {
            control.step(1);
        }
    });
}

router.post('/changeEmail/post', function (req, res, next) {
    var form = asembleReq(req);
    if (form._id == null || form._id == '') {
        errDesc = "修改邮箱错误,重新提交 ";
        console.error(errDesc + err);
        res.render('basic/changeEmail', {
            title: '修改邮箱',
            layout: "layout/logReg",
            msg: errDesc,
            _id: req.session.user._id
        });
    }
    form._id = mongoose.Types.ObjectId(form._id);
    form.valid = md5(form.validOrig);
    form.username = req.session.user.username;
    Step.Step(function (result, entire) {
            var control = this;
            updateUserEmail(req, User, form, control);
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                sendChangeEmail(form, control);
            }
        }, function (result, entire) {
            console.log("changeEmail/post 过程描述 : " + entire);
            var rst = {};
            if (result == 1) {
                var toAddress = form.email.replace(/(^\w+)@/gi, "http://mail@");
                rst.success = true;
                rst.msg = "请登录邮箱激活账号";
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
function updateUserEmail(req, UserModel, form, control) {
    var errDesc = "";
    var query = {_id: form._id};
    var update = {valid: form.valid, available: false, email: form.email};
    var options = {upsert: true, new: true};
    UserModel.findOneAndUpdate(query, update, options, function (err, doc) {
        if (err) {
            errDesc = "状态更新错误 ";
            console.error(errDesc + err);
            control.end(control.index + "." + errDesc);
        }
        if (doc.available == false) {
            req.session.user = doc;
            control.step(1);
        }
    });
}
function sendChangeEmail(form, control) {
    var subject = "changeEmail";
    var body = "请点击<a href='http://localhost:3000/register/active?username=" + form.username + "&valid=" + form.valid + "'>激活</a>，开始使用HomeBlog。";
    emailUtil.send(form.email, subject, body, control);
}

router.get('/headPortrait', function (req, res, next) {
    res.render('basic/headPortrait', {title: '修改头像', layout: "layout/contentCol1", _id: req.session.user._id});
});
router.post('/headPortrait/post', function (req, res, next) {
    var form = reqUtil(req);
    console.log(form.path);
    if (form._id == null || form._id == '') {
        errDesc = "修改邮箱错误,重新提交 ";
        console.error(errDesc + err);
        res.render('basic/changeEmail', {
            title: '修改邮箱',
            layout: "layout/logReg",
            msg: errDesc,
            _id: req.session.user._id
        });
    }
    form._id = mongoose.Types.ObjectId(form._id);
    form.valid = md5(form.validOrig);
    form.username = req.session.user.username;
    Step.Step(function (result, entire) {
            var control = this;
            updateUserEmail(req, User, form, control);
        }, function (result, entire) {
            var control = this;
            if (result == 1) {
                sendChangeEmail(form, control);
            }
        }, function (result, entire) {
            console.log("changeEmail/post 过程描述 : " + entire);
            var rst = {};
            if (result == 1) {
                var toAddress = form.email.replace(/(^\w+)@/gi, "http://mail@");
                rst.success = true;
                rst.msg = "请登录邮箱激活账号";
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
module.exports = router;
