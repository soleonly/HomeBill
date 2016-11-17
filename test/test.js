var images = require("images");

images(images("../public/uploads/1479179349463/Desert_2.jpg"), 200, 50, 600, 600)
    .resize(300)
    //等比缩放图像到400像素宽
    .save("../public/uploads/1479179349463/Desert_4.jpg", {
        quality : 50
    });