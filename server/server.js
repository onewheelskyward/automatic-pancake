/*
 Automatic Pancake
 */
var fs = require('fs');
//var path = require('path');
var express = require('express');
var busboy = require('connect-busboy');
var exec = require('child_process').exec;
var app = express();
var r = require('rethinkdb');
var bodyParser = require('body-parser');
var player = require('play-sound')(opts = {player: 'mplayer'});

app.set('port', 3456);
app.use(busboy());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

// Initialize the rethink connection.
var connection = null;

r.connect({host: 'localhost', port: 28015, database: 'automaticpancake'}, function (err, conn) {
    if (err) throw err;
    connection = conn;
});

// Database configuration
var database = 'automaticpancake';
var tables = {files: 'files', tracking: 'tracking'};

//function tableCreate(tableName) {
//    r.db(database).tableCreate(tableName).run(connection, function(err, result) {
//        if (err) throw err;
//        logDbCall(result);
//    });
//}

function piSetup() {
    // One day, let's run this upon launch to fix the pi settings.
    var fixxer = "amixer cset numid=3 1";  // Set output to 3.5mm.
}

function logDbCall(result) {
    console.log(JSON.stringify(result, null, 2));
}

// This...didn't really work.
//tableCreate(tables.files);
//tableCreate(tables.tracking);

var play = function (id) {
    var fullpath = __dirname + '/files/';
    r.db(database).table(tables.files).get(id).run(connection, function(err, result) {
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

var getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
};

var track = function (req, id) {
    r.db(database).table('tracking').insert([{ipAddress: getIp(req), fileId: id}]).run(connection);
};

var say = function (speech) {
    // Add console.exec here.
};

app.get('/', function (req, res) {
    res.send('pancakes');
});

// GET /files - return json listing of files, names and ids used to display the frontend.
app.get('/files', function (req, res) {
    r.db(database).table(tables.files).orderBy(r.desc('created')).run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            res.send(result);
        });
    });
});

app.get('/tracking', function (req, res) {
    r.db(database).table(tables.tracking).run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            res.send(result);
        });
    });
});

// POST /play/u-u-i-d - Make it so.
app.post('/play/:id', function (req, res) {
    console.log('Playing ' + req.params.id);
    // Check that filename exists in db.
    track(req, req.params.id);
    play(req.params.id);
    res.send();
});

// POST /say - Make it so.
app.post('/say', function (req, res) {
    console.log('saying ' + req.body.speech);
    // Check that filename exists in db.
    track(req, req.body.speech);
    say(req.body.speech);
    res.send();
});

// Add the file to rethink and autoplay.
function addFile(fieldname, name, type) {
    console.log("Adding file " + fieldname);
    r.db(database).table(tables.files).insert([{ file: fieldname, name: name, type: type, created: new Date()}]).run(connection, function(err, result) {
        if (err) throw err;
        logDbCall(result);
        play(result.generated_keys[0]);
    });
}

// POST /upload - Drop a file, add and play it.
app.post('/upload', function (req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file) {
        console.log("Uploading: " + fieldname);
        fstream = fs.createWriteStream(__dirname + '/files/' + fieldname);
        file.pipe(fstream);
        filenameArr = fieldname.split(/\./);
        addFile(fieldname, filenameArr[0], 'fx')
    });
    res.send();
});

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

function setVol(vol, callback) {
    var cmd = 'amixer set PCM -- ' + vol;
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
        callback();
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
    cmd = "youtube-dl -w --write-info-json --audio-format mp3 -o '" + __dirname + '/files/' + "%(title)s.%(id)s.%(ext)s' " + '-- ' + req.body.uri;

    getTitle(youtubeId, function(title, id) {
        console.log("Youtube Callback!  executing " + cmd);
        exec(cmd, function(error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            addFile(title + '.' + id + '.mp3', title, 'youtube');
            res.send();
        })
    });
});

// POST /kill - MAKE IT STOP
app.post('/kill', function (req, res) {
    track(req, 'KILL');
    exec('killall mplayer', function (error, stdout, stderr) {
        console.log(stdout);
    });
    res.send();
});

// POST delall - big ol' reset button.
app.post('/delall', function(req, res) {
    r.db(database).table(tables.files).delete().run(connection);
    res.send();
});

// POST to this magic, mutable migration.
// extract name + make view use the new name
// Get timing information from the files
// unbreak that command down there.
app.post('/magicfix', function(req, res) {
    //r.db(database).table(tables.files).update({version: 1}).run(connection);
    r.db(database).table(tables.files).run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            result.forEach(function (item) {
		// This grabbed untyped things and typed them.
//		if (item.type == null) {
//		    console.log(item);
//		    item.type = 'youtube';
//		    r.db(database).table(tables.files).get(item.id).update({type: 'youtube'}).run(connection, function(err, cursor) {});
//		}

		// This set v2.
                console.log(item);

		// Update to v2
//                r.db(database).table(tables.files).get(item.id).update({version: 2}).run(connection, function(err, cursor) {});

		// Move frmo youtube.6tr4t6r4.mp3 -> display name of youtube
//		console.log(item.file);
//		if (matches = item.file.match(/(.*)\.[^.]{11}\.mp3/) ) {
//		    console.log(matches[1]);
//		    item.type = 'youtube';
//		    r.db(database).table(tables.files).get(item.id).update({name: matches[1], version: 2}).run(connection, function(err, cursor) {});
//		}

//
		//		console.log(item.file);
		// Fix the FX filenames
//		if (item.name == null) {
//		    console.log(matches[1]);
		    //		    item.type = 'youtube';
//		    if (matches = item.file.match(/(.*)\.\w{3}/)) {
//			r.db(database).table(tables.files).get(item.id).update({name: matches[1]}).run(connection, function(err, cursor) {});
//		    }
//		}
            });
//            res.send(result);
        });
    });
    res.send();
});

// DELETE /u-u-i-d - remove one file
app.delete('/:id', function(req, res) {
    r.db(database).table(tables.files).get(req.params.id).delete().run(connection);
    res.send();
});

app.get('/vol', function(req, res) {
    res.send();
});

app.post('/vol/up', function(req, res) {
    var cmd = 'amixer';
    //Playback -2406 [74%] [-24.06dB] [on]
    exec(cmd, function(error, stdout, stderr) {
        stdout.split(/\n/).forEach(function(str) {
            if (str.indexOf('dB') > -1) {
                var regex = /Playback ([-0-9]+)/;
                var result = regex.exec(str);
                console.log("Volume: " + result[1]);
                vol = parseInt(result[1]);
                console.log("Volume: " + vol);
                vol += 100;
                var cmd = 'amixer set PCM -- ' + vol;
                console.log(cmd);
                exec(cmd, function(error, stdout, stderr) {});
            }
        })
    });
    res.send();
});

app.post('/vol/down', function(req, res) {
    var cmd = 'amixer';
    //Playback -2406 [74%] [-24.06dB] [on]
    exec(cmd, function(error, stdout, stderr) {
        stdout.split(/\n/).forEach(function(str) {
            if (str.indexOf('dB') > -1) {
                var regex = /Playback ([-0-9]+)/;
                var result = regex.exec(str);
                vol = parseInt(result[1]);
                vol -= 100;
                var cmd = 'amixer set PCM -- ' + vol;
                console.log(cmd);
                exec(cmd, function(error, stdout, stderr) {});
            }
        })
    });
    res.send();
});

//app.get('/vol/up', function(req, res) {
//    var cmd = 'amixer';
//    //Playback -2406 [74%] [-24.06dB] [on]
//    exec(cmd, function(error, stdout, stderr) {
//        stdout.split(/\n/).forEach(function(str) {
//            if (str.indexOf('dB') > -1) {
//                var regex = /Playback ([-0-9]+)/;
//                var result = regex.exec(str);
//                vol = parseInt(result[1]);
//                vol += 200;
//                setVol(vol, function(res) {
//                    res.send({
//                        dB: (vol / 100).toFixed(2)
//                    })
//                });
//            }
//        })
//    });
//    res.send();
//});
//
//app.get('/vol/down', function(req, res) {
//    var cmd = 'amixer';
//    //Playback -2406 [74%] [-24.06dB] [on]
//    exec(cmd, function(error, stdout, stderr) {
//        stdout.split(/\n/).forEach(function(str) {
//            if (str.indexOf('dB') > -1) {
//                var regex = /Playback ([-0-9]+)/;
//                var result = regex.exec(str);
//                vol = parseInt(result[1]);
//                vol -= 200;
//                setVol(vol, function(res) {
//                    res.send({
//                        dB: (vol / 100).toFixed(2)
//                    })
//                });
//            }
//        })
//    });
//    res.send();
//});
//
app.post('/mute', function(req, res) {
    // get state of mute
    // change it

});

// Handle volume changes by percentage of total range.
// If we need ramping(in case it gets louder too fast), we'll do so in the client.
//
// amixer set PCM -- -9999  # off, -99.99dB
// amixer set PCM -- 400    # full, +4.00dB
app.post('/vol/:percent(\\d+)', function(req, res) {
    var percentage = req.params.percent;

    // Some bounds checking.
    if (percentage > 100) {
        res.send();
        return;  // Turns out just bonking to 100 is a really bad idea.  :)
    }
    if (percentage < 0) {
        percentage = 0;
    }

    var dB = (percentage/100 * 10399) - 9999;

    var cmd = 'amixer set PCM -- ' + dB;
    console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {});
    res.send({
        volume: percentage + "%",
        dB: (dB / 100).toFixed(2)
    });
});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
