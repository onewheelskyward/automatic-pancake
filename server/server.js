/*
 Automatic Pancake
 */
var fs = require('fs');
//var path = require('path');
var express = require('express');
var busboy = require('connect-busboy');
var exec = require('child_process').exec;
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser')
var player = require('play-sound') ( opts = {} );

var conString = "postgres://akreps@localhost/automatic-pancake";

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

pg.connect(conString, function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('SELECT $1::int AS number', ['1'], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
            return console.error('error running query', err);
        }
        console.log(result.rows[0].number);
        //output: 1
    });

    var handleError = function (err) {
        // no error occurred, continue with the request
        console.log('handleError handling: ' + err);
        if (!err) return false;

        // An error occurred, remove the client from the connection pool.
        // A truthy value passed to done will remove the connection from the pool
        // instead of simply returning it to be reused.
        // In this case, if we have successfully received a client (truthy)
        // then it will be removed from the pool.
        if (client) {
            done(client);
        }
        //res.writeHead(500, {'content-type': 'text/plain'});
        //res.end('An error occurred');
        return true;
    };

    var play = function (id) {
        var fullpath = __dirname + '/files/';
        client.query('SELECT filename FROM files WHERE id = $1', [id], function (err, result) {
            handleError(err);
            fullpath += result.rows[0].filename;
            console.log("Playing " + fullpath);

            player.play(fullpath, function (err) {
                // Nulls show up a lot.  ¯\_(ツ)_/¯
                console.log('Play error ' + err);
            });
            done();
        });
        console.log(fullpath + " done!");
    };

    var getIp = function(req) {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    var track = function(req, id) {
        client.query('INSERT INTO tracking (ip_address, file_id) VALUES ($1, $2)', [getIp(req), id], function (err, result) {
            handleError(err);
            console.log(result);
            done();
        });
    };

    app.get('/', function (req, res) {
        res.send('Hello World!');
    });

    app.get('/files', function (req, res) {
        client.query('SELECT * FROM files WHERE id > 1', [], function (err, result) {
            if (handleError(err)) return;
            res.send(result.rows);
            done();
        });
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
            client.query('INSERT INTO files (filename, created) VALUES ($1, $2)', [fieldname, new Date()], function (err, result) {
                if (handleError(err)) return;
                done();
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
});
