/**
 * Created by liuqiangjian on 8/25/2016.
 */
var mongoose = require("mongoose");
mongoose.Promise = require('q').Promise;
var credentials = require('../../credentials');
var userSchema = mongoose.Schema({
    name:String,
    age:Number,
    desc:String,
    interests:[String],
    available:Boolean,
    money:Number,
    version:Number
});
userSchema.methods.getDisplayMoney = function(){
    return "￥" + this.money;
}
var userModel = mongoose.model("user",userSchema);
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
userModel.find(function(err,users){
    if(err){
        console.error(err);
    }
    if(users.length){
        for(var i=0;i<users.length;i++){
            console.log(users[i].getDisplayMoney());
        }

    }
    if(users.length<6){
        var user = new userModel({
                    name:"tim",
                    age:10,
                    desc:"test",
                    interests:["football","swim"],
                    available:true,
                    money:1291.01,
                    version:1
                });
        user.save(function(err,user){
            if(err){
                console.error(err);
            }
            console.log(user._id)
        });
        //db.close();
    }
    var promise = userModel.find({name:"tim"});
    promise.then(function(docs){
        console.log(docs.length);
    });

    setTimeout(function(){
        db.close();
    },3000);
});
