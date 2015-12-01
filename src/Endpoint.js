// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component = require('./Component')
var validators = require('./validators')

// TODO
// validate: input fn a stream, returns an array of streams
// inheritence works?

class Endpoint extends Component {

  constructor (fn) {
    super(fn)
    // note that endpoints have no attach method 
    // (nothing can come after an endpoint)
    this.attach= null
    this.update(fn)
  }

  update (newFn) {
    // unsubscribe old inputs
    if (this.inputs) {
      this.inputs.forEach((i) => 
        i.offValue(this.handle))
    }
    // get new inputs
    this.inputs = upstream.outputs
    // subscribe new inputs
    this.inputs.forEach((i) => 
      i.onValue(this.handle))
    // we don't need to call super.update()
    // that method will propogate to downstreams
    // but, Endpoints never have downstreams.
  }

  // methods inherited from Component:

  // propogate()

}

module.exports = Endpoint 