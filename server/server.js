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
var player = require('play-sound')(opts = {});

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

r.connect({host: 'localhost', port: 28015}, function (err, conn) {
    if (err) throw err;
    connection = conn;
});

var database = 'automaticpancake';
var tables = {files: 'files', tracking: 'tracking'};

//function tableCreate(tableName) {
//    r.db(database).tableCreate(tableName).run(connection, function(err, result) {
//        if (err) throw err;
//        logDbCall(result);
//    });
//}

function logDbCall(result) {
    console.log(JSON.stringify(result, null, 2));
}

//tableCreate(tables.files);
//tableCreate(tables.tracking);

var play = function (id) {
    var fullpath = __dirname + '/files/';
    r.table(tables.files).get(id).run(connection, function(err, cursor) {
        //filter(r.row('id').eq(id))
        fullpath += result.filename;
        console.log("Playing " + fullpath);

        player.play(fullpath, function (err) {
            // Nulls show up a lot.  ¯\_(ツ)_/¯
            console.log('Play error ' + err);
        });
    });
};

var getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
};

var track = function (req, id) {
    r.table('tracking').insert([{ipAddress: getIp(req), fileId: id}])
};

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/files', function (req, res) {
    r.table(tables.files).run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            res.send(result);
        });
    });
    res.send();
});

app.post('/play/:id', function (req, res) {
    console.log('Playing ' + req.params.id);
    // Check that filename exists in db.
    track(req, req.params.id);
    play(req.params.id);
    res.send();
});

app.post('/upload', function (req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file) {
        console.log("Uploading: " + fieldname);
        fstream = fs.createWriteStream(__dirname + '/files/' + fieldname);
        file.pipe(fstream);
        r.table(tables.files).insert([{ file: fieldname, created: new Date()}]).run(connection, function(err, result) {
            if (err) throw err;
            logDbCall(result);
        });
    });
    res.send();
});

app.post('/kill', function (req, res) {
    track(req, 'KILL');
    exec('killall mplayer', function (error, stdout, stderr) {
        console.log(stdout);
    });
    res.send();
});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
