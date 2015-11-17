module.exports = function (oneStream, twoStream) {

  function timesTwo (x) { return x*2 }
 
  function plus (a, b) { return a+b } 

  var fours = oneStream
    .map(timesTwo)
    .combine(twoStream.map(Number), plus)

  fours.log()

  return fours

}
