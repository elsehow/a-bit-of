
next steps
------------
. . . .
- publish!
- integrate erroring into electron-playing
- show multi-stream hotswapping is ok

weird thing
------------
- is `update` really the right word?
i call new Origin(fn) and origin.update(fn)
to do basically the same thing......
in fact i sub-call update() everwhere
i should make a new one () like this and then just
updateFn(f) whenever i have fn!!!!!!!!!!!!!!!


future play
------------
- deeper levels of heirarchy
- more complex graphs
- should ALL the return values be streams? (functions, etc..?) (api doesnt check that they are - we can exploit this!)








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

