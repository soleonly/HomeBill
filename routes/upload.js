var express = require('express');
var router = express.Router();
var fs = require("fs");
var bodyParser = require('body-parser');
var jqupload  = require('jquery-file-upload-middleware');

/* GET home page. */
router.use('/upload', function(req, res, next) {
  var now = Date.now();
  jqupload.fileHandler({
    uploadDir:function(){
      return __dirname + "/../public/uploads/tmp/" + now;
    },
    uploadUrl:function(){
      return "/uploads/tmp/" + now;
    }
  })(req,res,next);

});

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('upload', {title: 'uploadTest'});
});

module.exports = router;
