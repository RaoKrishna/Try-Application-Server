var jwt = require('jsonwebtoken');
var fs = require('fs');
var privateKey = fs.readFileSync('./privatekey.key');

module.exports = {
    authenticateUser: function(token, callback) {
        token = token.replace('Bearer ', '');

        jwt.verify(token, privateKey, function (err, token) {
            if(err) {
                console.log("Error while verifying: " + err);
                callback(null);
            } else {
                var username = token.username;
                callback(username);
            }
        });
    }
};