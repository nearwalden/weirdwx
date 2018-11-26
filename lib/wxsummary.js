// gets a bunch of wx data and analyzes it

const darksky = require('./darksky.js');

const api_key = "b4d58ccf2c792a4a0588e1b31b0e7daf";

//lat lon of Concord, MA

const concord = {'lat': '42.460372', 
				'lon': '-71.348948'};
				
const old_time = "2017-11-11T11:59:00";

const years = 5;

function get_summary (callback)
{
	var client = new darksky.Client(api_key);
	var opts = {lat: concord.lat, 
				lon: concord.lon,
				date:  new Date()};
	var res = {};
	client.forecast(opts.lat, opts.lon, function (err, data) 
		{
			if (err) {
				callback(err, data);
			}
			else {
				res['current'] = parse_current(data);
				collect_historical(1, opts, res, callback);
		});
}

function parse_current (current)
{
	var out = {};
	out.temperature = current.currently.temperature;
	for (var field in ['temperatureHigh', 'tempartureLow', 'precipProbability', 
						'precipType']) {
		out[field] = current.daily[field];
		}
	return out
	
}

function parse_historical (hist)
{
}

function collect_historical (count, opts, res, data, callback) 
{
	var 
}

exports.get_summary = get_summary;
