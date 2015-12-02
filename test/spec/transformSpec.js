'use strict'

var test = require('tape')
  , utils = require('../util/utils.js')
  , Transform = require('../..').Transform
  , Component = require('../../src/Component')

function TransformSpecs () {

  test('%%%% TRANSFORM SPEC %%%%', (t) => t.end())

  test('initiates properly', function (t) {
    var tr = new Transform(utils.timesTwoTransformFn)
    t.equals(tr._fn, utils.timesTwoTransformFn, '_fn is what i expect')
    t.equals(tr._outputs, null, '_outputs is null - there are no inputs')
    t.end()
  })

  test('_takeFromUpstream will generate new streams from a given stream array, and pass them downstream', (t) => {
    var tr = new Transform(utils.timesTwoTransformFn)
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
    var tr = new Transform(utils.timesTwoTransformFn)
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

  test.skip('validates user input fn')

}

module.exports = TransformSpecs



