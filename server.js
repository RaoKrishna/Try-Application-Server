var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
//var sql = require('mssql');
var fs = require('fs');
var https = require('https');
var jwt = require('jsonwebtoken');
var auth = require('./app/helpers/authenticateUser');

var app = express();
var privateKey = fs.readFileSync('./privatekey.key', 'utf8');
var certificate = fs.readFileSync('./certificate.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var portNo = process.env.PORT || 5000;

app.use(function(req, res, next) {
    //console.log('IP is: ' , req.ip);
    next();
    /*if (allowed(req.ip))
     next();
     else
     res.status(403).end('forbidden');*/
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

    if ('OPTIONS' == req.method) {
        return res.send(200);
    } else {
        next();
    }
});

process.env[`WD_BACKPATH2`] = "../SUBMISSION/studemt";

//app.use(passport.initialize());
//app.use(passport.session());
var loginRouter = require('./app/LoginRoutes')();
app.use('/login', loginRouter);

var studentRouter = require('./app/StudentRoutes')();
app.use(function(req, res, next) {

    var token = req.headers['authorization'];
    auth.authenticateUser(token, function(username) {
        if(username != null) {
            //console.log("Username is: ", username);
            next();
        } else {
            res.sendStatus(401);
        }
    });
});
app.use('/student/', studentRouter);

app.get('/', function(req, res) {
    res.json(
        {
            name: 'API',
            age: 2000
        }
    );
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(portNo, function(err) {
    console.log('Running on port : ' + portNo);
});
httpsServer.timeout = 1000000;
