var player = require('play-sound')(opts = {player: 'play'});

module.exports = function(app, config, r) {
    require ('./trackCommon')(app, config, r);

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

            player.play(fullpath, function (err) {
                // Nulls show up a lot.  ¯\_(ツ)_/¯
                if (err) {
                    console.log('Play error ' + err);
                }
            });
        });
    };
};
