/**
 * Created by Krishna Rao on 3/23/2016.
 */

var express = require('express');
var loginRouter = express.Router();
var jwt = require('jsonwebtoken');
var fs = require('fs');
var privateKey = fs.readFileSync('./privatekey.key');
var https = require('https');

var router = function() {

    loginRouter.route('/')
        .post(function(req, res){
            //console.log("Req is: " + req.body.token);

            var ree = https.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${req.body.token}`, function(googleRes) {
                //console.log('Status: ' + googleRes.statusCode);
                if(googleRes.statusCode == 200) {
                    googleRes.on('data', function (body) {
                        body = JSON.parse(body);
                        //console.log(body);
                        if(body.email_verified) {
                            var token = jwt.sign({username: body.email.substring(0, body.email.indexOf("@g.rit.edu"))}, privateKey, {algorithm: 'HS256', expiresIn: "1h"});
                            console.log("Token created:" + token);
                            res.status(200).json({token: token});
                        } else {
                            res.status(401).json({errorMessage: "Account could not be verified"});
                        }
                    });
                }
            });

            ree.on('error', function(e) {
                console.log('problem with request: ' + e.message);

            });
        });

    return loginRouter;
};

module.exports = router;