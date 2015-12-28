var fs = require('fs');
//var path = require('path');
var express = require('express');
var busboy = require('connect-busboy');
var app = express();
var pg = require('pg');

var conString = "postgres://akreps@localhost/automatic-pancake";

app.set('port', 3456);
app.use(busboy());

//app.use('/', express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

var db = new pg.Client(conString);
db.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);
    }
    // Interesting way to check for success.
    db.query('SELECT NOW() AS "theTime"', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }
        console.log('Fun with postgres: ' + result.rows[0].theTime);
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
        // what the what
        //db.end();
    });
});

var cors = function (res) {
    // TODO: Lock down cors, somewhat.
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
};

var handleError = function(err) {
    // no error occurred, continue with the request
    if(!err) return false;

    // An error occurred, remove the client from the connection pool.
    // A truthy value passed to done will remove the connection from the pool
    // instead of simply returning it to be reused.
    // In this case, if we have successfully received a client (truthy)
    // then it will be removed from the pool.
    if(client){
        done(client);
    }
    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('An error occurred');
    return true;
};

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/upload', function (req, res) {
    //res.send(req.files.path)
    cors(res);
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file) {
        console.log("Uploading: " + fieldname);
        fstream = fs.createWriteStream(__dirname + '/files/' + fieldname);
        file.pipe(fstream);
        db.query('INSERT INTO files (filename, created) VALUES ($1, $2)', [fieldname, new Date()], function(err, result) {
            if(handleError(err)) return;
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
