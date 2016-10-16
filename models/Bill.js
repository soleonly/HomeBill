/**
 * Created by liuqiangjian on 8/19/2016.
 */
var mongoose = require("mongoose");
var billSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, unique: true},
    title: {type: String}, //博客题目
    abstract: {type: String}, //摘要
    content: {type: String}, //文章内容
    click: {type: Number}//点击量
});
var billSchema = mongoose.model("bills",billSchema);
module.exports = billSchema;