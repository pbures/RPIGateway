/*
 * Useful vim commands to use so I don't forget:
 * :JSHint
 * :NERDTree
 * :TernRefs
 * :C-x C-o (intellisense)
 */
require('console-stamp')(console, '[HH:MM:ss.l]');

var RFM69 = require('rfm69');
var AtsConnector = require('./ats-connector');
var EventEmitter = require('events').EventEmitter;

var conn = new AtsConnector('pavelbures_zY3Qr1Q1', 'pE0hZFbB');

console.log("Starting the rfm69");

var config = {
    frequency: '868',
    //encryptionKey: "neverG1v3UpOhYes",
    highPower: true,
    nodeAddress: 5,
    broadcastAddress: 1,
    verbose: false,
    config: 'lowPowerLab',

    /* This does not have any effect? I had to modify in lowPowerLab.js anyways. */
    registers: {
        0x30: 1,                       //Network ID.
        0x37: parseInt('10010010', 2), //Var.packet, CRCon, NodeId filtering.
    }
};

var rfm69 = new RFM69(config);
var eventEmitter = new EventEmitter();

rfm69.emitter = eventEmitter;

rfm69.onReady = function() {
    console.log("Module initialized.\n");
    rfm69.listen();
};

rfm69.onMessage = function(buffer) {
    //console.log('received message :[' + buffer.message.toString() + ']');
    //console.log('received message :' + JSON.stringify(buffer));
    rfm69.sendAck(function(err, data){
   	if(err) {
	       console.log("Error sending ACK.");
	}		
    });
    this.emitter.emit('message', buffer);
    //console.log("MSG: " + buffer.message.toString());
};

rfm69.initialize();

process.on('SIGINT', function() {
    rfm69.close();
    process.exit();
});

eventEmitter.on('message', function(buffer){

    console.log("Msg: [" + buffer.message.toString() + "]");
    var sensorDataJson = conn.parseMessage(buffer);

    if (sensorDataJson) {
	console.log("sendUpdate(...)");
        conn.sendUpdate(sensorDataJson, function(err, res, body) {
            if(err) {
                console.log("Error sending update.");
            }
            if (res && res.statusCode) {
                console.log("Udated with result: " + res.statusCode);
            }
        });
    }
});
