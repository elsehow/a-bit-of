'use strict'

var test = require('tape')
  , utils = require('../util/utils.js')
  , Transform = require('../..').Transform
  , Component = require('../../src/Component')
  , Kefir = require('kefir')

function TransformSpecs () {

  test('%%%% TRANSFORM SPEC %%%%', (t) => t.end())

  test('initiates properly', function (t) {
    var tr = new Transform().update(utils.timesTwoTransformFn)
    t.equals(tr._fn, utils.timesTwoTransformFn, '_fn is what i expect')
    t.equals(tr._outputs, null, '_outputs is null - there are no inputs')
    t.end()
  })

  test('_takeFromUpstream will generate new streams from a given stream array, and pass them downstream', (t) => {
    var tr = new Transform().update(utils.timesTwoTransformFn)
    var ds = new Component()
    // attach a transform to a downstream
    tr.attach(ds)
    // feed transform an array of kefir streams
    tr._takeFromUpstream([ utils.oneStream() ])
    // verify that downstream's input[0] is a stream of ones.
    utils.verifyStream(t, ds._inputs[0], 1*2, 'downstream inputs[0] is from its upstream.', () =>
      t.end())
  })

  test('update will generate new streams from an existing stream array, and pass them downstream', (t) => {
    var tr = new Transform().update(utils.timesTwoTransformFn)
    var ds = new Component()
    // attach a transform to a downstream
    tr.attach(ds)
    // feed transform an array of kefir streams
    tr._takeFromUpstream([ utils.oneStream() ])
    // now, downstream's inputs[0] is a stream of ones... 
    utils.verifyStream(t, ds._inputs[0], 1*2, 'downstream inputs[0] is from its upstream.', () => {
      // but, if we `tr.update`, downstream inputs should change.
      tr.update(utils.timesThreeTransformFn)
      utils.verifyStream(t, ds._inputs[0], 1*3, 'downstream inputs[0] is from its new upstream', () =>
        t.end())
    })
  })  

  // tests for validation ----------------------------------------

  test('validates user input fn (only when there are inputs, though)', (t) => {
    t.plan(3)
    // a higher-order function for making error handlers
    function checkError (msg) {
      return (err) => {
        console.log('an error i was expecting to see', err)
        t.ok(err, msg)
      }
    }
    var tr = new Transform(checkError('errors on bad fn')).update(utils.timesTwoTransformFn)
    var ds = new Component()
    // attach a transform to a downstream
    tr.attach(ds)
    // feed transform an array of kefir streams
    tr._takeFromUpstream([ utils.oneStream() ])
    // bad function 1
    tr.update(function () {
      return [ 'not a stream' ]
    })
    // bad function 2
    tr.update('not a function')
    // bad function 3
    tr.update(function () {
      return Kefir.sequentially([1,2,3])
    })
    // good function - should see no error
    tr.update(function () {
      return [ Kefir.sequentially([1,2,3], 100) ]
    })
  })

}

module.exports = TransformSpecs



