function setup () {
  // make a dumb emitter
  var myEmitter = new EventEmitter()
  // it will emit a 'new-number' event every 30 ms
  var n = 0
  setInterval(function () {
    n+=1
    myEmitter.emit('new-number', n)
  }, 30)
  // setup will return a stream of those emitters...
  return [myEmitter, 'event'
}

function process (stream) {

  function timesTwo (x) { return x*2 }

  stream.map(timesTwo).log()

}

module.exports = {
  setup: setup,
  process: process
}
