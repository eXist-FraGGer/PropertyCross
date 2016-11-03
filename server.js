var express = require('express');

var bodyParser = require('body-parser');

var app = express();

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

var homeController = require('./controllers/home');

app.listen(8080, () => {
    console.log('server started')
});

app.get('/', (req, res) => {
	res.sendfile('index.html');
	/*homeController.queryEx(req.query)
    .then(data => { res.json(data); })
    .catch(error => { res.send(error); });
    */
});

app.post('/location', (req, res) => {
	//res.set('Access-Control-Allow-Origin', '*');
	homeController.findByLocation(req.body)
	.then(data => { res.json(data); })
	.catch(error => { res.send(error); });
});

app.get('/test/:id', (req, res) => {
    homeController.test(req.params);
    res.send('ololo');
});

app.post('/find', (req, res) => {
	homeController.findByName(req.body)
	.then(data => { res.send(data); })
	.catch(error => { res.send(error); });
});