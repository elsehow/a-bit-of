refactor tests
- test.utils

integration tests
- test simple 3-layer
    * swap each function
- test multiple trasnforms between the layers
    * swap each function

refactor tests
- remove the integration-y unit tests....
- assure there's no overlap

refactor
- private/public methods
- get and set fns
- more dry

next steps
- rent check
- try it in a contrived electron app





rethink erroring and validation
- should validate *all* user input 
- but how do errors occur, mechanically?
- can they take no fn? (of course but what happens?)

more complex graphs?



var or = new Origin(neurosky)
var tr = new Transform(fft)
var en = new Endpoint(graph)
or.attach(tr).attach(en)

var or = new Origin(neurosky)
var tr1 = new Transform(fft)
var tr2 = new Transform(spikeDetection)
var en = new Endpoint(graph)
or.attach(tr1).attach(tr2).attach(en)





now how would a full dag work?
(we at least want multiple outputs)

well, agreed, but for now ill be thrillled if just 1 works
if i can plug this EXISTING toolkit into an electron app..
well, we're in some kind of business

if we want to do something elaborate later, well, we know we have legs to stand on







dag
1

origin.output(0).attach(transform1)
origin.output(0).attach(transform2)
transform1.ouput(0).attach(graph)
transform2.output(1).attach(graph)

dag
2

mindwave.output('raw').attach(trasnform1)
socket.output('events').attach(transform2)


dag
3

mindawve.output(0).attach(transform1)
mindawve.output(1).attach(transform1)

trasnform1.update(function (raws, esenses) {
    return [
        raws.combine(esenses, whateverFn)
    ]   
})

