// Tests and utilities

var darksky = require('./darksky');

const api_key = "b4d58ccf2c792a4a0588e1b31b0e7daf";

//lat lon of Concord, MA

var concord = {'lat': '42.460372', 
				'lon': '-71.348948'};
				
var old_time = "2017-11-11T11:59:00";



function wx()
{
	var client = new darksky.Client(api_key);
	client.time_machine(concord.lat, concord.lon, old_time,
		function(err, data) {
			if (err) {
				console.error(err);
			}
			process.stdout.write(data);
		}
);}

exports.wx = wx;


