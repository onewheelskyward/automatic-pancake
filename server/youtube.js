var exec = require('child_process').exec;
require('./track');
require('./addFile.js');

module.exports = function(app, config, r) {
    // Add the file to rethink and autoplay.
    // DRY
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
        titleCmd = 'youtube-dl --get-title --get-id -- ' + youtubeId;
        console.log("getTitle executing " + titleCmd);
        exec(titleCmd, function(error, stdout, stderr) {
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
        cmd = "youtube-dl -w --write-info-json --recode-video mp4 --audio-format mp3 -o '" + __dirname + '/files/' + "%(title)s.%(id)s.%(ext)s' " + '-- ' + req.body.uri;

        getTitle(youtubeId, function(title, id) {
            console.log("Youtube Callback!  executing " + cmd);
            exec(cmd, function(error, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                addFile(title + '.' + id + '.mp4', title, 'youtube');
                res.send();
            })
        });
    });
};
