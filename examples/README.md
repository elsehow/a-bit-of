# simple-charm examples

## single-stream

go into this directory and

    node single-stream.js

now, edit app.js.

save your changes
and notice how everything live-reloads neatly!

try putting a syntax error in app.js, and save that.
notice how the app doesn't crash! it will patiently wait for you to fix the changes.
meanwhile, your event emitters are still pumping events out, undisturbed!

## multiple-streams

here,

    node multiple-streams.js

notice how we're taking multiple streams, and how our app.js has a Kefir stream for each one of them.
