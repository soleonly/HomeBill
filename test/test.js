var fsUtil = require('../utils/fsUtil');
var delFolder = "../public/uploads/1479179349463/Desert_2.jpg";
delFolder = delFolder.substring(0,delFolder.lastIndexOf("/"));
fsUtil.delDir(delFolder);