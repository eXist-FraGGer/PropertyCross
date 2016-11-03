var request = require('superagent');

module.exports = {

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
	getMyLocation: data => {
		console.log("params in query for GET request 'location'", data);
		return new Promise(function(resolve, reject) {
			request
			.get('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&centre_point='+data.center)
			.set('Content-Type', 'application/json')
		    .set('Accept', 'application/json')
			.end(function(err, res) {
				if (err) {
					reject(err);
				} else {
					var location = res.body.response.locations;
					resolve(location);
				}
			});
		});
	},
	postEx: data => {
		console.log('params in body for POST request', data);
	}
}