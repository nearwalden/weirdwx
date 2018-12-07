// gets a bunch of wx data and analyzes it

const darksky = require('./darksky.js');
const ss = require('simple-statistics');

const api_key = "b4d58ccf2c792a4a0588e1b31b0e7daf";

//lat lon of Concord, MA

// const concord = {'lat': '42.460372', 
// 				'lon': '-71.348948'};
				
// const old_time = "2017-11-11T11:59:00";

const years = 40;

const forecast_opts = {exclude: "minutely,hourly,alerts,flags"};
const hist_opts = {exclude: "currently,minutely,hourly,alerts,flags"};

const darksyVersion = "v2"


function wxSummary (lat, lon, callback)
{
	var client = new darksky.Client(api_key);
	var opts = {lat: lat, 
				lon: lon,
				date:  new Date()};
	var res = {current: {},
				hist: {}};
	res.hist = {
		temperatureLow: [],
		temperatureHigh: [],
		precipAccumulation: [],
		precipType: [],
		precipIntensity: [],
		precipProbability: []
		}
	client.forecastV3(opts.lat, opts.lon, forecast_opts, function (err, data) 
		{
			if (err) {
				callback(err, data);
			}
			else {
				//process.stdout.write(JSON.stringify(data, null, 2));
				res['current'] = parseCurrentV3(data);
				//process.stdout.write(JSON.stringify(res, null, 2));
				collect_historical(client, 0, opts, res, callback);
			}
		});
}

const forecast_fields = ['temperatureHigh', 'temperatureLow', 'precipProbability', 
						'precipIntensity', 'precipType'];

function parseCurrent (current)
{
	var out = {};
	out.temperature = current.currently.temperature;
	// console.log(current.daily.data[0]);
	for (var i=0; i<forecast_fields.length; i++ ) {
		field = forecast_fields[i];
		out[field] = current.daily.data[0][field];
		}
	return out
	
}

const forecastVersionMap = {temperatureHigh: 'max_temperature_f',
							temperatureLow:  'min_temperature_f',
							precipProbability:  'precipitation_probability',
							precipAmount:  'precipitation_in',
							precipType:  'precipitation_type'
							};
							
function parseCurrentV3 (current)
{
	var out = {};
	out.temperature = current.data[0].current.temperature_f;
	// console.log(current.daily.data[0]);
	for (field in forecastVersionMap) {
		out[field] = current.data[0].days.data[0][forecastVersionMap[field]];
		}
	return out
	
}

const hist_fields = ['temperatureHigh', 'temperatureLow', 'precipAccumulation', 
					'precipIntensity', 'precipType', 'precipProbability'];

function collect_historical (client, count, opts, res, callback) 
{
	// subtract one extra since starting at 0
	var year = opts.date.getFullYear() - count - 1;
	// don't change the original
	var d2 = new Date(opts.date);
	d2.setFullYear(year);
	unixTime = d2.getTime()/1000|0;
	// console.log("Processing year" + count+1);
	client.time_machine(opts.lat, opts.lon, unixTime, 
							hist_opts, function (err, data)
		{
			if (err) {
				callback(err, data);
			}
			else {
				for (var i=0; i < hist_fields.length; i++) {
					field = hist_fields[i];
					res.hist[field][count] = data.daily.data[0][field];
				}
				count += 1;
				if (count == years) {
					summarize(res, callback);
				}
				else {
					collect_historical(client, count, opts, res, callback);
				}
			}
		});	
			
}

function summarize (res, callback) 
{
	summary = {current:  res.current,
				maxHigh:  ss.max(res.hist.temperatureHigh),
				maxLow:  ss.max(res.hist.temperatureLow),
				minHigh:  ss.min(res.hist.temperatureHigh),
				minLow:  ss.min(res.hist.temperatureLow),
				meanHigh:  ss.mean(res.hist.temperatureHigh),
				meanLow:  ss.mean(res.hist.temperatureLow)
				};
	callback(null, summary);
}
				

exports.wxSummary = wxSummary;
