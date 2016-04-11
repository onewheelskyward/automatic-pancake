/*
 Automatic Pancake
 */
var express = require('express');
var busboy = require('connect-busboy');
var exec = require('child_process').exec;
var app = express();
var bodyParser = require('body-parser');
var config = require('./config.json');

var r = require('rethinkdbdash')(
    {host: config.dbHost, port: config.dbPort, database: config.database}
);

// This...didn't really work.
//tableCreate(tables.files);
//tableCreate(tables.tracking);

//function tableCreate(tableName) {
//    r.db(database).tableCreate(tableName).run(connection, function(err, result) {
//        if (err) throw err;
//        logDbCall(result);
//    });
//}


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

var youtube = require('./youtube')(app, config, r)
var addFile = require('./upload')(app, config, r)
var search = require('./search')(app, config, r)
var track = require('./track')(app, config, r)
var play = require('./play')(app, config, r)
var file = require('./file')(app, config, r)
var say = require('./say')(app, config, r)

function piSetup() {
    // One day, let's run this upon launch to fix the pi settings.
    var fixxer = "amixer cset numid=3 1";  // Set output to 3.5mm.
}

app.get('/', function (req, res) {
    res.send('pancakes');
});

app.get('/tracking', function (req, res) {
    r.db(database).table(tables.tracking).run().then(function(result) {
        res.send(result);
    });
});

// POST /kill - MAKE IT STOP
app.post('/kill', function (req, res) {
    track(req, 'KILL');
    exec('killall play', function (error, stdout, stderr) {
        console.log(stdout);
    });
    res.send();
});

// POST delall - big ol' reset button.
// app.post('/delall', function(req, res) {
//     r.db(database).table(tables.files).delete().run();
//     res.send();
// });

// POST to this magic, mutable migration.
// extract name + make view use the new name
// Get timing information from the files
// unbreak that command down there.
app.post('/magicfix', function(req, res) {
    //r.db(database).table(tables.files).update({version: 1}).run(connection);
    r.db(database).table(tables.files).run().then(function(result) {
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
    res.send();
});

// DELETE /u-u-i-d - remove one file
app.delete('/:id', function(req, res) {
    r.db(database).table(tables.files).get(req.params.id).delete().run();
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
