/**
 * Created by liuqiangjian on 8/19/2016.
 */
var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    username:{type: String},
    nickname:{type: String},
    password:{type: String},
    email:{type: String},
    gender:{type: Number},
    comments:{type: String},
    valid:{type: String},
    create:{type: Date},
    lastLogin:{type: Date},
    update:{type: Date},
    available:{type: Boolean},
    interests:[{type: String}],
});
userSchema.methods.getDisplayMoney = function(){
    return "￥" + this.money;
}
var userModel = mongoose.model("users",userSchema);
module.exports = userModel;