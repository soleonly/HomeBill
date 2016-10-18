/**
 * Created by liuqiangjian on 10/18/2016.
 */
var http = require("http");
module.exports = function (credentials) {
    var options = {
        host: credentials.http.host,
        port: credentials.http.port,
    }
    return {
        get: function (url, callback, errorHandle, control) {
            options.path = credentials.http.project + url;
            options.method = 'GET';
            var reqPost = http.request(options, function (resPost) {
                var backdata = "";
                resPost.on('data', function (d) {
                    backdata += d;
                });
                resPost.on('end', function () {
                    callback(backdata, control);
                });
            });
            reqPost.end();
            reqPost.on('error', function (e) {
                errorHandle(e, control);
            });
        },
        post: function (url, jsonData, callback, errorHandle, control) {
            options.path = credentials.http.project + url;
            options.method = 'POST';
            options.postheaders = {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': Buffer.byteLength(jsonData, 'utf8')
            };
            var reqPost = http.request(options, function (resPost) {
                var backdata = "";
                resPost.on('data', function (d) {
                    backdata += d;
                });
                resPost.on('end', function () {
                    callback(backdata, control);
                });
            });
            reqPost.write(jsonData);
            reqPost.end();
            reqPost.on('error', function (e) {
                errorHandle(e, control);
            });
        }
    }
}