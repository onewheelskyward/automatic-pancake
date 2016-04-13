module.exports = function(app, config, r) {
    app.get('/tracking', function (req, res) {
        r.db(database).table(tables.tracking).run().then(function(result) {
            res.send(result);
        });
    });
};
