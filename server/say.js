var exec = require('child_process').exec;
require('./track');

module.exports = function(app, config, r) {
    var say = function (speech) {
        // Add console.exec here.
        // and, you know, like, escape it.
        // Perhaps by dumping to a file
        exec("say ${speech}", function (error, stdout, stderr) {
            //Yeah
        });
    };

    // POST /say - Make it so.
    app.post('/say', function (req, res) {
        console.log('saying ' + req.body.speech);
        // Check that filename exists in db.
        track(req, req.body.speech);
        say(req.body.speech);
        res.send();
    });
};
