var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var mongoose = require("mongoose");
var index = require('./routes/basic/index');
var login = require('./routes/basic/login');
var register = require('./routes/basic/register');
var user = require('./routes/basic/user');
var utils = require('./routes/basic/utils');
var bill = require('./routes/business/bill');
var users = require('./routes/users');
var block = require('./routes/block');
var client = require('./routes/client');
var upload = require('./routes/upload');
var credentials = require('./credentials');
var menuDao = require("./models/Menu.js");
var flash = require('./routes/flash');
var email = require('./routes/email');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', exphbs({
    layoutsDir: 'views',
    defaultLayout: 'layout/contentCol2',
    partialsDir: 'views/partials',
    extname: '.hbs',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));


app.set('view engine', 'hbs');
app.set('view cache', true);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser(credentials.cookieSecret));
app.use(session({
    secret: credentials.cookieSecret,
    name: 'blog',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {},  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期,
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
var opts = {
    auth: {
        authdb: "development"
    },
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
}
switch (app.get("env")) {
    case "development":
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case "production":
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error("unknown Exception environment: " + app.get("env"));
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});
app.use(function (req, res, next) {
    getSessionUser(req,res);
    getMenuData(res, next);
});
function getSessionUser(req, res){
    res.locals.user = req.session.user;
}
function getMenuData(res, next) {
    if (!res.locals.partials) {
        res.locals.partials = {};
    }
    if (global.menus) {
        res.locals.partials.menus = global.menus;
        next();
    } else {
        menuDao.find(function (err, users) {
            if (err) {
                console.error(err);
            }
            global.menus = users;
            res.locals.partials.menus = global.menus;
            next();
        });
    }
}
app.use(function (req, res, next) {
    var reqUrl = req.url;
    var reg=/\/login\s*|\/register\s*|\/user\/findPass|\/utils\/*/;
    if(!reg.test(reqUrl)){
        if(!req.session.user){
            res.redirect("/login");
        }else{
            next();
        }
    }else{
        next();
    }
});
app.use('/', index);
app.use('/login', login);
app.use('/register', register);
app.use('/bill', bill);
app.use('/user', user);
app.use('/utils', utils);
app.use('/users', users);
app.use('/email', email);
app.use('/block', block);
app.use('/client', client);
app.use('/upload', upload);
app.use('/flash/newsLetter', function (req, res, next) {
    next();
    res.locals.flash = req.session.flash;
    delete req.session.flash;
});
app.use('/flash', flash);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
