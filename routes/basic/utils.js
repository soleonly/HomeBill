var express = require('express');
var router = express.Router();
var ccap = require("../../utils/captchaUtil");
var imageUtil = require('../../utils/imageUtil');
var reqUtil = require('../../utils/reqUtil');
var fs = require("fs");
var bodyParser = require('body-parser');
var jqupload  = require('jquery-file-upload-middleware');

router.get('/captcha/:rand', function (req, res, next) {
    var result = ccap();
    //console.log(result.text);
    req.session.passpod = result.text;
    res.end(result.buffer);
});
router.use('/upload', function(req, res, next) {
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir:function(){
            return __dirname + "/../../public/uploads/tmp/" + now;
        },
        uploadUrl:function(){
            return "/uploads/tmp/" + now;
        }
    })(req,res,next);

});
router.post('/picInfo', function(req, res, next) {
    var form = reqUtil(req);
    var basePath = __dirname + "/../../public";
    var picSize = imageUtil.size(basePath + form.path);
    res.json(picSize);
});
module.exports = router;
