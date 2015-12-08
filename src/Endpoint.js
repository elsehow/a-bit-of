// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component   = require('./Component')
  , validate    = require('./validators.js').endpointFn

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

  constructor (errorCb) {
    super(errorCb)
    // component has a special field, `handles`
    // cf. "outputs" - an endpoint has no outputs.
    this._handlers = null
    delete this.outputs
  }

  update (newFn) {

    // if there's a new fn, validate + update
    if (newFn) {
      var val = validate(newFn)
      if (val.error) {
        this._errorCb(val.error)
        return
      }
      // first, unplug the old functions
      unplugEach(this._inputs, this._handlers)
      // set the new function
      this._fn = newFn
      // and refresh our handlers
      // doing the taredown function, if there is one
      if (val.returnVal.taredown) {
        this._handlers = val.returnVal.handlers
        val.returnVal.taredown()
      } else 
        this._handlers = val.returnVal
    }

    // whether there's a new fn or no,
    // subscribe new inputs to handles
    plugEach(this._inputs, this._handlers)

    // note how we DON'T super._sendDownstream
    // Endpoints never have downstreams.
    return this
  }

  _takeFromUpstream (upstreamOutputs) {
    // unplug our current inputs from our old handles
    unplugEach(this._inputs, this._handlers)
    //
    super._takeFromUpstream(upstreamOutputs)
  }

  // we overwrite the attach() method to error
  // nothing can be downstream of an Endpoint
  attach () {
    this._errorCb('You can\'t attach components to an Endpoint. Nothing comes downstream of and Endpoint.')
  } 

}

module.exports = Endpoint 