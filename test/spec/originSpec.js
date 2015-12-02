'use strict'

var test = require('tape')
  , Origin = require('../..').Origin
  , Component = require('../../src/Component')
  , utils = require('../util/utils.js')

// tests --------------------------------------------------------

function OriginSpecs () {

  test('%%%% ORIGIN SPEC %%%%', (t) => t.end())

  test('initiates properly ', function (t) {
    // with no function given
    var o = new Origin()
    t.equal(typeof(o._removeListeners), 'function', 'removeListeners is a fn')
    t.equal(o._outputs, null, '_outputs is null')
    // console.log('now trying an origin with a proper input function')
    var o = new Origin(utils.makeTwoOriginFn())
    t.equal(typeof(o._removeListeners), 'function', 'removeListeners is a fn')
    t.ok(o._outputs.length, '_outputs is a list')
    t.ok(o._outputs[0]._alive, '_outputs is a list of kefir streams')
    t.end()
  })

  test('origin.update(newFn)', function (t) {
    // make an origin with our old function
    var o = utils.makeOneOrigin()
    var outRef = o._outputs
    // we attach a component to it
    var c = new Component()
    o.attach(c)
    t.equal(o._outputs, c._inputs, 'verify that streams propogate from origin to attache component')
    // verify the stream gives us 1s
    utils.verifyStream(t, c._inputs[0], 1, 'attached component can get values from origin streams', () => {
      // now we update origin's function
      var oF2 = utils.makeTwoOriginFn()
      o.update(oF2)
      var newOutRef = o._outputs
      t.notEqual(newOutRef, outRef, 'origin updated its _output')
      t.equal(o._outputs, c._inputs, 'changes propogated to component')
      utils.verifyStream(t, c._inputs[0], 2, 'attached component can get values from origin streams after function update', () => 
        t.end())
    })
  })

  // TODO tests for validation ----------------------------------------

  test.skip('downstreams shouldn\'t be able to attach to an Origin')

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

}

module.exports = OriginSpecs