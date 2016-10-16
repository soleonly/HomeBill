var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.render('flash', {title: 'flashTest'});
});

router.post('/newsLetter', function(req, res) {
  var name=req.body.name || "",email=req.body.email || "";
  console.log("name=%s;email-%s",name,email);
  console.log(req.session);
  req.session.flash={
    type:"success",
    intro:"Thank you!",
    message:"You have a new message!"
  }
  return res.json(req.session.flash);
});

module.exports = router;
