var EventEmitter = require('events').EventEmitter
  , abitof       = require('../..')

// makes a simple emitter
// it will emit a 'new-number' event every 30 ms
function makeEmitter (val) {
  var myEmitter = new EventEmitter()
  setInterval(function () {
    myEmitter.emit('new-number', val)
  }, 30)
  return myEmitter
}

function setup () {

  var oneEmitter = makeEmitter(1)
  var twoEmitter = makeEmitter(2)

  // let's turn that emitter into a Kefir stream ..
  // this will be passed as an argument to process()
  return [ 
    abitof.kefir(oneEmitter, 'new-number'),
    abitof.kefir(twoEmitter, 'new-number'),
  ]
}

// our process fn will take that stream
function process (oneStream, twoStream) {

  function timesTwo (x) { return x*2 }

  function plus (a, b) { return a + b }

  var doubleOnes = oneStream.map(timesTwo)

  var fours = doubleOnes.combine(twoStream, plus)

  fours.log()

  return fours

}

module.exports = {
  setup: setup,
  process: process
}
