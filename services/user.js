var User = require('../models/user');

var UserSrvc = function(db) {
	return {
		create: data => {
			return new Promise(function(resolve, reject) {
				var newUser = new User;
				newUser.username = data.username || 'NewUser';
				newUser.password = data.password || 'NewUser';
				newUser.image = "";
				newUser.accounts = [];
				if (data.google) {
					newUser.accounts.push({
						'google': data.google || ''
					});
				}
				if (data.facebook) {
					newUser.accounts.push({
						'facebook': data.facebook || ''
					});
				}
				newUser.save(function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		setImage: name => {
			return new Promise(function(resolve, reject) {
				User.update({
					username: name || ''
				}, {
					image: 'ava-' + name + '.jpg'
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		getByName: name => {
			return new Promise(function(resolve, reject) {
				User.findOne({
						username: name || ''
					},
					function(err, user) {
						if (err) reject(err);
						resolve(user);
					});
			});
		},
		getById: id => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					_id: id || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		getByNameAndPassword: (data) => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					'username': data.username || '',
					'password': data.password || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		getByGoogle: data => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					'accounts.google': data.id || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		addGoogle: data => {
			console.log('UserSrvc addGoogle', data);
			return new Promise(function(resolve, reject) {
				User.findOne({
					'username': data.username,
					'accounts.google': '{$exists: false}'
				}, function(err, user) {
					if (err) reject(err);
					if (!user) reject(user);
					else {
						console.log(user);
						user.accounts.push({
							'google': data.id
						});
						user.save(function(err, user) {
							if (err) reject(err);
							resolve(user);
						});
					}
				});
			});
		},
		isFreeGoogle: data => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					'accounts.google': data || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},

		getByFacebook: data => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					'accounts.facebook': data.id || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		},
		addFacebook: data => {
			console.log('UserSrvc addFacebook', data);
			return new Promise(function(resolve, reject) {
				User.findOne({
					'username': data.username,
					'accounts.facebook': '{$exists: false}'
				}, function(err, user) {
					if (err) reject(err);
					if (!user) reject(user);
					else {
						user.accounts.push({
							'facebook': data.id
						});
						user.save(function(err, user) {
							if (err) reject(err);
							resolve(user);
						});
					}
				});
			});
		},
		isFreeFacebook: data => {
			return new Promise(function(resolve, reject) {
				User.findOne({
					'accounts.facebook': data || ''
				}, function(err, user) {
					if (err) reject(err);
					resolve(user);
				});
			});
		}
	}
}


module.exports = UserSrvc;