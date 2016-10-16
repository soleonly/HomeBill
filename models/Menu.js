/**
 * Created by liuqiangjian on 8/19/2016.
 */
var mongoose = require("mongoose");
var menuSchema = mongoose.Schema({
    name:{type: String},
    hrel:{type: String},
    nav:{type: String},
    target:{type: String}
});
var menuModel = mongoose.model("menu",menuSchema);
module.exports = menuModel;