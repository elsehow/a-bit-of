var EventEmitter = require('events').EventEmitter
  , Kefir = require('kefir')

function setup () {

  // here's a simple emitter
  // it will emit a 'new-number' event every 30 ms
  var myEmitter = new EventEmitter()
  var n = 0
  setInterval(function () {
    n+=1
    myEmitter.emit('new-number', n)
  }, 30)

  // let's turn that emitter into a Kefir stream ..
  return {
    args: [{ 
        emitter: myEmitter,
        ev: 'new-number'
    }],
    fn: function (emitter, ev)  {
      return Kefir.fromEvents(emitter, ev)
    }
  }
}

// our process fn will take that stream
function process (stream) {

  function timesTwo (x) { return x*2 }

  var s = stream.map(timesTwo)
}


module.exports = {
  setup: setup,
  process: process
}
