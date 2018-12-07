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
							
app.get('/summary', (req, res) => 
		wx.wxSummary(req.query.lat, req.query.lon, function(err, summary) {
			if (err) {
				res.send({err: err});
			}
			else {
				res.send({err: null,
						data: summary
						});
			}}))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
