// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODOS
// multiple downstreams?
// rethink the way error handling works
// `detach` function?

var Component = require('./Component')
var kefir = require('kefir')
var validators = require('./validators')

// origin return values are a list of:
//
//  [
//    [ emitter, 'event']
//    ...
//  ]
//
// this returns a function that clears all event listeners
function makeRemoveListenersFn (emittersList) {
  return function () {
    emittersList.forEach((v) => 
      v[0].removeAllListeners(v[1]))
  }
}

// this function returns a list of kefir streams
function makeStreams (emittersList) {
  return emittersList.map((v) => 
    kefir.fromEvents(v[0], v[1]))
}

function updateOutputs (emittersList) {
  if (emittersList)
    return makeStreams(emittersList)
  return
}

class Origin extends Component {

  constructor (fn) {
    super(fn)
    // initiate internal state variables
    this.fn = function () { } 
    this.removeListeners = function () { } 
    // note that Origin has no propogate() method.
    this.propogate = null
    this.update(fn)
  }

  // this takes in a new function
  update (newFn) {
    // validate input fn
    var r = validators.originFn(newFn)
    // throw any errors and exit
    if (r.err) {
      this.error = r.err
      return
    }
    // set the new function
    this.fn = newFn
    // remove all old event listeners
    this.removeListeners()
    // make a new `removeListeners` fn
    this.removeListeners = makeRemoveListenersFn(r.returnVal)
    // make new output streams
    this.outputs = updateOutputs(r.returnVal)
    // propogate changes to the downstream layer
    super.update(newFn)
    // note that Origin has no propogate method.
  }

  // inherited from Component:
  // attach()
  // note that Origin has no propogate() method.

}

module.exports = Origin