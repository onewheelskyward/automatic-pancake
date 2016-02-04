.. role:: strike

Installing
==========

``brew install mplayer rethinkdb``

DB Setup
========
Log into http://localhost:8080 and create the database and the ``files`` and ``tracking`` tables within it.

Client Build
============
``browserify -t [ babelify --presets [ react ] ] client/client.js -o client/bundle.js``

Server Run
==========
``node server/server.js``

TODO
====
- Create metadata table
- deletes
- runtimes
- user auth
- :strike:`rethink!`
- appliancing
- cloud polling
- jukebox mode
- tab-based filtered soundboards
- real-time output via wss to front-end
- MOAR FARTS
- play in client

rPI setup
=========
via http://weworkweplay.com/play/raspberry-pi-nodejs/, current node is 4.2.1

``wget http://node-arm.herokuapp.com/node_latest_armhf.deb``
``dpkg -i node_latest_armhf.deb``

Enable audio to audio jack instead of HDMI

``amixer cset numid=3 1``

https://www.raspberrypi.org/documentation/configuration/audio-config.md

Volume control

``amixer set PCM -- -9999  # off, -99.99dB``
``amixer set PCM -- 400    # full, +4.00dB``
