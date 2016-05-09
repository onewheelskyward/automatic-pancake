var exec = require('child_process').exec;
require('./track');
require('./addFile.js');
var soxPlayer = require('play-sound')(opts = {player: 'play'});
var mPlayer = require('play-sound')(opts = {player: 'mplayer'});

module.exports = function(app, config, r) {
    // Add the file to rethink and autoplay.
    // DRY

    var play = function (id) {
        var fullpath = __dirname + '/files/';
        r.db(config.database).table('files').get(id).run().then(function(result) {
            //filter(r.row('id').eq(id))
            fullpath += result.file;
            console.log("Playing " + fullpath);
            if (result.file.match(/\.mp3/)) {
                soxPlayer.play(fullpath);
            }
            if (result.file.match(/\.mp4/)) {
                mPlayer.play(fullpath);
            }
        });
    };

    function addFile(fieldname, name, type) {
        console.log("Adding file " + fieldname);
        r.db(config.database)
            .table('files')
            .insert([{file: fieldname, name: name, type: type, created: new Date()}])
            .run()
            .then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                play(result.generated_keys[0]);
            });
    }

    // Grab the youtube title with minimal transformation based on discovery of what youtube-dl does to drop valid filenames.
    function getTitle(youtubeId, callback) {
        if (youtubeId.length == 11) {
            titleCmd = 'youtube-dl --get-title --get-id -- ' + youtubeId;
        } else {
            titleCmd = 'youtube-dl "https://www.youtube.com/results?search_query=' + encodeURIComponent(youtubeId) + '" --get-title --get-id --max-downloads 1 --no-playlist';
        }

        console.log("getTitle executing " + titleCmd);
        exec(titleCmd, function(error, stdout, stderr) {
        console.log("Parsing stdout: " + stdout);
            outs = stdout.split(/\n/);
            title = outs[0].trim()
                .replace(/:/g, ' -')
                .replace(/"/g, "'")
                .replace(/\//g, '_')
                .replace(/\*+/g, '_');
            id = outs[1];
            console.log(['title: ' + title, ' id: ' + id]);
            callback(title, id);
        });
    }

    // POST /youtube - grab a 'tube, strip the audio, add and play it.
    app.post('/youtube', function (req, res) {
        var youtubeId = req.body.uri;
        console.log('Request received for: ' + youtubeId);

        res.send();  // Client exit point, we have what we need, and if we hang onto it chrome keeps re-making the request.
                     // Consider throwing a 404 here if the id isn't found.

        // Audio only
        //cmd = "youtube-dl -w -x --write-info-json --audio-format mp3 -o '" + __dirname + '/files/' + "%(title)s.%(id)s.%(ext)s' " + '-- ' + req.body.uri;
        // Viddy-A

        getTitle(youtubeId, function(title, id) {
            resolutionCommand = 'youtube-dl -F -- ' + id;
            exec(resolutionCommand, function(error, stdout, stderr) {
                console.log(stdout);
                var outs = stdout.split(/\n/);
                var formatValue = 0;

                for (var i = 0; i < outs.length; i++) {
                    var m = outs[i].split(/\s+/);
                    console.log(m[0]);
                    if (m[1] == 'mp4' && m[3].lastIndexOf('medium', 0) === 0) {
                        console.log("Setting formatValue " + formatValue + " to " + m[0]);
                        formatValue = parseInt(m[0]);
                    }
                    // add formats to id if it's 135 or less, then choose biggest.
                }
                console.log("Format value: " + formatValue);

                cmd = 'youtube-dl -w --write-info-json -f ' + formatValue + ' -o "' + __dirname + '/files/' + '%(title)s.%(id)s.%(ext)s" -- ' + id;
                console.log("Youtube Callback!  executing " + cmd);
                exec(cmd, function(error, stdout, stderr) {
                    console.log(stdout);
                    console.log(stderr);
                    addFile(title + '.' + id + '.mp4', title, 'youtube');
                    res.send();
                });
            });
        });
    });
};
