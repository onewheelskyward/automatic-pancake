module.exports = function(app, config, r) {
    var getIp = function (req) {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    var track = function (req, id) {
        r.db(config.database)
            .table('tracking')
            .insert([{
                ipAddress: getIp(req),
                fileId: id
            }])
            .run();
    };
};

