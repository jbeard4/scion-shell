#!/usr/bin/env node

var scion = require('scion');

function printUsage(){
    console.log('Usage: node scion-shell path/to/file.scxml');
}

var pathToScxml = process.argv[2];
if(!pathToScxml){
    printUsage();
    process.exit(1);
}

//initialize the scxml file
scion.pathToModel(pathToScxml,function(err,model){
    if(err) throw err;

    //TODO: register event listeners
    var scxml = new scion.SCXML(model);

    scxml.registerListener({
        onEntry : function(stateId){
            console.log('Entered',stateId);
        },
        onExit : function(stateId){
            console.log('Exited',stateId);
        }
    }); 

    scxml.start();  //call start

    var DataBuffer = require('./DataBuffer');

    var dataBuffer = new DataBuffer({ stream : process.stdin });

    dataBuffer.on('data',function(line){
        //try to parse as JSON. Otherwise just use event.
        try {
            var event = JSON.parse(line);
        }catch(e){
            event = line;
        }

        scxml.gen(event);   //pass it into the SCXML file
        
    });

    process.stdin.resume();
});
