/**
 * Created by liuqiangjian on 8/12/2016.
 */
var images = require("images");
module.exports = {
    deal: function (source, dist, x, y, width, height, resize) {
        var rst = images(images(source), x, y, width, height)
            .resize(resize)
            .save(dist, {
                quality: 50
            });
        if(rst!=null){
            return true;
        }else{
            return false;
        }
    },
    size: function (source) {
        var img = images(source);
        return {width:img.width(),height:img.height()};
    }
}