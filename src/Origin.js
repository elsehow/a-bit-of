// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODOS
// how to attach a downstream?
// should validate downstreams that get attached
// should validate input fn ?
// multiple downstreams?

var kefir = require('kefir')

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

// todo - make a separate module for validators
function validate (fn) {
  // check that fn is a function
  // check that it retuns a list
  // check that the list has lists of length 2
  // check that each list of length 2 is an emitter, event pair
  return {
    err: null,
    returnVal: fn()
  }
}

function updateOutputs (emittersList) {
  if (emittersList)
    return makeStreams(emittersList)
  return
}

class Origin {

  constructor (fn) {
    // initiate internal state variables
    // this bit illustrates what state an Origin has
    this.fn = function () { } 
    this.outputs = []
    this.downstream = null
    this.removeListeners = function () { } 
    this.update(fn)
  }

  // this takes in a new function
  update (newFn, cb) {
    // validate input fn
    var r = validate(newFn)
    // throw any errors and exit
    if (r.err) {
      throw r.err
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
    if (this.downstream) {
      // we assume each downstream has an `propogate` method
      // we call that method on `this`.
      // our changes flow downstream.
      this.downstream.propogate(this)
    }
    // note that Origin has no propogate method.
  }

  // attach a downstream node
  attach (downstream) {
    this.downstream = downstream
    downstream.propogate(this)
  }

}

module.exports = Origin