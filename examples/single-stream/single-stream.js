var spawn = require('child_process').spawn
  , path = require('path')
  , charm = require('../..')
  , Kefir = require('kefir')

// run this, and live-code app.js!!

var process = spawn('node', [path.join(__dirname, 'script.js')])

// `charm` em with app.js
var app = path.join(__dirname, '/app.js')
// make sure to pass an absolute path
var e = charm(app, process.stdout, 'data', function (emitter, ev) {
  return Kefir.fromEvents(emitter, ev)
})

// return-val event is triggered whenever app issaved 
e.on('return-val', function (r) {
  console.log('app.js is saved! it returned', r)
})

// an error, possibly a syntax error in app.js
e.on('error', function (err) {
  console.log("ERR!!!!", err) 
})

