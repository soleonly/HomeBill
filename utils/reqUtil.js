/**
 * Created by liuqiangjian on 8/12/2016.
 */

module.exports = function (req, bean) {
    var rst={};
    if(req.method.toLocaleString().toLowerCase()=="post"){
        if (arguments.length == 2) {
            for(var p in bean){
                if(typeof ( bean[p]) != " function "){
                    bean[p.toString()]=req.body[p.toString()] || "";
                }
            }
            rst = bean;
        }else if (arguments.length == 1){
            for(var p in req.body){
                if(typeof ( req.body.p) != " function "){
                    rst[p.toString()]=req.body[p.toString()] || "";
                }
            }
        }
    }else if(req.method.toLocaleString().toLowerCase()=="get"){
        if (arguments.length == 2) {
            for(var p in bean){
                if(typeof ( bean.p) != " function "){
                    bean[p.toString()]=req.query[p.toString()] || "";
                }
            }
            rst = bean;
        }else  if (arguments.length == 1){
            for(var p in req.body){
                if(typeof ( req.body.p) != " function "){
                    rst[p.toString()]=req.query[p.toString()] || "";
                }
            }
        }
    }
    return rst;
}