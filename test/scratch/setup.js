var EventEmitter = require('events').EventEmitter

// emits 1 every 500 ms
var testEmitter = new EventEmitter()
setInterval(() => testEmitter.emit('testEvent', 1), 500)

function setup () {
  return [
    [ testEmitter, 'testEvent' ]
  ]
}

module.exports = setup
