/**
 * Created by liuqiangjian on 8/12/2016.
 */
var fs = require("fs");
module.exports = {
    delDir: function (p) {
        function delFolder(path){
            var files = [];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                files.forEach(function (file, index) {
                    var curPath = path + "/" + file;
                    if (fs.statSync(curPath).isDirectory()) { // recurse
                        delFolder(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        }
        delFolder(p);
    },
    delFile: function (path) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    },
    mkDir:function(path){
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
}