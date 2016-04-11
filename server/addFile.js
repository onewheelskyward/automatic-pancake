module.exports = function(app, config, r) {
    // Add the file to rethink and autoplay.
    // DRY
    function addFile(fieldname, name, type) {
        console.log("Adding file " + fieldname);
        r.db(config.database)
            .table('files')
            .insert([{file: fieldname, name: name, type: type, created: new Date()}])
            .run()
            .then(function (result) {
                logDbCall(result);
                play(result.generated_keys[0]);
            });
    }
}
