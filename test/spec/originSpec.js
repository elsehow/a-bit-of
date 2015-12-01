var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter

// our consumer function emits 'value' events through this emitter
var outputEmitter = new EventEmitter()

// TODOS

// test updating a function
// test how changes propogate downstream
// test error catching

//  tester fns --------------------------------------------------

// a producer that produces 1's
function producer () {
  // make an event emitter
  var oneEmitter = new EventEmitter()
  // return value conforms to the producer API
  return [
    [ oneEmitter, 'number' ]
  ]
}


// tests --------------------------------------------------------

test('origin should have an update function', function (t) {
  t.plan(2)
  var o = new abitof.Origin(producer)
  t.ok(o.update, 'update fn exists')
  t.equal(typeof(o.update), 'function', 'update is a fn')
})

test('origin should have a removeListenersFn function', function (t) {
  t.plan(2)
  var o = new abitof.Origin(producer)
  t.ok(o.removeListeners, 'removeListeners exists')
  t.equal(typeof(o.removeListeners), 'function', 'removeListeners is a fn')
})

test('origin should have an output list', function (t) {
  t.plan(3)
  var o = new abitof.Origin(producer)
  t.ok(o.outputs, 'outputs exists')
  t.ok(o.outputs.length, 'outputs is a list')
  t.ok(o.outputs[0]._alive, 'outputs is a list of kefir streams')
})




