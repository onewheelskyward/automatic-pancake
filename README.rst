Installing
====

Postgresql- create database and edit config (when I make them).

``brew install mplayer``

DB Setup
====
``create table files (id serial, filename varchar(2048), created timestamp);``
``create table tracking (id serial, file_id integer, ip_address varchar(50), created timestamp default now());``

TODO
====
- Create metadata table
- deletes
- runtimes
- store usages
- user auth
