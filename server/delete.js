
module.exports = function(app, config, r) {
    // DELETE /u-u-i-d - remove one file
    app.delete('/:id', function (req, res) {
        r.db(config.database).table('files').get(req.params.id).delete().run();
        res.send();
    });

    // POST delall - big ol' reset button.
    // Sort of a one-time thing, hence the commenting.
    // app.post('/delall', function(req, res) {
    //     r.db(database).table(tables.files).delete().run();
    //     res.send();
    // });
};
