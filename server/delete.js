
module.exports = function(app, config, r) {
    // DELETE /u-u-i-d - remove one file
    app.delete('/:id', function (req, res) {
        r.db(config.database).table('files').get(req.params.id).delete().run();
        res.send();
    });
};
