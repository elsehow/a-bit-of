/* EASY CHARM
 * elsehow
 * github.com/elsehow/easy-charm
 * BSD license
 */

var path = require('path')
  , EventEmitter = require('events').EventEmitter

// api:
//
// single stream:
//
//    charm(path, emitter, event, fn)
//
// multiple streams:
//
//    charm(path, [emitter, event], [emitter2, event2], ..., fn)
//
// path: absolute path to a file that exports a function
//
// fn: takes (emitter, eventName). this gets applied to each 
//     emitter/event pair. whatever it returns is passed into 
//     the function exported in `path`'s file.

module.exports = function () {

  // inelegant spread operator
  var argsList =  []
  for (var i=0;i<arguments.length;i++) {
    argsList.push(arguments[i])
  }
  // the script user puts in 
  var appPath = argsList[0]
  // the pairs of [emitter, event]
  var emitEventPairs = argsList.slice(1, -1)
  // if the user was using the single-stream api, turn this arg into a list
  if (!emitEventPairs[0].length)
    emitEventPairs = [emitEventPairs]
  var userFn = argsList.slice(-1)[0]

  // we create + return an event emitter
  // where each value in the stream is 
  // the return value of `app`at the time it was saved
  var emitter = new EventEmitter()

  // hotswap overrides `require`
  // but this will only matter for for `appPath`.
  // it will cause appPath's require() statement to hot reload!
  //
  // `hotswap` here is an event emitter
  // it will emit:
  //
  //   - 'error' (err) -- an error
  //   - 'swap'  ()    -- notification that appPath was swapped.
  //
  var hotswap = require('hotmop')(appPath) 

  // fn to remove existing listeners from the emitters
  function removeAllListeners () {
    emitEventPairs.forEach(function (p) {
      p[0].removeAllListeners(p[1])
    })
  }

  // we run this fn at startup, 
  // and on reload (when the script is saved)
  function bootstrap (appFn) {

    // remove all the old listeners
    removeAllListeners()

    // turn the pairs into Kefir streams
    var newAppArgs = emitEventPairs.map(function (p) {
      return userFn(p[0], p[1])
    })

    // next, we try/catch executing the function
    // TODO - does this do anything?
    try {
      return appFn.apply(null, newAppArgs)
    } catch (err) {
      emitter.emit('error', err)
    }
  }
  

  // that hotswap module overwrites 'require'
  // because we add a module.change_code to it,
  // it will hotswap, and `hotswap` (below) will emit an event 'swap'
  var a = require(appPath)
  function startApp () {
    var v = bootstrap(a)
    emitter.emit('return-val', v)
  }

  // we set up the hot-reload functionality here
  // on every new require, we parse the app script for errors
  // if we catch one, we print it instead of crashing!
  startApp()
  hotswap.on('error', function (err) {
    emitter.emit('error', err)
    removeAllListeners() // this will effectively taredown the app
  })
  hotswap.on('swap', function () {
    startApp()
  })

  // return an emitter that emits 'return-val' events on file swap
  return emitter

}
