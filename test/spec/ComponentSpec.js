'use strict'

var test = require('tape')
  , EventEmitter = require('events').EventEmitter
  , Component = require('../../src/Component')
  , utils = require('../util/utils.js')

function ComponentSpecs () {

  test('%%%% COMPONENT SPEC %%%%', (t) => t.end())

  test('proper defaults', (t) => {
    var c = new Component()
    t.equal(c._inputs, null, '_inputs is null')
    t.equal(c._outputs, null, '_outputs is null')
    t.equal(c._downstream, null, '_downstream is null')
    t.equal(typeof(c._errorCb), 'function', 'default _errorCb exists and is a fn')
    t.equal(typeof(c._fn), 'function', '_fn is a function')
    t.equal(c._fn(), null, 'default _fn() returns []')
    t.equal(typeof(c._sendChangesDownstream), 'function', '_sendChangesDownstream is a fn')
    t.equal(typeof(c.update), 'function', 'update is a fn')
    t.equal(typeof(c.attach), 'function', 'attach is a fn')
    t.end()
  })


  test('Components should be able to attach to each other, outputs to inputs.', (t) => {
    // try with a 2-stream
    var c1 = new Component()
    var c2 = new Component()
    c1._outputs = [ 1, 0 ]
    c1.attach(c2)
    t.equal(c2, c1._downstream, 'c1.attach(c2)')
    t.deepEqual(c2._inputs, c1._outputs, 'outputs propogate as inputs')
    t.deepEqual(c1._downstream, c2, '_downstream applied correctly')
    // try with a 3-stream
    var c1 = new Component()
    var c2 = new Component()
    var c3 = new Component()
    c1._outputs = [ 1, 0 ]
    c1.attach(c2).attach(c3)
    t.equal(c3, c2._downstream, 'c1.attach(c2).attach(c3)')
    t.end()
  })

  test('Component should accept an error callback', (t) => {
    function handleError (err) {}
    var c2 = new Component(handleError)
    t.deepEquals(c2._errorCb, handleError)
    t.end()
  })

}

module.exports = ComponentSpecs