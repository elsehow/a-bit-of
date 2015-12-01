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

// if emitter has an event 'value'
// we can use this to check that this value is our `expected` value
function testEmitter (t, emitter, expected, note, cb) {
  emitter.on('value', (v) => {
    t.equal(v, expected, note)
    emitter.removeAllListeners('value')
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
      testEmitter(t, r.spy, 1*2, 'values flow thru hierarchy', cb)
    }
    // swap the origin function of our hierarchy 
    function swapOriginFn (cb) {
      or.update(utils.makeTwoOriginFn(timeouts))
      testEmitter(t, r.spy, 2*2, 'updating origin, right values come through endpoint', cb)
    }
    // swap the transform function of our hierarchy
    function swapTransformFn (cb) {
      tr.update(utils.timesThreeTransformFn)
      testEmitter(t, r.spy, 2*3, 'updating transform, right values come through endpoint', cb)
    }
    function swapEndpointFn (cb) {
      var spy2 = new EventEmitter()
      var endpntFn = utils.makeEndpointFn(spy2)
      r.endpoint.update(endpntFn)
      testEmitter(t, spy2, 2*3, 'updating endpoint, right values come through', cb)
    }
    
    // do the tests
    hierarchyTest(() => 
      swapOriginFn(() =>
        swapTransformFn(() =>
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