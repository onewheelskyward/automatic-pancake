var soxPlayer = require('play-sound')(opts = {player: 'play'});
var mPlayer = require('play-sound')(opts = {player: 'mplayer'});

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

    // POST /play/u-u-i-d - Make it so.
    app.post('/play/:id', function (req, res) {
        console.log('Playing ' + req.params.id);
        // Check that filename exists in db.
        track(req, req.params.id);
        play(req.params.id);
        res.send();
    });

    var play = function (id) {
        var fullpath = __dirname + '/files/';
        r.db(config.database).table('files').get(id).run().then(function(result) {
            //filter(r.row('id').eq(id))
            fullpath += result.file;
            console.log("Playing " + fullpath);
            if (result.file.match(/\.mp3/) || result.file.match(/\.wav/)) {
                soxPlayer.play(fullpath);
            } else {
                mPlayer.play(fullpath);
            }
        });
    };
};
