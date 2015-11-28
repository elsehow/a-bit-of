function process (oneStream) {

  return [
    oneStream.map(x => x*2)
  ]

}

module.exports = process
