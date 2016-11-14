var jwt = require('jsonwebtoken');
var fs = require('fs');
var privateKey = fs.readFileSync('./privatekey.key');
//var sql = require('mssql');

module.exports = {
    authenticateUser: function(token, callback) {
        token = token.replace('Bearer ', '');
        console.log("Token is:" + token);
        jwt.verify(token, privateKey, function (err, token) {
            if(err) {
                console.log("Error while verifying: " + err);
            } else {
                console.log("Verify success")
            }
        });
        //console.log("Token is: ", isValid);
        //var username = jwt.decode(token.replace('Bearer ', ''));
        var username = jwt.decode(token);
        //var request = new sql.Request();
        /*request.query('select count(*) as count from [dbo].[Users] where LOWER(Username) = LOWER(username)').then(function (count) {
            if (count[0].count == 0) {
                callback(null);
            } else {
                callback(username);
            }
        });*/
        //console.log(username);
        callback(username);
    }
};