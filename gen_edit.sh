#!/usr/bin/env bash
node_modules/.bin/browserify -t [ babelify --presets [ react ] ] client/edit.js -o client/edit_bundle.js
