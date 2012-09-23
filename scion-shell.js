
var scion = require('scion'),
    graphicalDebugger = require('./appjs-graphical-debugger'),
    nopt = require("nopt");

//parse opts
var knownOpts = { 
    "event-format" : ["json","string","auto"],
    "log-state-entry" : Boolean,
    "log-state-exit" : Boolean,
    "graphical-trace" : Boolean,
    "event-delimiter" : String
};

var parsed = nopt(knownOpts);

function printUsage(){
    console.log(require('fs').readFileSync('usage.txt','utf8'));
}

var pathToScxml = parsed.argv && parsed.argv.remain[0];
if(!pathToScxml){
    printUsage();
    process.exit(1);
}

//optionally graphically render the document in a new window
if(parsed["graphical-trace"]){
    graphicalDebugger(pathToScxml,initModel);
}else{
    initModel(null);    //just go for it
}

function initModel(window){

    //initialize the scxml file
    scion.pathToModel(pathToScxml,function(err,model){
        if(err) throw err;

        var scxml = new scion.SCXML(model);

        //set up listener for console output
        if(parsed["log-state-entry"] || parsed["log-state-exit"]){
            scxml.registerListener({
                onEntry : function(stateId){
                    if(parsed["log-state-entry"]) console.log('Entered',stateId);
                },
                onExit : function(stateId){
                    if(parsed["log-state-exit"]) console.log('Exited',stateId);
                }
            }); 
        }

        //set up listener for graphical output
        if(parsed["graphical-trace"]){
            scxml.registerListener({
                onEntry : function(stateId){
                    window.d3.select('#' + stateId).classed('highlighted',true);
                },
                onExit : function(stateId){
                    window.d3.select('#' + stateId).classed('highlighted',false);
                }
            }); 
        }

        //set up data buffer to receive streamed events 
        var DataBuffer = require('./DataBuffer');

        var dataBuffer = new DataBuffer({ stream : process.stdin, delimiter : parsed["event-delimiter"] });

        
        //decide how we are going to handle data: as a string representing the event name, or as json, or either
        var handleDataFn;
        switch(parsed["event-format"]){
            case "json":
                handleDataFn = function(line){
                    try {
                        var event = JSON.parse(line);
                        scxml.gen(event); 
                    }catch(e){
                        console.error('Unable to parse input as JSON');
                        console.error(e);
                    }
                };
                break;
            case "string":
                handleDataFn = scxml.gen.bind(scxml);
                break;
            case "auto":
            default:
                handleDataFn = function(line){
                    //try to parse as JSON. Otherwise just use event.
                    try {
                        var event = JSON.parse(line);
                    }catch(e){
                        event = line;
                    }
                    scxml.gen(event);   //pass it into the SCXML file 
                };
                break;
        }

        dataBuffer.on('data',handleDataFn);

        scxml.start();  //call start
        process.stdin.resume();     //accept input from stdin
    });

}
