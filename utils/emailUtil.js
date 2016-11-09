/**
 * Created by liuqiangjian on 8/12/2016.
 */
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
module.exports = function (credentials) {
    var mailTransport = nodemailer.createTransport(smtpTransport({
        host: 'smtp.126.com',
        secureConnection: true,
        port: 465,
        auth: {
            user: credentials.email.user,
            pass: credentials.email.pass
        }
    }));
    var from = '"lqjaddls" <lqjaddls@126.com>';
    var errorRecipient = "lqjaddls@126.com";
    return {
        send: function (to, subj, body, control) {
            var errDesc = "邮件发送成功 ";
            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) {
                    errDesc = "邮件发送失败 ";
                    console.error( errDesc + err);
                    control.end(control.index + "." + errDesc);
                } else {
                    control.step(1);
                }
            });
        },
        emailError: function (message, filename, exception) {
            var body = "<h1> node web error</h1>message:<br><pre>" + message + "</pre><br>";
            if (exception) {
                body += "exception:<br><pre>" + exception + "</pre><br>";
            }
            if (filename) {
                body += "filename:<br><pre>" + filename + "</pre><br>";
            }
            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: " node web error",
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                console.error("Unable to send error email :" + err);
            })
        }

    }
}