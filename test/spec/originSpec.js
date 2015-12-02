'use strict'

var test = require('tape')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , Origin = require('../..').Origin
  , utils = require('../util/utils.js')
  , timeouts = []

// tests --------------------------------------------------------

function OriginSpecs () {

  test('Origin should be created with proper defaults', function (t) {
    var o = new Origin(utils.makeTwoOriginFn(timeouts))
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
    var o = new Origin(utils.makeTwoOriginFn(timeouts))
    var oF2 = utils.makeTwoOriginFn(timeouts)
    o.update(oF2)
    // if nothing crashed, i guess it worked
    t.ok(true, 'update function takes')
  })


  test('should be able to attach a downstream', function (t) {
    t.plan(1)
    var o = utils.makeOneOrigin(timeouts)
    var myDownstream = utils.makeSpyEndpoint().endpoint
    o.attach(myDownstream)
    t.equal(o.downstream, myDownstream, 'downstream should have attached.')
  })


  test('downstreams shouldn\'t be able to attach to an Origin', function (t) {
    t.plan(1)
    var expectedError = errorMessages.badDownstream
    // bad upstream
    function upstream () { }
    // make a new origin
    var o1 = utils.makeOneOrigin(timeouts)
    var o2 = utils.makeOneOrigin(timeouts)
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
    checkOriginError(new Origin(badOriginFn1), 'rejects when fn doesnt return a list of lists')
    function badOriginFn2 () {
      var ee = 'not an event emitter'
      // `ee` not an event emitter
      return [ 
        [ ee, 'number' ]
      ]
    }
    checkOriginError(new Origin(badOriginFn2), 'rejects when fn doesn\'t return event emitters')
    function badOriginFn3 () {
      var ee = new EventEmitter()
      return [ 
        [ ee, 0 ] // second value is not a string
      ]
    }
    checkOriginError(new Origin(badOriginFn3), 'rejects when fn doesn\'t return strings for event names')
    var badOriginFn4 = 'not a function'
    checkOriginError(new Origin(badOriginFn4), 'rejects when fn isnt a fn')
  })

  test.skip('Origin should validate its input functions on update', function (t) {
    t.plan(2)
    var expectedError = errorMessages.badOriginFn
    // start an origin with a legit 
    var o = new Origin(originFn)
    t.notOk(o.error, 'no error')
    // now update it to be a bad origin fn
    var badOriginFn = function () { return []   } 
    o.update(badOriginFn)
    t.equal(o.error, expectedError, 'should have an error after updating to a bad fn.')
  })

  // cleanup tests -----------------------------------------------
  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })

}

module.exports = OriginSpecs