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

app.get('/tracking', function (req, res) {
    r.db(database).table(tables.tracking).run().then(function(result) {
        res.send(result);
    });
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

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
