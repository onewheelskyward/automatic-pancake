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
        if (req.body.query) {
            r.db(config.database).table('files').filter(function(doc) {
                console.log('Kill query match' + doc('file').match(req.body.query));
                return doc('name').match("(?i)" + req.body.query)
            }).run().then(function(result) {
                console.log('Running killall ' + result.file);
                exec('killall ' + result.file, function (error, stdout, stderr) {
                    console.log(stdout);
                });
                res.send(result);
            });

        } else {
            exec('killall play', function (error, stdout, stderr) {
                console.log(stdout);
            });
            exec('killall mplayer', function (error, stdout, stderr) {
                console.log(stdout);
            });
        }
        res.send();
    });

};
