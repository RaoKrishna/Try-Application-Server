var fs = require('fs');
var unzip = require('unzip');
const exec = require('child_process').exec;

module.exports = {
    runScript: function(file) {
        //fs.createReadStream('./Node-Server-master.zip').pipe(unzip.Extract({path: './'}));

        console.log('Done')
    }
};
