/**
 * Created by liuqiangjian on 8/25/2016.
 */
var mongoose = require("mongoose");
var credentials = require('../../credentials');
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
db.on('error', function(err){
    console.log(err);
});
//博客schema
var blogSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, unique: true},
    title: {type: String}, //博客题目
    abstract: {type: String}, //摘要
    content: {type: String}, //文章内容
    click: {type: Number}//点击量
})
blogSchema.index({title:1});
//创建model,第三个参数是实际表名
var blogModel = mongoose.model("blog", blogSchema, "blog");
//标签表
var labelSchema = new mongoose.Schema({
    blogid: {type: mongoose.Schema.Types.ObjectId, ref: 'blog'},//这里即为子表的外键，关联主表。  ref后的blog代表的是主表blog的Model。
    label: {type: String} //标签名
});

//创建model,第三个参数是实际表名
var labelModel = mongoose.model("label", labelSchema, "label");

blogModel.find(function (err,blogs) {
    if(err){
        console.error(err);
    }
    if(blogs.length<3){
        var blogidV = mongoose.Types.ObjectId("123123123144");
        var query = {"_id": blogidV};
        var update = {title:"test",abstract:"test",content:"content",click:100};
        var options = {upsert: true,new: true};
        blogModel.findOneAndUpdate(query, update, options, function(err, doc) {
            if (err) {
                console.log(err);
            }
            //2.子表插入数据。 blogid为刚插入主表的主键
            labelModel.findOneAndUpdate({blogid: doc._id}, {blogid: doc._id, label: "lable"}, options, function(err, doc) {
                if (err) {
                    console.log(err);
                }
                //子表关联主表查询，populate里面为子表外键
                labelModel.find({}).populate('blogid').exec(function(err,docs){
                    console.log(docs);
                });
            });
        });
    }


    setTimeout(function(){
        db.close();
    },3000);
});




