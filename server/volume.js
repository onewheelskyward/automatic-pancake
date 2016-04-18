var exec = require('child_process').exec;

module.exports = function(app, config, r) {

    app.get('/vol', function (req, res) {
        res.send();
    });

    app.post('/vol/up', function (req, res) {
        var cmd = 'amixer';
        //Playback -2406 [74%] [-24.06dB] [on]
        exec(cmd, function (error, stdout, stderr) {
            stdout.split(/\n/).forEach(function (str) {
                if (str.indexOf('dB') > -1) {
                    var regex = /Playback ([-0-9]+)/;
                    var result = regex.exec(str);
                    console.log("Volume: " + result[1]);
                    vol = parseInt(result[1]);
                    console.log("Volume: " + vol);
                    vol += 300;
                    var cmd = 'amixer set PCM -- ' + vol;
                    console.log(cmd);
                    exec(cmd, function (error, stdout, stderr) {
                    });
                }
            })
        });
        res.send();
    });

    app.post('/vol/down', function (req, res) {
        var cmd = 'amixer';
        //Playback -2406 [74%] [-24.06dB] [on]
        exec(cmd, function (error, stdout, stderr) {
            stdout.split(/\n/).forEach(function (str) {
                if (str.indexOf('dB') > -1) {
                    var regex = /Playback ([-0-9]+)/;
                    var result = regex.exec(str);
                    vol = parseInt(result[1]);
                    vol -= 300;
                    var cmd = 'amixer set PCM -- ' + vol;
                    console.log(cmd);
                    exec(cmd, function (error, stdout, stderr) {
                    });
                }
            })
        });
        res.send();
    });

    //app.get('/vol/up', function(req, res) {
    //    var cmd = 'amixer';
    //    //Playback -2406 [74%] [-24.06dB] [on]
    //    exec(cmd, function(error, stdout, stderr) {
    //        stdout.split(/\n/).forEach(function(str) {
    //            if (str.indexOf('dB') > -1) {
    //                var regex = /Playback ([-0-9]+)/;
    //                var result = regex.exec(str);
    //                vol = parseInt(result[1]);
    //                vol += 200;
    //                setVol(vol, function(res) {
    //                    res.send({
    //                        dB: (vol / 100).toFixed(2)
    //                    })
    //                });
    //            }
    //        })
    //    });
    //    res.send();
    //});
    //
    //app.get('/vol/down', function(req, res) {
    //    var cmd = 'amixer';
    //    //Playback -2406 [74%] [-24.06dB] [on]
    //    exec(cmd, function(error, stdout, stderr) {
    //        stdout.split(/\n/).forEach(function(str) {
    //            if (str.indexOf('dB') > -1) {
    //                var regex = /Playback ([-0-9]+)/;
    //                var result = regex.exec(str);
    //                vol = parseInt(result[1]);
    //                vol -= 200;
    //                setVol(vol, function(res) {
    //                    res.send({
    //                        dB: (vol / 100).toFixed(2)
    //                    })
    //                });
    //            }
    //        })
    //    });
    //    res.send();
    //});
    //
    app.post('/mute', function (req, res) {
        // get state of mute
        // change it

    });

    // Handle volume changes by percentage of total range.
    // If we need ramping(in case it gets louder too fast), we'll do so in the client.
    //
    // amixer set PCM -- -9999  # off, -99.99dB
    // amixer set PCM -- 400    # full, +4.00dB
    app.post('/vol/:percent(\\d+)', function (req, res) {
        var percentage = req.params.percent;

        // Some bounds checking.
        if (percentage > 100) {
            res.send();
            return;  // Turns out just bonking to 100 is a really bad idea.  :)
        }
        if (percentage < 0) {
            percentage = 0;
        }

        var dB = (percentage / 100 * 10399) - 9999;

        var cmd = 'amixer set PCM -- ' + dB;
        console.log(cmd);
        exec(cmd, function (error, stdout, stderr) {
        });
        res.send({
            volume: percentage + "%",
            dB: (dB / 100).toFixed(2)
        });
    });
};
