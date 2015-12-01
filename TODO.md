
next steps
- rent check
- finish off endpoint spec 
- integration test with multiple streams

try it in a contrived electron app
- see if the outputs updating really works well






rethink erroring and validation
- should validate *all* user input 
- but how do errors occur, mechanically?
- what happens when components have no function?

more complex graphs?








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

