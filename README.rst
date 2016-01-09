Installing
====

Postgresql- create database and edit config (when I make them).

``brew install mplayer``

DB Setup
====
``create table files (id serial, filename varchar(2048), created timestamp default now());``
``create table tracking (id serial, file_id integer, ip_address varchar(50), created timestamp default now());``
``insert into files (filename) values ('KILL');``

TODO
====
- Create metadata table
- deletes
- runtimes
- user auth
- rethink?
- appliancing
- cloud polling
- jukebox mode
- tab-based filtered soundboards
- real-time output via wss to front-end
- MOAR FARTS
- play in client
