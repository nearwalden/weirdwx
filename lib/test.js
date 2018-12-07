// Tests and utilities

var darksky = require('./darksky');
var wxsummary = require('./wxsummary');

const api_key = "b4d58ccf2c792a4a0588e1b31b0e7daf";

//lat lon of Concord, MA

var concord = {'lat': '42.460372', 
				'lon': '-71.348948'};
				
var old_time = "2017-11-11T11:59:00";

var opts = {exclude: "minutely,hourly,daily,alerts,flags"};

function wx()
{
	var client = new darksky.Client(api_key);
	client.forecast(concord.lat, concord.lon, opts, 
		function(err, data) {
			if (err) {
				console.error(err);
			}
			// process.stdout.write(Object.prototype.toString.call(data));
			console.log(data);
		}
);}

function wxV3()
{
	var client = new darksky.Client(api_key);
	client.forecastV3(concord.lat, concord.lon, {}, 
		function(err, data) {
			if (err) {
				console.error(err);
			}
			// process.stdout.write(Object.prototype.toString.call(data));
			console.log(data);
		}
);}


function summary()
{
	wxsummary.get_summary (function(err, data) 
		{
			if (err) {
				console.error(err);
			}
			process.stdout.write(JSON.stringify(data, null, 2));
		}
);}


exports.wx = wx;
exports.wxV3 = wxV3;
exports.summary = summary;


