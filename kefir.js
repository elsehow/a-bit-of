/* A BIT OF
 * elsehow
 * github.com/elsehow/a-bit-of
 * BSD license
 */
 
var Kefir = require('kefir')

// returns an object
//
//    { em, ev, fn }
//
// everytime process() is reloaded,
// all listeners on `ev` get removed from `em`
// then we do fn(em,ev), and pass the result to process()

module.exports = function (em, ev) {

  return {

    em: em,

    ev: ev,

    fn: function (emitr, evnt) {
      return Kefir.fromEvents(emitr, evnt)
    }

  }

}
