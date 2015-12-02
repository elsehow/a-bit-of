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
    // note that endpoints have no attach method 
    // (nothing can come after an endpoint)
    this.attach = null
    // component has a special field, `handles`
    this.handles = null
    this.update(fn)
  }

  update (newFn) {
    // update fn if necessary
    if (newFn) {
      this.fn = newFn
      // get new handles
      this.handles = this.fn()
    }
    // subscribe new inputs to handles
    plugEach(this.inputs, this.handles)

    // we don't need to call super.update()
    // that method propogates to downstreams,
    // but Endpoints never have downstreams.
  }

  propogate (upstream) {
    unplugEach(this.inputs, this.handles)
    super.propogate(upstream)
  }

}

module.exports = Endpoint 