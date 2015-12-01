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

  // takes in a new function
  // makes fresh kefir streams from that function's event emitters
  // it re-executes the WHOLE origin setup function - including any state it holds.
  // returns a list of kefir streams
  // (see Origin API)
  update (fn) {
    if (fn) {
      this._fn = fn
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
      // make new output streams from the new emitters
      this._outputs = streamsFrom(this._emittersList)
      // propogate changes to the downstream layer
      super._sendChangesDownstream()
    }
  }

  // refreshStreams () {
  //   this._removeListeners()
  //   return streamsFrom(this._emittersList)
  // }

}

module.exports = Origin