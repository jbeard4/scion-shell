#!/usr/bin/env node

var scion = require('scion'),
    nopt = require("nopt");

//parse opts
var knownOpts = { 
    "event-format" : ["json","string","auto"],
    "log-state-entry" : Boolean,
    "log-state-exit" : Boolean,
    "graphical-trace" : String,
    "event-delimiter" : String,
    "help" : Boolean
};

var parsed = nopt(knownOpts);

function printUsage(){
    console.log(require('fs').readFileSync('usage.txt','utf8'));
}

var pathToScxml = parsed.argv && parsed.argv.remain[0];
if(!pathToScxml || parsed['help']){
    printUsage();
    process.exit(1);
}

var sockets = [];

function startTraceServer(scxml){
    var app = require('http').createServer(handler),
        io = require('socket.io').listen(app,{log : false}),
        sttic = require('node-static'),
        path = require('path'),
        fs = require('fs');

    app.listen(parsed["graphical-trace"]);

    var file = new sttic.Server(path.join(__dirname,'content'));

    function handler (request, response) {
        if(request.url === '/scxml'){
            fs.readFile(pathToScxml,function(err,s){
                response.writeHead(200,{'Content-Type' : 'application/xml'});
                response.end(s);
            });
        }else if(request.url === '/configuration'){
            response.writeHead(200,{'Content-Type' : 'application/json'});
            response.end(JSON.stringify(scxml.getFullConfiguration()));
        }else{
            file.serve(request, response);
        }
    }

    io.sockets.on('connection', function (socket) {
        sockets.push(socket);
    });

    io.sockets.on('disconnect', function (socket) {
        sockets.splice(sockets.indexOf(socket),1);
    });
}

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

        startTraceServer(scxml);

        scxml.registerListener({
            onEntry : function(stateId){
                sockets.forEach(function(socket){socket.emit('onEntry', stateId);});
            },
            onExit : function(stateId){
                sockets.forEach(function(socket){socket.emit('onExit', stateId);});
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
