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
    var o = new Origin().update(utils.makeTwoOriginFn())
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
    t.equal(c._inputs, o._outputs, 'verify that origin outputs propogate to attached component inputs')
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

  test('Origin should validate its input functions', function (t) {
    t.plan(4)
    var EventEmitter = require('events').EventEmitter
    // a higher-order function for making error handlers
    function checkError (msg) {
      return (err) => {
        console.log('an error i was expecting to see', err)
        t.ok(err, msg)
      }
    }
    // 1
    function badOriginFn1 () {
      var ee = new EventEmitter()
      // bad format 
      return [ ee, 'number' ]
    }
    new Origin(checkError('rejects when fn doesnt return a list of lists'))
      .update(badOriginFn1), 
    // 2
    new Origin(checkError('rejects when fn doesn\'t return event emitters'))
      .update(() => {
      var ee = 'not an event emitter'
      // `ee` not an event emitter
      return [ 
        [ ee, 'number' ]
      ]
    })
    function badOriginFn3 () {
      var ee = new EventEmitter()
      return [ 
        [ ee, 0 ] // second value is not a string
      ]
    }
    // 3
    new Origin(checkError('rejects when fn doesn\'t return strings for event names'))
      .update(badOriginFn3)
    // 4
    new Origin(checkError('rejects when fn isnt a fn'))
      .update('not a fn')
  })

  test('Components shouldn\'t be able to attach to Origins - origins have no upstreams.', (t) => {
    t.plan(1)
    var c = new Component((err) => 
      t.ok(err, 'parent component throws error when i try to attach to origin'))
    var o = new Origin((err) => 
      t.notOk(err, 'origin should stay quiet when someone tries to attach to it.'))
    c.attach(o)
  })


}

module.exports = OriginSpecs