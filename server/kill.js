var exec = require('child_process').exec;

module.exports = function(app, config, r) {
    var getIp = function (req) {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    var track = function (req, id) {
        r.db(config.database)
            .table('tracking')
            .insert([{
                ipAddress: getIp(req),
                fileId: id
            }])
            .run();
    };

    // POST /kill - MAKE IT STOP
    app.post('/kill', function (req, res) {
        track(req, 'KILL');
        exec('killall play', function (error, stdout, stderr) {
            console.log(stdout);
        });
        exec('killall mplayer', function (error, stdout, stderr) {
            console.log(stdout);
        });
        res.send();
    });

};
