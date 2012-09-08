//TODO: extend EventEmitter. use utils, inherit...

var EventEmitter = require('events').EventEmitter;

function DataBuffer(kwArgs){
    this.stream = kwArgs.stream;
    this.delimiter = kwArgs.delimiter || '\n';

    this._buffer = '';

    //set up the stream
    this.stream.on('data',this._handleData.bind(this));
    this.stream.on('end',this._handleEnd.bind(this));
}

//TODO: how do we use the property descriptor thing?
DataBuffer.prototype = Object.create(EventEmitter.prototype);

DataBuffer.prototype._handleData = function(s){
    this._buffer += s;

    var events = this._buffer.split(this.delimiter); 
    this._buffer = events[events.length-1];  

    var completeEvents = events.slice(0,-1);
    completeEvents.forEach(this.emit.bind(this,'data')); 
};

DataBuffer.prototype._handleEnd = function(s){
    this.emit('end');
};

module.exports = DataBuffer;
