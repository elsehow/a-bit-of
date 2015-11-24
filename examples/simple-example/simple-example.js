var  path = require('path')
  , abitof = require('../..')

// run this, and live-code script.js!!

// get the absolute path to our script
var script = path.join(__dirname, '/script.js')
// set it up for *a bit of* live-coding!
var abit = abitof(script)

// return-val event is triggered whenever app issaved 
abit.on('return-val', function (r) {
  console.log('app.js is saved! it returned', r)
})

// trigger when an error 
// this could be a syntax error
abit.on('error', function (err) {
  console.log("ERR!!!!", err) 
})

