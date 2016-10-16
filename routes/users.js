var express = require('express');
var router = express.Router();
var User = require("../models/User.js");
//var mongoose = require("mongoose");

/* GET users listing. */
router.get('/', function(req, res, next) {
  initData();
  res.send("init ok");
});
function initData(){
  /*new User({
    name:"jim",
    age:10,
    desc:"test",
    interests:["football","swim"],
    available:true,
    money:1200.01,
    varsion:1
  }).save(function(error){
    if(error){
      console.error(error);
    }else{
      console.log("saved ok");
    }

  });*/
  User.find(function(err,users){
    if(err){
      console.error(err);
    }
    if(users.length) return;
    new User({
      name:"jim",
      age:10,
      desc:"test",
      interests:["football","swim"],
      available:true,
      money:1200.01,
      varsion:1
    }).save();
    new User({
      name:"tom",
      age:11,
      desc:"test",
      interests:["basketball"],
      available:true,
      money:1207.01,
      varsion:1
    }).save();
    new User({
      name:"jerry",
      age:9,
      desc:"test",
      interests:["run"],
      available:true,
      money:1260.01,
      varsion:1
    }).save();
  });
}

module.exports = router;
