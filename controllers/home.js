var request = require('superagent');

var userSrvc = require('../services/user');
var userService;

var HomeCtrl = function(db) {
	userService = new userSrvc(db);
	return {
		findByLocation: data => {
			console.log("params in query for GET request 'location'", data);
			return new Promise(function(resolve, reject) {
				request
					.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&centre_point=' + data.centre_point)
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
					.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name=' + data.name)
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
			return userService.getByNameAndPassword(data);
		},
		createProfile: data => {
			return userService.create(data);
		},
		getUserById: id => {
			return userService.getById(data);
		},
		getUserByName: name => {
			return userService.getByName(name);
		},
		setAvatar: name => {
			return userService.setImage(name);
		},
		loginWithGoogle: data => {
			return new Promise(function(resolve, reject) {
				userService.getByGoogle(data)
					.then(user => {
						if (user) {
							resolve(user);
						} else {
							if (data.emails.length > 0 && data.id)
								resolve(userService.create({
									'username': data.emails[0].value,
									'password': data.emails[0].value,
									'google': data.id
								}));
							else {
								reject('No corrected data');
							}
						}
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		addGoogleAcc: data => {
			console.log('addGoogleAcc', data);
			return new Promise(function(resolve, reject) {
				userService.isFreeGoogle(data.id)
					.then(user => {
						if (!user) {
							resolve(userService.addGoogle(data));
						} else {
							reject('Google accaunt used!');
						}
					})
					.catch(error => {
						reject(error);
					});
			});
		},

		loginWithFacebook: data => {
			return new Promise(function(resolve, reject) {
				userService.getByFacebook(data)
					.then(user => {
						if (user) {
							resolve(user);
						} else {
							resolve(userService.create({
								'username': data.last_name,
								'password': data.last_name,
								'facebook': data.id
							}));
						}
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		addFacebookAcc: data => {
			console.log('addFacebookAcc', data);
			return new Promise(function(resolve, reject) {
				userService.isFreeFacebook(data.id)
					.then(user => {
						if (!user) {
							resolve(userService.addFacebook(data));
						} else {
							reject('Facebook accaunt used!');
						}
					})
					.catch(error => {
						reject(error);
					});
			});
		}
	}
}

module.exports = HomeCtrl;