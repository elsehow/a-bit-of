// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component = require('./Component')
var validators = require('./validators')

class Transform extends Component {

  constructor (fn) {
    super()
    this.update(fn)
  }

  update (newFn) {
    if (newFn)
      this._fn = newFn
    // if we have any inputs
    if (this._inputs) {
      // re run fn on our inputs, set our outputs
      this._outputs = this._fn.apply(null, this._inputs)
    }
    super._sendChangesDownstream()
  }

}

module.exports = Transform