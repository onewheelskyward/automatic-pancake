var fs = require('fs');

module.exports = function(app, config, r) {
    // Add the file to rethink and autoplay.
    function addFile(fieldname, name, type) {
        console.log("Adding file " + fieldname);
        r.db(config.database)
            .table('files')
            .insert([{ file: fieldname, name: name, type: type, created: new Date()}])
            .run()
            .then(function(result) {
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
};
