var EventEmitter = require('events').EventEmitter

// emits 1 every 500 ms
var testEmitter = new EventEmitter()
setInterval(() => testEmitter.emit('newEvent', 1), 500)

function setup () {
  return [
    [ testEmitter, 'newEvent' ]
  ]
}

module.exports = setup
