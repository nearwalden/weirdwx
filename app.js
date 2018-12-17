// the main application

const express = require('express')
const wx = require('./lib/wxsummary.js')

const app = express()
const port = 9000

// static files from the public folder

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/simple', (req, res) => 
		res.send({lat: req.query.lat,
							lon: req.query.lon}))
							
app.get('/summary', (req, res) => {
	var startTime = new Date();
	wx.wxSummary(req.query.lat, req.query.lon, function(err, summary) {
		if (err) {
			res.send({err: err});
		}
		else {
			var endTime = new Date();
			summary['elapsed_time'] = endTime.getTime() - startTime.getTime();
			res.send({err: null,
					data: summary
					});
		}})
	})

app.listen(port, () => console.log(`Weather Explorer on port ${port}!`))
