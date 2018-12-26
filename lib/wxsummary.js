// gets a bunch of wx data and analyzes it

const darksky = require('./darksky.js');
const ss = require('simple-statistics');

const api_key = "b4d58ccf2c792a4a0588e1b31b0e7daf";

//lat lon of Concord, MA

// const concord = {'lat': '42.460372', 
// 				'lon': '-71.348948'};
				
// const old_time = "2017-11-11T11:59:00";

const years = 40;

// should be v2, v3 or v3bulk
const darkskyVersion = "v3"



function wxSummary (lat, lon, callback)
{
	var client = new darksky.Client(api_key);
	var opts = {lat: lat, 
				lon: lon,
				date:  new Date()};
	var res = {current: {},
				hist: initHist()};
	forecast(client, opts.lat, opts.lon, function (err, data) 
		{
			if (err) {
				callback(err, data);
			}
			else {
				//process.stdout.write(JSON.stringify(data, null, 2));
				res['current'] = parseCurrent(data);
				//process.stdout.write(JSON.stringify(res, null, 2));
				collectHistorical(client, opts, res, callback);
			}
		});
}

//
// Forecast
//

const forecastOptsV2 = {exclude: "minutely,hourly,alerts,flags"};

// makes different calls based on version

function forecast (client, lat, lon, callback)
{
	if (darkskyVersion == "v2") {
		client.forecast(lat, lon, forecastOptsV2, callback);
			}
	else {
		client.forecastV3 (lat, lon, {}, callback);
		}
}

function parseCurrent (data) {
	if (darkskyVersion == "v2") {
		return parseCurrentV2 (data);
		}
	else {
		return parseCurrentV3 (data);
		}
}
	
const forecastFields = ['temperatureHigh', 'temperatureLow', 'precipProbability', 
						'precipIntensity', 'precipType'];

function parseCurrentV2 (current)
{
	var out = {};
	out.temperature = current.currently.temperature;
	//console.log(current.daily.data[0]);
	for (var i=0; i<forecastFields.length; i++ ) {
		field = forecastFields[i];
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

//
// Historical
// 

function initHist () {
	if (darkskyVersion == "v2") {
		var fields = histFieldsV2;
		}
	else {
		var fields = histFieldsV3;
		}
	init = {}
	for (var i=0; i < fields.length; i++) {
		field = fields[i];
		init[field]= [];
		}
	return init
}



function collectHistorical (client, opts, res, callback) 
{
	if (darkskyVersion == "v2") {
		collectHistoricalV2 (client, 0, opts, res, callback);
			}
	else if (darkskyVersion == "v3bulk") {
		collectHistoricalV3Bulk (client, opts, res, callback);
			}
	else {
		collectHistoricalV3 (client, 0, opts, res, callback);
		}
}

//
// V2
// 

const histOptsV2 = {exclude: "currently,minutely,hourly,alerts,flags"};


const histFieldsV2 = ['temperatureHigh', 'temperatureLow', 'precipAccumulation', 
					'precipIntensity', 'precipType', 'precipProbability'];
					

function collectHistoricalV2 (client, count, opts, res, callback) {
	// subtract one extra since starting at 0
	var year = opts.date.getFullYear() - count - 1;
	// don't change the original
	var d2 = new Date(opts.date);
	d2.setFullYear(year);
	unixTime = d2.getTime()/1000|0;
	// console.log("Processing year" + count+1);
	client.time_machine(opts.lat, opts.lon, unixTime, 
							histOptsV2, function (err, data)
		{
			if (err) {
				callback(err, data);
			}
			else {
				for (var i=0; i < histFieldsV2.length; i++) {
					field = histFieldsV2[i];
					res.hist[field][count] = data.daily.data[0][field];
				}
				count += 1;
				if (count == years) {
					summarizeV2(res, callback);
				}
				else {
					collectHistoricalV2 (client, count, opts, res, callback);
				}
			}
		});	
			
}


function summarizeV2 (res, callback) 
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

// V3

const histOptsV3 = {};

const histFieldsV3 = ['max_temperature_f', 'min_temperature_f', 'precipitation_in', 
					'snow_depth_in', 'precipitation_type', 'precipitation_probability'];

function collectHistoricalV3 (client, count, opts, res, callback) {
	// subtract one extra since starting at 0
	var year = opts.date.getFullYear() - count - 1;
	// don't change the original
	var d2 = new Date(opts.date);
	d2.setFullYear(year);
	var day = [d2.toISOString().split("T")[0]];
	// loc
	var loc = [{lat: opts.lat, lon: opts.lon}]
	// console.log("Processing year" + count+1);
	client.daysV3(loc, day, histOptsV3, function (err, data)
		{
			if (err) {
				callback(err, data);
			}
			else {
				for (var i=0; i < histFieldsV3.length; i++) {
					field = histFieldsV3[i];
					res.hist[field][count] = data.data[0].day[field];
				}
				count += 1;
				if (count == years) {
					summarizeV3(res, callback);
				}
				else {
					collectHistoricalV3 (client, count, opts, res, callback);
				}
			}
		});	
			
}

				
function summarizeV3 (res, callback) 
{
	summary = {current:  res.current,
				maxHigh:  ss.max(res.hist.max_temperature_f),
				maxLow:  ss.max(res.hist.min_temperature_f),
				minHigh:  ss.min(res.hist.max_temperature_f),
				minLow:  ss.min(res.hist.min_temperature_f),
				meanHigh:  ss.mean(res.hist.max_temperature_f),
				meanLow:  ss.mean(res.hist.min_temperature_f)
				};
	callback(null, summary);
}

// V3 Bulk

const histOptsV3Bulk= {};

function collectHistoricalV3Bulk (client, opts, res, callback) {
	// subtract one extra since starting at 0
	var year = opts.date.getFullYear() - count - 1;
	// don't change the original
	var d2 = new Date(opts.date);
	d2.setFullYear(year);
	day = d2.toISOString().split("T")[0];
	// loc
	var loc = [{lat: opts.lat, lon: opts.lon}]
	// console.log("Processing year" + count+1);
	client.daysV3(loc, days, histOptsV3, function (err, data)
		{
			if (err) {
				callback(err, data);
			}
			else {
				for (var i=0; i < histFieldsV3.length; i++) {
					field = histFieldsV3[i];
					res.hist[field][count] = data.data[0].day[field];
				}
				count += 1;
				if (count == years) {
					summarizeV3(res, callback);
				}
				else {
					collectHistoricalV3 (client, count, opts, res, callback);
				}
			}
		});	
			
}

				
function summarizeV3Bulk (res, callback) 
{
	summary = {current:  res.current,
				maxHigh:  ss.max(res.hist.max_temperature_f),
				maxLow:  ss.max(res.hist.min_temperature_f),
				minHigh:  ss.min(res.hist.max_temperature_f),
				minLow:  ss.min(res.hist.min_temperature_f),
				meanHigh:  ss.mean(res.hist.max_temperature_f),
				meanLow:  ss.mean(res.hist.min_temperature_f)
				};
	callback(null, summary);
}


exports.wxSummary = wxSummary;
