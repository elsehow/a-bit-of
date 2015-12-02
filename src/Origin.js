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
  , Kefir = require('kefir')
//, validators = require('./validators')

// this returns a function that clears all event listeners
// emittersList: [  [ emitter, 'event']  ...  ]
function makeRemoveListenersFn (emittersList) {
  return function () {
    emittersList.forEach((v) => 
      v[0].removeAllListeners(v[1]))
  }
}

function streamsFrom (emittersList) {
  return emittersList.map((v) => 
    Kefir.fromEvents(v[0], v[1]))
}

class Origin extends Component {

  constructor (fn) {
    super()
    this._removeListeners = function () { } 
    this.update(fn)
  }

  // this function refreshes the whole origin functino
  // it re-executes the origin setup function
  // this function is private - only called via update()
  // returns a list of kefir streams
  _makeFreshStreams () {
    // remove all old event listeners
    this._removeListeners()
    // execute the new function
    // remember this fn may contain state -
    // serial, websocket connections, etc
    // so we're very careful about when we run it
    //
    // origin return values are a list of:
    //    [  [ emitter, 'event']  ...  ]
    this._emittersList = this._fn()
    // make a new `removeListeners` fn for the new emitters
    this._removeListeners = makeRemoveListenersFn(this._emittersList)
    // now we return an array of kefir streams
    return streamsFrom(this._emittersList)
  }

  // this function refreshes the listeners, making fresh kefir streams 
  // DOES NOT re-execute the origin setup function
  // this function is public
  // also returns a list of kefir streams
  refreshListeners () {
    // remove all old event listeners
    this._removeListeners()
    // now we return an array of kefir streams
    return streamsFrom(this._emittersList)
  }

  // takes in a new function
  // makes fresh kefir streams from that function's event emitters
  // (see Origin API)
  update (fn) {
    if (fn) {
      this._fn = fn
      // make new output streams from the new emitters
      this._outputs = this._makeFreshStreams(this._fn())
      // propogate changes to the downstream layer
      super._sendChangesDownstream()
    }
  }

}

module.exports = Origin