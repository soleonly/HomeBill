/**
 * Created by liuqiangjian on 8/19/2016.
 */
var mongoose = require("mongoose");
var menuSchema = mongoose.Schema({
    name:String,
    hrel:String,
    nav:String,
    target:String
});
var menuModel = mongoose.model("menu",menuSchema);
module.exports = menuModel;