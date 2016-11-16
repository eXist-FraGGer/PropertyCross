var express = require('express'),
	MongoClient = require('mongodb').MongoClient,
	mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/PropertyCross');

var HomeCtrl = require('./controllers/home');
var homeController;

var app = express();

app.listen(8080, () => {
	console.log('server started');
	MongoClient.connect('mongodb://localhost:27017/PropertyCross', function(err, db) {
		console.log('Connected successfully to server');
		homeController = new HomeCtrl(db);
		require('./boot/index')(app, homeController);
		require('./routes/index')(app, homeController);
	})
});