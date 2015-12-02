'use strict'

var test = require('tape')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , utils = require('../util/utils.js')
  , Transform = require('../..').Transform

// refs for our timeouts
var timeouts = []

// TODO
// ALL components should get some prototypical methods..
// - attach to a downstream
// - attach to an upstream
// - validate downstream
// - validate upstream

// tests --------------------------------------------------------

function TransformSpecs () {

  test('Transform should initialize with proper defaults', function (t) {
    var o = new Transform(utils.timesTwoTransform)
    t.equal(typeof(o.update), 'function', 'update is a fn')
    t.equal(o.downstream, null, 'downstream == null')
    t.equal(o.upstream, null, 'upstream == null')
    t.end()
  })

  test('should be able to attach a downstream and an upstream', function (t) {
    var r = utils.makeSpyEndpoint(timeouts)
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      t.equal(v, 2, 'we get values from attaching a downstream to an origin.')
      spy.removeAllListeners('value')
      t.end()
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = utils.makeOneOrigin(timeouts)
    // make a new transform
    var o = new Transform(utils.timesTwoTransform)
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'should be no error after attaching to downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })

  test('should be able to swap upstream functions', function (t) {
    var r = utils.makeSpyEndpoint(timeouts)
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      t.equal(v, 2, 'we get values from attaching a downstream to an origin.')
      spy.removeAllListeners('value')
      // once we do, 
      // let's swap origin for a function that emits a stream of 2's
      oneOrigin.update(utils.makeTwoOriginFn(timeouts))
      // now we should see a 4 come out of our spy in the downstream
      // now we should see a 2 come out of our spy in the downstream
      spy.on('value', (v) => {
        t.equal(v, 4, 'we get the updated upstream\'s values downstream.')
        spy.removeAllListeners('value')
        t.end()
      })
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = utils.makeOneOrigin(timeouts)
    // make a new transform
    var o = new Transform(utils.timesTwoTransform)
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'should be no error after attaching to downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })

  test('should be able to swap transform\'s functions', function (t) {
    var r = utils.makeSpyEndpoint(timeouts)
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // make a new transform
    var o = new Transform(utils.timesTwoTransform)
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      spy.removeAllListeners('value')
      t.equal(v, 2, 'we get values from origin->transform->endpoint.')
      // once we do, 
      // let's swap our transform function for something else
      o.update(utils.timesThreeTransform)
      // now we attach a new listener, expecting 3's from our updated function
      spy.on('value', (v) => {
        t.equal(v, 3, 'see new values at endpoint after updating transform.')
        t.end()
        spy.removeAllListeners('value')
      })
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = utils.makeOneOrigin(timeouts)
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'no error attaching downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })



  // tests for validation ----------------------------------------

  // cleanup tests -----------------------------------------------
  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })

}

module.exports = TransformSpecs



