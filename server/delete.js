var fs = require('fs');

module.exports = function(app, config, r) {
    // DELETE /u-u-i-d - remove one file
    app.delete('/:id', function (req, res) {
        res.send();
        r.db(config.database).table('files').get(req.params.id).run().then(function(result) {
            //filter(r.row('id').eq(id))
            var fullpath = __dirname + '/files/' + result.file;
            console.log("Removing " + fullpath);
            fs.unlink(fullpath, function() {
                console.log("Deleting " + req.params.id);
                r.db(config.database).table('files').get(req.params.id).delete().run();
            });
        });
    });

    // POST delall - big ol' reset button.
    // Sort of a one-time thing, hence the commenting.
    // app.post('/delall', function(req, res) {
    //     r.db(database).table(tables.files).delete().run();
    //     res.send();
    // });
};
