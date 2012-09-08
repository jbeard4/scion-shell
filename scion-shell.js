var scion = require('scion');

var pathToScxml = process.argv[2];

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

    dataBuffer.on('data',function(event){
        //assume an event
        scxml.gen(event);   //pass it into the SCXML file
    });

    process.stdin.resume();
});
