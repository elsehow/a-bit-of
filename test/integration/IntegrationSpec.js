'use strict'

// A BIT OF
// elsehow
// github.com/elsehow/a-bit-of
// BSD
// integration spec
var test = require('tape')
  , utils = require('../util/utils.js')
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

  test('%%%% INTEGRATION SPEC %%%%', (t) => t.end())

  test('Basic hierarchy', function (t) {
    // make a hierarchy:
    // origin -> transform -> endpoint
    var or = utils.makeOneOrigin()
    var tr = utils.makeTimesTwoTransform()
    var r = utils.makeSpyEndpoint()
    or.attach(tr).attach(r.endpoint)
    // make sure values flow thorugh the hierarchy
    function hierarchyTest (cb) {
      testEmitter(t, r.spy, 1*2, 'values flow thru hierarchy', cb)
    }
    // swap the origin function of our hierarchy 
    function swapOriginFn (cb) {
      or.update(utils.makeTwoOriginFn())
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


  // multi-stream 3-hierarchy
  // origin -> transform -> endpoint
  // 2 streams -> 3 streams -> 3 streams
  // 2 streams split into 3 independent endpoints
  test('multi-stream basic hierarchy', function (t) {
    // 2 stream origin
    var or = utils.twoStreamOrigin()
    // 3 stream transform
    // last 2 streams are identical 
    // - but they will go to different endpoints
    var tr = utils.threeStreamTransform()
    // `r` has spy1,spy2,spy3 - three emitters with 'value' events
    var r = utils.makeThreeSpyEndpoint()
    // attach em all together
    or.attach(tr).attach(r.endpoint)
    // test em
    function doTest (cb) {
      testEmitter(t, r.spy1, 1*1, 'first endpoint ok', () => {
        testEmitter(t, r.spy2, 2*2, 'second endpoint ok', () => {
          testEmitter(t, r.spy3, 2*3, 'third endpoint ok', cb)
        })
      })
    }
    doTest(() => t.end())
    // TODO -   swap origin fn
    // TODO -   swap trasnform fn
    // TODO -   swap endpoint fn
    // BREAK OUT INTO FUNCTIONS
    // EASIER TO SWAP THAT WAY
  })


  // basic 4-hierarchy
  // origin -> transform -> transform -> endpoint
  // single stream passing from each layer



  // cleanup and exit tests
  utils.cleanup(test)

}

module.exports = IntegrationSpecs