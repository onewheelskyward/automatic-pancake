module.exports = function(app, config, r) {
    // GET /files - return json listing of files, names and ids used to display the frontend.
    app.get('/files', function (req, res) {
        r.db(config.database).table('files').orderBy(r.desc('created')).run().then(function(result) {
            res.send(result);
        });
    });
    app.get('/files/:type', function (req, res) {
        r.db(config.database).table('files').filter({'type': req.params.type}).orderBy(r.desc('created')).run().then(function(result) {
            res.send(result);
        });
    });
    // TODO: Add file updates and deletes here
};
