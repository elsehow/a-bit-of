var EventEmitter = require('events').EventEmitter
  , abitof       = require('..')

function setup () {

  // here's a simple emitter
  // it will emit a 'new-number' event every 30 ms
  var myEmitter = new EventEmitter()
  var n = 0
  setInterval(function () {
    n+=1
    myEmitter.emit('number', n)
  }, 30)

  // let's turn that emitter into a Kefir stream ..
  // this will be passed as an argument to process()
  return [ 
    abitof.kefir(myEmitter, 'number') 
  ]
}

// our process fn will take that stream
function process (stream) {

  function timesTwo (x) { return x*1 }

  var s = stream.map(timesTwo)

  s.log()

}

module.exports = {
  setup: setup,
  process: process
}
