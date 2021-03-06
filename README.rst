.. role:: strike

Installing
==========

Pre-requisite packages:
mplayer
rethinkdb
espeak (Linux-only)

Mac:

``brew install mplayer rethinkdb``

Linux

apt-get install espeak rethinkdb mplayer


Node Setup
==========

I recommend nodenv for managing your versions.

``apt-get install nodenv ; nodenv install -v 5.6.1``

``brew install nodenv ; nodenv install -v 5.6.1``

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

https://www.raspberrypi.org/documentation/configuration/audio-config.md

Volume control::

amixer set PCM -- -9999  # off, -99.99dB

amixer set PCM -- 400    # full, +4.00dB

youtube-dl settings::

youtube-dl --id -x --write-info-json --audio-format mp3 --no-progress u2l6nk7pMQ0

~/.mplayer/config::

really-quiet="1" #Very very little console output

On boot, set the audio output to jack instead of HDMI::

amixer cset numid=3 1

Mplayer config options example

http://ubuntuforums.org/archive/index.php/t-77329.html

Cropping!

``-ss <time>: Seek to given time position``

``-endpos <[[hh:]mm:]ss[.ms]|size[b|kb|mb]>: Stop at given time or byte position``
