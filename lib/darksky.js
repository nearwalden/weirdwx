// Darksky code
// originally forked from https://github.com/awestendorf/node-darksky
// lots of changes required to make it work.

var https = require('https');

function Client(api_key)
{
  // Creates a new Dark Sky client with a given API key
  //
  // The key can be acquired by contacting Dark Sky http://darkskyapp.com/
  //
  // @constructor
  // @param {String} api_key The API key
  this.api_key = api_key;
}

Client.prototype.call = function(options, callback)
{
  // Support function to run an HTTPS query against the API
  //
  // @param {Object) options The options to pass to https.request
  // @param {Function} [callback] The optional callback for the result data
  // @param {Function} [error] The optional callback for error results
  
  var req = https.request(options, function(res) {
    // console.log("status: ", res.statusCode);
    // console.log("headers: ", res.headers);
    if( callback ) {
      res.on('data', function(d) {
        callback(null, d);
      });
    }
  });
  
  if( callback ) {
    req.on('error', function(e) {
      callback(e);
    });
  }

  req.end();
};

Client.prototype.forecast = function(latitude, longitude, callback)
{
  // Fetch the forecast for a given latitutde and longitude in decimal
  // degrees
  // http://darkskyapp.com/api/forecast.html
  //
  // @param {String|Number} latitude The latitude of the forecast position
  // @param {String|Number} longitude The longitude of the forecast position
  // @param {Function} [callback] The optional callback function to process the result
  // @param {Function} [error] The optional callback function to process errors

  var options = {
    host: 'api.darksky.net',
    port: 443,
    path : '/forecast/'+this.api_key+'/'+latitude+','+longitude ,
    method : 'GET'
  };

  this.call(options, callback);
};

Client.prototype.time_machine = function(latitude, longitude, time, callback)
{
  // Fetch the forecast for the past for a given latitutde and longitude in decimal
  // degrees
  // Either be a UNIX time (that is, seconds since midnight GMT on 1 Jan 1970) 
  //    or a string formatted as follows: [YYYY]-[MM]-[DD]T[HH]:[MM]:[SS][timezone]. 
  //    timezone should either be omitted (to refer to local time for the location 
  //    being requested), Z (referring to GMT time), or +[HH][MM] or -[HH][MM] 
  //    for an offset from GMT in hours and minutes. The timezone is only used 
  //    for determining the time of the request; the response will always be relative 
  //    to the local time zone.

  // http://darkskyapp.com/api/forecast.html
  //
  // @param {String|Number} latitude The latitude of the forecast position
  // @param {String|Number} longitude The longitude of the forecast position
  // @param {String} time for the request
  // @param {Function} [callback] The optional callback function to process the result
  // @param {Function} [error] The optional callback function to process errors

  var options = {
    host: 'api.darksky.net',
    port: 443,
    path : '/forecast/'+this.api_key+'/'+latitude+','+longitude+','+time ,
    method : 'GET'
  };

  this.call(options, callback);
};


Client.prototype.precipitation = function(points, callback)
{
  // Fetch forecasts for multiple points and times. Points should be an
  // array containing triplets of [latitude, longitute, time], where
  // latitude and longitude are in decimal degrees, and time is a UNIX
  // GMT timestamp
  // http://darkskyapp.com/api/precipitation.html
  //
  // @param {Array[]} - a list of [LAT,LON,TIME] to look up the forecast for
  // @param {Function} [callback] The optional callback function to process the result
  // @param {Function} [error] The optional callback function to process errors

  points = points.map(function(point) {
    return point.join(',');
  });

  var options = {
    host: 'api.darksky.net',
    port: 443,
    path : '/precipitation/'+this.api_key+'/'+points.join(';') ,
    method : 'GET'
  };

  this.call(options, callback);
};

Client.prototype.fifty_years(latitude, longitude, callback)
{
	// Fetches time machine for this the last 50 years for this day
	// returns a string.  
	// @param {String|Number} latitude The latitude of the forecast position
  	// @param {String|Number} longitude The longitude of the forecast position
  	//
  	// get current date
	date = new Date();
} 	

exports.Client = Client;