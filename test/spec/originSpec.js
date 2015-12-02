'use strict'

var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages

// our consumer function emits 'value' events through this emitter
var outputEmitter = new EventEmitter()

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

function OriginSpecs () {

  test('Origin should be created with proper defaults', function (t) {
    var o = new abitof.Origin(originFn)
    t.equal(typeof(o.update), 'function', 'update is a fn')
    t.equal(o.downstream, null, 'downstream == null')
    t.equal(typeof(o.removeListeners), 'function', 'removeListeners is a fn')
    t.ok(o.outputs.length, 'outputs is a list')
    t.ok(o.outputs[0]._alive, 'outputs is a list of kefir streams')
    t.end()
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
      t.equal(v, 1, 'downstream should get the first origin function\'s values')
      // now that that worked, let's remove this binding
      spy.removeAllListeners('value')
      // let's update the origin with a different function
      // make an Origin with the first function
      o.update(originFn2)
      // now, we should see a value 2 from spy
      spy.on('value', (v) => {
       t.equal(v, 2, 'now downstream should get the *new* origin function\'s values')
       t.end()
     })
    })
  })

  test('downstreams shouldn\'t be able to attach to an Origin', function (t) {
    t.plan(1)
    var expectedError = errorMessages.badDownstream
    // bad upstream
    function upstream () { }
    // make a new origin
    var o1 = new abitof.Origin(originFn)
    var o2 = new abitof.Origin(originFn)
    o1.attach(o2)
    t.equal(o1.error, expectedError, 'should have an error after trying to attach an origin as a downstream.')
  })



  // tests for validation ----------------------------------------
  test.skip('Origin should validate its input functions', function (t) {
    t.plan(4)
    // the error we expect to see for all these tests
    var expectedError = errorMessages.badOriginFn
    // a function that sees if our origin function behaves as expected
    function checkOriginError (origin, comment) {
      t.equal(origin.error, expectedError, comment)
    }
    // make an origin function that emits a 1
    function badOriginFn1 () {
      var ee = new EventEmitter()
      // bad format 
      return [ ee, 'number' ]
    }
    checkOriginError(new abitof.Origin(badOriginFn1), 'rejects when fn doesnt return a list of lists')
    function badOriginFn2 () {
      var ee = 'not an event emitter'
      // `ee` not an event emitter
      return [ 
        [ ee, 'number' ]
      ]
    }
    checkOriginError(new abitof.Origin(badOriginFn2), 'rejects when fn doesn\'t return event emitters')
    function badOriginFn3 () {
      var ee = new EventEmitter()
      return [ 
        [ ee, 0 ] // second value is not a string
      ]
    }
    checkOriginError(new abitof.Origin(badOriginFn3), 'rejects when fn doesn\'t return strings for event names')
    var badOriginFn4 = 'not a function'
    checkOriginError(new abitof.Origin(badOriginFn4), 'rejects when fn isnt a fn')
  })

  test.skip('Origin should validate its input functions on update', function (t) {
    t.plan(2)
    var expectedError = errorMessages.badOriginFn
    // start an origin with a legit 
    var o = new abitof.Origin(originFn)
    t.notOk(o.error, 'no error')
    // now update it to be a bad origin fn
    var badOriginFn = function () { return []   } 
    o.update(badOriginFn)
    t.equal(o.error, expectedError, 'should have an error after updating to a bad fn.')
  })

  test('Origin should refuse to take upstream', function (t) {
    t.plan(2)
    var expectedError = errorMessages.badDownstream
    // bad upstream
    function upstream () { }
    // make a new origin
    var o = new abitof.Origin(originFn)
    t.notOk(o.error, 'no error')
    o.attach(upstream)
    t.equal(o.error, expectedError, 'should have an error after updating to a bad fn.')
  })


}

module.exports = OriginSpecs