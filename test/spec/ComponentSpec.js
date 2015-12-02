'use strict'

var test = require('tape')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , Component = require('../../src/Component')
  , utils = require('../util/utils.js')
  , timeouts = []

function ComponentSpecs () {

  test('COMPONENT SPEC - proper defaults', (t) => {
    var c = new Component()
    t.equal(c._inputs, null, '_inputs is null')
    t.equal(c._outputs, null, '_outputs is null')
    t.equal(c._downstream, null, '_downstream is null')
    t.equal(c._upstream, null, '_upstream is null')
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
    t.deepEqual(c2._upstream, c1, '_upstream applied correctly')
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

  test('Components should be able to _bubbleUp functions to Components they are attached to.', (t) => {
    // lets give a method `foo` to parent component
    var c1 = new Component()
    c1.foo = () => true 
    // let's attach a child component
    var c2 = new Component()
    c1.attach(c2)
    // and tell the child, which has no c2 method, tob ubble up c2
    c2._bubbleUp('foo', (res) => {
      t.equals(res, true, 'function bubled up')
      t.end()
    })
  })

}

module.exports = ComponentSpecs