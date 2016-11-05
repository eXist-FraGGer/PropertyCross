var express = require('express');

var bodyParser = require('body-parser');

var session = require('express-session');

var app = express();

var MongoClient = require('mongodb').MongoClient;

var HomeCtrl = require('./controllers/home');
var homeController;


//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(__dirname+'/public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.listen(8080, () => {
    console.log('server started')
    MongoClient.connect('mongodb://localhost:27017/PropertyCross', function(err, db) {
		homeController = new HomeCtrl(db);
		console.log('Connected successfully to server');
	})
});

app.get('/', (req, res) => {
	if (req.session.login) {
		res.cookie('login', req.session.login);
		res.sendFile(__dirname + '/public/index.html');
		//res.location('http://example.com');
		//res.status(200).redirect('./public/index.html');
	} else {
		res.sendFile(__dirname + '/public/login.html');
		//res.status(200).redirect('/login');
	}
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

app.post('/login', (req, res) => {
	homeController.login(req.body)
	.then(data => { 
		if (data) {
			req.session.login = data;
			res.send({redirect:'/'});
		} else {
			res.status(200).redirect('/login');
		}
	})
	.catch(error => { 
		console.log(error);
		res.send(error); 
	});
});

app.get('/logout', (req, res) => {
	req.session.login = "";
	res.status(200).redirect('/');
	console.log('logout');
});

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
});