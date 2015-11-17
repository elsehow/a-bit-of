var spawn = require('child_process').spawn
  , path = require('path')
  , charm = require('../..')
  , Kefir = require('kefir')

// one-script prints 1 to process.stdout, over and over
var process1 = spawn('node', [path.join(__dirname, 'one-script.js')])
// one-script prints 2 to process.stdout, over and over
var process2 = spawn('node', [path.join(__dirname, 'two-script.js')])

// `charm` em with app.js
var app = path.join(__dirname, '/app.js')
// make sure to pass an absolute path
var e = charm(app, 
    [process1.stdout, 'data'], 
    [process2.stdout, 'data'],
    function (emitter, ev) {
      return Kefir.fromEvents(emitter, ev)
    })

 // return-val event is triggered whenever app is     saved
e.on('return-val', function (r) {
  console.log('app.js is saved! it returned', r)
})

// an error, possibly a syntax error in app.js
e.on('error', function (err) {
  console.log("ERR!!!!", err)
})

