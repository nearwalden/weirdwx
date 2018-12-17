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
  // track how many calls were made
  this.calls = 0;
}

Client.prototype.call = function(options, callback)
{
  // Support function to run an HTTPS query against the API
  //
  // @param {Object) options The options to pass to https.request
  // @param {Function} [callback] The optional callback for the result data
  // @param {Function} [error] The optional callback for error results
  this.calls += 1;
  console.log(options.path);
  var req = https.request(options, function(res) {
    	console.log("status: ", res.statusCode);
    // console.log("headers: ", res.headers);
        var output = '';
        // console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');
        
        res.on('error', function (e) {
        	console.log("Error = " + e);
        	callback(e);
        });

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            callback(null, obj);
        });
  });

  req.end();
}

Client.prototype.makeQuery = function(args)
{
  var query_str = "?";
  var first = true;

  for (p in args) {
  	if (first == false) {
  		query_str += "&";
  	};
  	first = false;
    query_str += p + "=" + args[p];
  };
  
  return query_str;
}


Client.prototype.forecast = function(latitude, longitude, opts, callback)
{
  // Fetch the forecast for a given latitutde and longitude in decimal
  // degrees
  // Same as above, except opts are expanded out into the URL as options
  
  var opts_str = "";
  var first = true;

  for (p in opts) {
  	if (first == false) {
  		opts_str += "&";
  	};
  	first = false;
    opts_str += p + "=" + opts[p];
  };


  var options = {
    host: 'api.darksky.net',
    port: 443,
    path : '/forecast/'+this.api_key+'/'+latitude+','+longitude+'?' + opts_str ,
    method : 'GET'

  };

  this.call(options, callback);
};

Client.prototype.forecastV3 = function(latitude, longitude, opts, callback)
{
  // Fetch the forecast for a given latitutde and longitude in decimal
  // degrees
  // Same as above, except opts are expanded out into the URL as options
  
  var query = opts;
  query['loc'] = latitude.toString() + ',' + longitude.toString();
  query['k'] = this.api_key;
  query['units'] = 'us';
  query['lang'] = 'en';
  
  var options = {
    host: 'api-v3.darksky.net',
    port: 443,
    path : '/v3/forecast.json'+ this.makeQuery(query),
    method : 'GET'

  };

  this.call(options, callback);
};




Client.prototype.time_machine = function(latitude, longitude, time, opts, callback)
{
  // Time machine call with darksky API options

  var opts_str = "";
  var first = true;

  for (p in opts) {
  	if (first == false) {
  		opts_str += "&";
  	};
    opts_str += p + "=" + opts[p];
  };

  var options = {
    host: 'api.darksky.net',
    port: 443,
    path : '/forecast/'+this.api_key+'/'+latitude+','+longitude+','+time+'?'+opts_str ,
    method : 'GET'
  };
  // console.log(options.path);

  this.call(options, callback);
};

Client.prototype.daysV3 = function(latitude, longitude, date, opts, callback)
{
  // Time machine call with darksky API options
  var query = opts;
  query['loc'] = latitude.toString() + ',' + longitude.toString();
  query['k'] = this.api_key;
  query['units'] = 'us';
  query['lang'] = 'en';
  query['time'] = date;

  var options = {
    host: 'api-v3.darksky.net',
    port: 443,
    path : '/v3/days.json'+ this.makeQuery(query),
    method : 'GET'
  };
  // console.log(options.path);

  this.call(options, callback);
};


exports.Client = Client;