/*
     Copyright 2012-2013 Jacob Beard

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

             http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
*/

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
