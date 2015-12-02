'use strict'

// A BIT OF
// elsehow
// github.com/elsehow/a-bit-of
// BSD
// integration spec
var test = require('tape')
  , utils = require('../util/utils.js')
  , timeouts = []
  , EventEmitter = require('events').EventEmitter

function testEmission (t, spy, expected, note, cb) {
  spy.on('value', (v) => {
    t.equal(v, expected, note)
    spy.removeAllListeners('value')
    cb()
  })
  return
}

function IntegrationSpecs () {

  test('Basic hierarchy', function (t) {
    // make a hierarchy:
    // origin -> transform -> endpoint
    var or = utils.makeOneOrigin(timeouts)
    var tr = utils.makeTimesTwoTransform()
    var r = utils.makeSpyEndpoint()
    or.attach(tr).attach(r.endpoint)
    // make sure values flow thorugh the hierarchy
    function hierarchyTest (cb) {
      testEmission(t, r.spy, 1*2, 'values flow thru hierarchy', cb)
    }
    // swap the origin function of our hierarchy 
    function swapOriginFnTest (cb) {
      var oldHandler = r.endpoint._handlers
      or.update(utils.makeTwoOriginFn(timeouts))
      t.notEqual(oldHandler, r.endpoint._handlers, 'updating origin, endpoint handlers updated')
      testEmission(t, r.spy, 2*2, 'updating origin, right values come through endpoint', cb)
    }
    // swap the transform function of our hierarchy
    function swapTransformFnTest (cb) {
      var oldHandler = r.endpoint._handlers
      tr.update(utils.timesThreeTransform)
      t.notEqual(oldHandler, r.endpoint._handlers, 'updating transform, endpoint handlers updated')
      testEmission(t, r.spy, 2*3, 'updating transform, right values come through endpoint', cb)
    }
    function swapEndpointFn (cb) {
      var spy2 = new EventEmitter()
      var endpntFn = utils.makeEndpointFn(spy2)
      r.endpoint.update(endpntFn)
      testEmission(t, spy2, 2*3, 'endpoint gets swapped', cb)
    }
    // do the tests
    hierarchyTest(() => 
      swapOriginFnTest(() =>
        swapTransformFnTest(() =>
          swapEndpointFn(() =>
            t.end()))))
  })


// basic 4-hierarchy
// origin -> transform -> transform -> endpoint
// single stream passing from each layer


// multi-stream 3-hierarchy
// origin -> transform -> endpoint
// 3 streams -> 2 streams -> 3 streams


// cleanup tests -----------------------------------------------
test('cleanup', function (t) {
  t.plan(1)
  timeouts.forEach((t) => clearTimeout(t))
  t.ok(true, 'cleaned up')
})

}

module.exports = IntegrationSpecs