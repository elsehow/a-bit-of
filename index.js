/* A BIT OF
 * elsehow
 * github.com/elsehow/a-bit-of
 * BSD license
 */

var Kefir = require('kefir')
  , hotmop = require('hotmop')
  , EventEmitter = require('events').EventEmitter

// validators
function setupFnValidator (returnVal) {
  // TODO validate that API is ok
  // TODO - that it's a list
  // TODO - that each item is [emitter, event]
  // TODO emit 'err', config.errorMessages.badSetupReturnValue
  // turn each return value into a kefirStream
  return 
}

function processFnValidator (returnVal) {
  // TODO make sure it's a list of streams
  return
}

function outputFnValidator (returnVal) {
  // TODO make sure its whatever i decide that api is
  // TODO that each item `output()` returns is a fn
  return
}

function validate (fn, fnArgsList, validator, cb) {
  // run validator function on the fn's output
  var rv = fn.apply(null, fnArgsList)
  var err = validator(rv)
  if (err) {
    cb(err)
    return
  }
  cb(null, rv)
  return
}

function makeRemoveEventListenersFn (setupFnOutput) {
  return function () {
    setupFnOutput.forEach((e) =>  {
      e[0].removeAllListeners(e[1])
    })
  }
}

function makeKefirStreams (setupFnOutput) {
  return setupFnOutput.map((e) => {
    return Kefir.fromEvents(e[0], e[1])
  })
}

// applies fn, a method of each item in listOne, to each item in listTwo
// this works even if the lists aren't equal length
// or if the lists are falsey.
function doOnEach (fn, listOne, listTwo) {
  if (listOne && listTwo) {
    listOne.forEach((e, i) => {
      if (listTwo[i])
        e[fn](listTwo[i])
      return
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

module.exports = function (setupPath, processPath, outputPath) {

  //  state
  var oldSetupOutput = []
  var oldProcessedStreams = []
  var oldOutputFns =  []
  var removeEventListeners = function () { }

  // this function returns an event emitter
  // it will emit
  // 
  //    - 'error' (err)
  //    - 'setup-update' (returnValue)
  //    - 'process-update' (returnValue)
  //    - 'output-update' (returnValue)
  //
  var emitter = new EventEmitter()

  function handleError (err) {
    // emit an error
    emitter.emit('error', err)
    //taredown app
    removeEventListeners()
    return
  }

  var hotswap = hotmop(setupPath, processPath, outputPath)

  var setupFn = require(setupPath)
  var processFn = require(processPath)
  var outputFn = require(outputPath)

  // when setup() changes:
  // we re-run it, establishing all of our event emitters anew
  // then we make kefir streams of them
  // and pass them to process()
  // finaly, we plug the return values from process() (streams)
  // into the return values from output() (fns)
  function refreshSetup () {
    console.log('setting up the whole deal...')
    // check function for syntax errors
    // and make sure its return value conforms to API
    validate(setupFn, null, setupFnValidator, (err, returnVal) => {
      // emit any errors
      if (err) {
        handleError(err)
        return
      }
      // otherwise, we're good to go
      // we remove our old event listeners
      removeEventListeners()
      // save a new function for removing these new event listeners we're about to make
      removeEventListeners = makeRemoveEventListenersFn(returnVal)
      // make streams out of these emitters and events
      var newSources = makeKefirStreams(returnVal)
      // emit the new kefir streams we made
      emitter.emit('setup-update', newSources)
      // make new processed streams
      var newProcessedStreams = processFn.apply(null, newSources)
      // unplug old streams from old outputs
      unplugEach(oldProcessedStreams, oldOutputFns)
      // plug new streams into old outputs
      plugEach(newProcessedStreams, oldOutputFns)
      // update `oldSetupOutput` global
      // TODO - this is the odd one out in the pattern
      // everything else returns a stream.....
      oldSetupOutput = returnVal
      return
    })
    return
  }

  // when process() changes:
  // unsubscribe old streams to outputs
  // subscribe new streams to outputs
  function refreshProcess () {
    console.log('setting up process')
    // FIRST, remove all old event listeners
    removeEventListeners()
   // make streams out of these (now listener-less) emitters and events
    var newSources = makeKefirStreams(oldSetupOutput)
    // now we can validate the new function..
    validate(processFn, newSources, processFnValidator, (err, returnVal) => {
      // make some new event listenres by executing process() on the existing sources
      var newProcessedStreams = returnVal
      // emit the new processed streams we made
      emitter.emit('process-update', newProcessedStreams)
      // unplug old streams from the old output function
      unplugEach(oldProcessedStreams, oldOutputFns) 
      // plug new streams into the old output functions
      plugEach(newProcessedStreams, oldOutputFns)
      // update `oldProcessedStreams` global
      oldProcessedStreams = newProcessedStreams
      return
    })
  }

  // when output() changes:
  // unsubscribe streams to old outputs
  // subscribe streams to new outputs
  function refreshOutput () {
    console.log('setting up output')
    validate(outputFn, null, outputFnValidator, (err, returnVal) => {
      var newOutputFns = returnVal
      // emit the new output fns we made
      emitter.emit('output-update', newOutputFns)
      // unplug old streams from old output functions
      unplugEach(oldProcessedStreams, oldOutputFns)
      // plug old streams into the new output functions
      plugEach(oldProcessedStreams, newOutputFns)
      // update `oldOutputFns global`
      oldOutputFns = newOutputFns
      return
    })
  }

  // run all the routines for the first time 
  refreshSetup()
  refreshProcess()
  refreshOutput()

  // setup handlers for future hot-swaps
  hotswap.on(setupPath, refreshSetup)
  hotswap.on(processPath, refreshProcess) 
  hotswap.on(outputPath, refreshOutput)

  // handle any errors
  // syntax errors on the files will be emitted here
  hotswap.on('error', handleError)

  // finally, return our emitter
  return emitter
} 