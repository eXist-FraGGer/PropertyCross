var express = require('express');

var bodyParser = require('body-parser');

// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();

var homeController = require('./controllers/home');

app.listen(8080, () => {
    console.log('server started')
});

app.get('/', (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
    homeController.queryEx(req.query)
    .then(data => { res.json(data); })
    .catch((error) => { res.send(error); });
});

app.post('/location', urlencodedParser, (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	homeController.getMyLocation(req.body)
	.then(data => { res.json(data); })
	.catch((error) => { res.send(error); });
});

app.get('/test/:id', (req, res) => {
    homeController.test(req.params);
    res.send('ololo');
});

app.post('/test1', urlencodedParser, (req, res) => {
    homeController.postEx(req.body);
    res.json({ a: 'ololo' });
});