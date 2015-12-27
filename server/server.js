var fs = require('fs');
//var path = require('path');
var express = require('express');
var busboy = require('connect-busboy');
var app = express();

app.set('port', 3456);
app.use(busboy());

//app.use('/', express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/upload', function (req, res) {
    // TODO: Lock down cors, somewhat.
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //res.send(req.files.path)
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file) {
        console.log("Uploading: " + fieldname);
        fstream = fs.createWriteStream(__dirname + '/files/' + fieldname);
        file.pipe(fstream);
    });
});

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
