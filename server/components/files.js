
// File-related endpoints.

module.exports = function(app, table, connection) {
    // GET /files - return json listing of files, names and ids used to display the frontend.
    app.get('/files', function (req, res) {
        table.orderBy('file').run(connection, function (err, cursor) {
            if (err) throw err;
            cursor.toArray(function (err, result) {
                res.send(result);
            });
        });
    });
};
