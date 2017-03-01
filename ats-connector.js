var request = require('request');

function AtsConnector(clientId, clientKey){

	this._headers = {
		'Auth-ClientId' : clientId,
		'Auth-ClientKey' : clientKey,
		'Content-Type' : 'application/json'
	};

	this._sensors = {
        7: {
		    temperature: 'jdJCtJrZK7IakZIPSIC2ro3c',
		    humidity: 'sBVXMTrrPKhig2X3pOMjQ4iz',
		    batteryPct: 'Y2Q2t4Xbk65nKX6jcgo4eejw'
	    }
    };

	this._url = 'https://api.allthingstalk.io/';
}

/*
 * The message is expected in a form of: "ID[15] T[22.5] H[56.33]".
 */
AtsConnector.prototype.parseMessage = function(buffer) {

    var message = buffer.message.toString();
    var senderId = buffer.senderId;

	var re  = /T\[(\+\d+\.?\d*)\] H\[(\+\d+\.?\d*)\] B\[(\d+)\]/;
	var arr = re.exec(message);
	var data = {};

	if (arr) {
		return {
			id:senderId,
			temperature:parseFloat(arr[1]),
			humidity:parseFloat(arr[2]),
			batteryPct:parseInt(arr[3],10)
		};
	}  else {
			return undefined;
	}
};

/* 
 * The data in form of {temperature: number, humidity: number}
 * callback is function(err, res, body).
 */
AtsConnector.prototype.sendUpdate = function(data, callback) {
    if (!data) {
            return undefined;
    }
	
    var sensorAssets = this._sensors[data.id];
    if (!sensorAssets) {
            return undefined;
    }

	for(var metric in sensorAssets) {
	    if(data[metric]) {	

			var req = {
				url: this._url + "asset/" + sensorAssets[metric] + "/state",
				method: 'PUT',
				headers: this._headers,
				json: {
					"value": data[metric]
				}
			};

			request(req, callback);
		}
	}
};

module.exports = AtsConnector;
