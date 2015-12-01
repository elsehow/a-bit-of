
// origin specs
require('./spec/ComponentSpec')()
require('./spec/OriginSpec')()
// require('./spec/TransformSpec')()
// require('./spec/EndpointSpec')()

// integration specs
require('./integration/IntegrationSpec')()






// todo
// component spec
// - attach
// - propogate
// - should be able to chain attach() statements
// endpoint spec
// validation thru the stack
// e2e tests... (or whatever you'd call this)








// var test = require('tape')
// var EventEmitter = require('events').EventEmitter

// // our consumer function emits 'value' events through this emitter
// var outputEmitter = new EventEmitter()

// //  tester fns --------------------------------------------------

// // a producer that produces 1's
// function producer () {
//   // make an event emitter
//   var oneEmitter = new EventEmitter()
//   setInterval(() =>  {
//     oneEmitter.emit('number', 1)
//   }, 500)
//   // return value conforms to the producer API
//   return [ oneEmitter, 'number' ]
// }

// // a transform that multiples everything by 2
// // takes a stream from the producer
// function transform (oneStream) {
//   return oneStream.map( (x) => x*2 )
// }

// // a consumer that emits everything over an emitter we have
// function consumer (stream) {
//   return {
//     handle: (x) => testEmitter.emit(x, 'value'),
//     taredown: () => return
//   }
// }

// // setup abitof
// var bit = abitof(producer, transform, consumer)


// // tests -----------------------------------------------------

// // test function swapping =====================================

// test('consumer should be emitting 1\'s', function (t) {
//   t.plan(1)
//   outputEmitter.on('value', (v) => {
//     t.equal(v, 1)
//     outputEmitter.removeAllListeners('value')
//   })
// })

// test('should be able to swap producer function', function (t) {
//   t.plan(1)
//   // make a new producer function
//   function newProducer () {
//     // make an event emitter that emitts 0
//     var countUpEmitter = new EventEmitter()
//     setInterval(() =>  {
//       countUpEmitter.emit('number', 0)
//     }, 500)
//     // return value conforms to the producer API
//     return [ countUpEmitter, 'number' ]
//   }
//   // swap it in
//   bit.swapProducer(newProducer)
//   // output should update
//   outputEmitter.on('value', (v) => {
//     t.equal(v, 0)
//     outputEmitter.removeAllListeners('value')
//   })
// })

// test('should be able to swap transform function', function (t) {
//   t.plan(1)
//   // make a new transform function that adds 1 to the zeroes
//   function newTransform (zeroStream) {
//     return zeroStream
//       .map((x) => x+1)
//   }
//   // swap it in
//   bit.swapTransform(newProducer)
//   // consumer should now be pushing 1s
//   outputEmitter.on('value', (v) => {
//     t.equal(v, 1)
//     outputEmitter.removeAllListeners('value')
//   })
// })

// test('should be able to swap consumer function', function (t) {
//   t.plan(1)
//   // make a new event emitter to test our consumer function
//   var newOutputEmitter = new EventEmitter()
//   // make a new consumer function that outputs over this emitter
//   function newConsumer (stream) {

//     function handle (x) { 
//       newOutputEmitter.emit(x, 'value')    
//     }

//     function taredown () {}

//     return {
//       handle: handle,
//       taredown: taredown,
//      }
//   } 
//   // swap it in
//   bit.swapConsumer(newConsumer)
//   // // we should
//   newOutputEmitter.on('value', (v) => {
//     t.equal(v, 1)
//     newOutputEmitter.removeAllListeners('value')
//   })
// })

// // TODO TESTS
// // test taredown fn in consumer
// // test that consumer can set stuff up


// // test input parsing =====================================

// // API conforming:
// // - consumer: return [,]...
// // - producer: returns stream
// // - consumer: returns function / object of functions
// // - swap...(): input is a function that passes the appropriate test, above
