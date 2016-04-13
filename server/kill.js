var exec = require('child_process').exec;

module.exports = function(app, config, r) {
    // POST /kill - MAKE IT STOP
    app.post('/kill', function (req, res) {
        track(req, 'KILL');
        exec('killall play', function (error, stdout, stderr) {
            console.log(stdout);
        });
        res.send();
    });

};
