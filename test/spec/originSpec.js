'use strict'

var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter

// our consumer function emits 'value' events through this emitter
var outputEmitter = new EventEmitter()

// TODOS 
//..
// test updating a function (with downstreams) + changes propogate?
// test error catching with bad input fn

//  tester fns --------------------------------------------------

// a simple origin function
function originFn () {
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
  var o = new abitof.Origin(originFn)
  t.ok(o.update, 'update fn exists')
  t.equal(typeof(o.update), 'function', 'update is a fn')
})


test('downstream should be null', function (t) {
  t.plan(1)
  var o = new abitof.Origin(originFn)
  t.equal(o.downstream, null, 'downstream == null')
})


test('origin should have a removeListenersFn function', function (t) {
  t.plan(2)
  var o = new abitof.Origin(originFn)
  t.ok(o.removeListeners, 'removeListeners exists')
  t.equal(typeof(o.removeListeners), 'function', 'removeListeners is a fn')
})

test('origin should have an output list', function (t) {
  t.plan(3)
  var o = new abitof.Origin(originFn)
  t.ok(o.outputs, 'outputs exists')
  t.ok(o.outputs.length, 'outputs is a list')
  t.ok(o.outputs[0]._alive, 'outputs is a list of kefir streams')
})

test('should be able to update with a new function (no downstreams attached)', function (t) {
  t.plan(1)
  // make an origin with our old function
  var o = new abitof.Origin(originFn)
  // make a new origin function
  function originFn2 () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ]
    ]
  }
  // update the origin with our new function
  o.update(originFn2)
  // if nothing crashed, i guess it worked
  t.ok(true, 'update function takes')
})


test('should be able to attach a downstream', function (t) {
  t.plan(2)
  // we'll use this event emitter to spy on output from Origin
  var spy = new EventEmitter()
  // make an origin function that emits a 1
  function originFn1 () {
    var ee = new EventEmitter()
    setTimeout(() => ee.emit('number', 1), 10)
    return [
      [ ee, 'number' ]
    ]
  }
  // make an origin with that function
  var o = new abitof.Origin(originFn1)
  // make a downstream with our spy in it
  class Downstream {
    constructor () {
      this.inputs = null
      this.handle = (x) => spy.emit('value', x)
    }
    propogate (upstream) {
      this.inputs = upstream.outputs
      this.inputs.forEach((i) => i.onValue(this.handle))
    }
  }
  var myDownstream = new Downstream()
  o.attach(myDownstream)
  spy.on('value', (v) => {
    t.equal(v, 1, 'we get values from attaching a downstream to an origin.')
    spy.removeAllListeners('value')
    t.end()
  })

  t.equal(o.downstream, myDownstream, 'downstream should have attached.')
})


test('updating Origin\'s function should propogate downstream', function (t) {
  t.plan(2)
  // we'll use this event emitter to spy on output from Origin
  var spy = new EventEmitter()
  // make an origin function that emits a 1
  function originFn1 () {
    var ee = new EventEmitter()
    setTimeout(() => ee.emit('number', 1), 10)
    return [
      [ ee, 'number' ]
    ]
  }
  // make another origin function that emits a 2
  function originFn2 () {
    var ee = new EventEmitter()
    setTimeout(() => ee.emit('number', 2), 10)
    return [
      [ ee, 'number' ]
    ]
  }
  // make an origin with that function
  var o = new abitof.Origin(originFn1)
  // make a downstream with our spy in it
  class Downstream {
    constructor () {
      this.inputs = null
      this.handle = (x) => spy.emit('value', x)
    }
    propogate (upstream) {
      this.inputs = upstream.outputs
      this.inputs.forEach((i) => i.onValue(this.handle))
    }
  }
  var myDownstream = new Downstream()
  // attach this downstream to our origin
  o.attach(myDownstream)
  // let's try to see a 1 from our downstream
  spy.on('value', (v) => {
    t.equal(v, 1, 'v should equal the first origin function\'s value')
    // now that that worked, let's remove this binding
    spy.removeAllListeners('value')
    // let's update the origin with a different function
    // make an Origin with the first function
    o.update(originFn2)
    // now, we should see a value 2 from spy
    spy.on('value', (v) => {
     t.equal(v, 2, 'v should equal the *new* origin function\'s value')
     t.end()
   })
  })
})




