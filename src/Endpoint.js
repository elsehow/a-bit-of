// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component = require('./Component')
var validators = require('./validators')

// TODO
// validate: fn returns an array of functions

// applies fn, a method of each item in listOne, to each item in listTwo
// this works even if the lists aren't equal length
// or if the lists are falsey.
function doOnEach (fn, listOne, listTwo) {
  if (listOne && listTwo) {
    listOne.forEach((e, i) => {
      if (listTwo[i]) 
        e[fn](listTwo[i])
    })
  }
  return
}

// does stream.offValue(function)
// for each stream & function
function unplugEach (streams, functions) {
  doOnEach('offValue', streams, functions)
  return
}

// does stream.onValue(function)
// for each stream & function
function plugEach (streams, functions) {
  doOnEach('onValue', streams, functions)
  return
}

class Endpoint extends Component {

  constructor (fn) {
    super()
    // component has a special field, `handles`
    // cf. "outputs" - an endpoint has no outputs.
    this._handlers = null
    this.update(fn)
  }

  update (newFn) {

    // update fn if necessary
    if (newFn) {
      this._fn = newFn
    }

    // get new handles
    this._handlers = this._fn()
    
    // subscribe new inputs to handles
    plugEach(this._inputs, this._handlers)

    // note how we DON'T super._sendDownstream
    // Endpoints never have downstreams.
  }

  _takeFromUpstream (upstreamOutputs) {
    // unplug our current inputs from our old handles
    unplugEach(this._inputs, this._handlers)
    //
    super._takeFromUpstream(upstreamOutputs)
  }

}

module.exports = Endpoint 