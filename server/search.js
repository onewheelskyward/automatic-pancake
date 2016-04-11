module.exports = function(app, config, r) {
    // POST /search/fart - return farts.
    app.post('/search', function (req, res) {
        console.log('Searching for ' + req.body.query);
        if (req.body.query == undefined) {
            console.log('Undefined search query');
            res.sendStatus(400);
        } else {
            r.db(config.database).table('files').filter(function(doc) {
                console.log('Query match' + doc('file').match(req.body.query));
                return doc('name').match(req.body.query)
            }).run().then(function(result) {
                res.send(result);
            });
        }
    });
};
