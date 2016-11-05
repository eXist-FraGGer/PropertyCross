var request = require('superagent');

var userSrvc = require('../services/user');
var userService = new userSrvc();

var HomeCtrl = function(db) {

	return {
		addName:data => {
			MongoClient.insert({Name: data.name});
		},
		test: data => {
			console.log('params in url', data);
		},
		queryEx: (data) => {
			console.log('params in query for GET request', data);
			
			return new Promise(function(resolve, reject) {
				request
				.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name=leeds')	
			    //.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name=newcr')
			    .set('Content-Type', 'application/json')
			    .set('Accept', 'application/json')
				.end(function(err, res) {
					if (err) {
						reject(err);
					} else {
						var listings = res.body.response.listings;
						resolve(listings);
					}
				});
			});
		},
		findByLocation: data => {
			console.log("params in query for GET request 'location'", data);
			return new Promise(function(resolve, reject) {
				request
				.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&centre_point='+data.centre_point)
				.set('Content-Type', 'application/json')
			    .set('Accept', 'application/json')
				.end(function(err, res) {
					if (err) {
						reject(err);
					} else {
						var listings = res.body.response.listings;
						resolve(listings);
					}
				});
			});
		},
		findByName: data => {
			console.log("params in body for POST request 'find'", data);
			return new Promise(function(resolve, reject) {
				request
				.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name='+data.name)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.end(function(err, res) {
					if (err) {
						reject(err);
					} else {
						var listings = res.body.response.listings;
						resolve(listings);
					}
				});
			});
		},
		login: data => {
			console.log("params in body for POST request 'login'", data);
			return new Promise(function(resolve, reject) {
				var user = db.collection('users').find({"login":data.login,"password":data.password});   
				user.count()
				.then(count => {
					if (count) {
						resolve(data.login);
					} else {
						reject(err);
					};
				});
			});
		}
	}
}

module.exports = HomeCtrl;