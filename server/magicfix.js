module.exports = function(app, config, r) {

    // POST to this magic, mutable migration.
    // extract name + make view use the new name
    // Get timing information from the files
    // unbreak that command down there.
    app.post('/magicfix', function (req, res) {
        //r.db(database).table(tables.files).update({version: 1}).run(connection);
        r.db(database).table(tables.files).run().then(function (result) {
            result.forEach(function (item) {
                // This grabbed untyped things and typed them.
                //		if (item.type == null) {
                //		    console.log(item);
                //		    item.type = 'youtube';
                //		    r.db(database).table(tables.files).get(item.id).update({type: 'youtube'}).run(connection, function(err, cursor) {});
                //		}

                // This set v2.
                console.log(item);

                // Update to v2
                //                r.db(database).table(tables.files).get(item.id).update({version: 2}).run(connection, function(err, cursor) {});

                // Move frmo youtube.6tr4t6r4.mp3 -> display name of youtube
                //		console.log(item.file);
                //		if (matches = item.file.match(/(.*)\.[^.]{11}\.mp3/) ) {
                //		    console.log(matches[1]);
                //		    item.type = 'youtube';
                //		    r.db(database).table(tables.files).get(item.id).update({name: matches[1], version: 2}).run(connection, function(err, cursor) {});
                //		}

                //
                //		console.log(item.file);
                // Fix the FX filenames
                //		if (item.name == null) {
                //		    console.log(matches[1]);
                //		    item.type = 'youtube';
                //		    if (matches = item.file.match(/(.*)\.\w{3}/)) {
                //			r.db(database).table(tables.files).get(item.id).update({name: matches[1]}).run(connection, function(err, cursor) {});
                //		    }
                //		}
            });
            //            res.send(result);
        });
        res.send();
    });
}    
