// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component = require('./Component')
  , validate = require('./validators.js').transformFn

class Transform extends Component {

  constructor (errorCb) {
    super(errorCb)
  }

  update (newFn) {
    // just set the new fn if we have one
    // we can't validate it until we get inputs
    if (newFn)
      this._fn = newFn
    // re run fn on our inputs
    if (this._inputs) {
      var val = validate(this._fn, this._inputs)
      if (val.error) {
        this._errorCb(val.error)
        return
      }
      // set our outputs
      this._outputs = val.returnVal
    }
    // propogate changes downstram
    super._sendChangesDownstream(this._outputs)
    return this
  }

}

module.exports = Transform