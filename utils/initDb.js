/**
 * Created by liuqiangjian on 8/25/2016.
 */
var mongoose = require("mongoose");
mongoose.Promise = require('q').Promise;
var credentials = require('../credentials');
var opts = {
    auth:{
        authdb:"development"
    },
    server:{
        socketOptions:{
            keepAlive:1
        }
    }
}
mongoose.connect(credentials.mongo.development.connectionString,opts);
var db = mongoose.connection;
var menuModel = require('../models/Menu');
var promise = menuModel.find();
promise.then(function(menus){
    console.log(menus.length);
    if(menus.length!=5){
        menuModel.collection.remove({},function(err){
            if (err) {
                console.log(err);
            }
            var ms = [
                {name:"主页",nav:"home",target:"",hrel:"/"},
                {name:"文章",nav:"article",target:"",hrel:"/"},
                {name:"画廊",nav:"picture",target:"",hrel:"/"},
                {name:"收支明细",nav:"money",target:"",hrel:"/"},
                {name:"家庭设置",nav:"family",target:"",hrel:"/"}
            ];
            menuModel.collection.insert(ms,function(err,docs){
                console.info("%d potatoes were successfully stored.", docs.length);
            });
        });

    }
    setTimeout(function(){
        db.close();
    },3000);
});


