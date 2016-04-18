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

var youtube = require('./youtube')(app, config, r);
var volume = require('./volume')(app, config, r);
require('./delete')(app, config, r);
var upload = require('./upload')(app, config, r);
var search = require('./search')(app, config, r);
var track = require('./track')(app, config, r);
var play = require('./play')(app, config, r);
var kill = require('./kill')(app, config, r);
var file = require('./file')(app, config, r);
var say = require('./say')(app, config, r);

function piSetup() {
    // One day, let's run this upon launch to fix the pi settings.
    var fixxer = "amixer cset numid=3 1";  // Set output to 3.5mm.
}

app.get('/', function (req, res) {
    res.send('pancakes');
});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
