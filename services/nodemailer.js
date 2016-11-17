var nodemailer = require('nodemailer'),
	config = require('../oauth.js'),
	crypto = require('crypto'),
	redis = require('redis');

var users = redis.createClient(),
	tokens = redis.createClient();

var transporter = nodemailer.createTransport('smtps://' + config.gmail.user + '%40gmail.com:' + config.gmail.pass + '@smtp.gmail.com');

function NodeMailerSrvc() {
	transporter.verify(function(error, success) {
		if (error) {
			console.log(error);
		} else {
			console.log('Server is ready to take our messages');
		}
	});

	var addUser = (username, refreshToken) => {
		var user = {
			username: username,
			refreshToken: refreshToken || crypto.randomBytes(10).toString('base64')
		};

		users.set(username, JSON.stringify(user), redis.print);
		tokens.set(user.refreshToken, username, redis.print);
		tokens.expire(user.refreshToken, 60 * 60 * 24);

		return generateAccessToken(user.refreshToken);
	};

	var generateAccessToken = (refreshToken) => {
		return new Promise(function(resolve, reject) {
			var username;
			tokens.get(refreshToken, function(err, reply) {
				username = reply;
				var accessToken = crypto.randomBytes(10).toString('base64');

				if (!username) {
					reject({
						error: 'Invalid refresh token'
					});
				}
				tokens.get(username, function(err, reply) {
					var user = JSON.parse(reply);
					user.accessToken = accessToken;
					users.set(username, JSON.stringify(user), redis.print);
					users.expire(username, 60 * 60 * 24);
				});
				resolve({
					access_token: accessToken
				});
			});
		});
	};
	return {
		validateAccessToken: (username, accessToken) => {
			return new Promise(function(resolve, reject) {
				tokens.get(username, function(err, reply) {
					if (err) reject(err);
					if (!reply) reject(false);
					else {
						var user = JSON.parse(reply);
						if (user.accessToken !== accessToken) reject(false);
						else resolve(true);
					}
				});
			});
		},
		sendVerifyMsg: (options) => {
			return new Promise(function(resolve, reject) {
				addUser(options.to)
					.then(data => {
						// setup e-mail data with unicode symbols 
						var mailOptions = {
							from: '"Property Cross 👥" <' + config.gmail.mail + '>',
							to: options.to || '',
							subject: 'Verify Account ✔',
							text: options.text || 'Verify Account 🐴',
							html: '<b>Verify Account 🐴</b><p><a href="http://localhost:8080/activated/' + data.access_token + '/' + options.to + '">Activated accaunt</a></p>'
						};
						transporter.verify(function(error, success) {
							if (error) reject(error);
							else
								transporter.sendMail(mailOptions, function(error, info) {
									if (error) reject(error);
									else
										resolve('Message sendet!');
								});
						});
					})
					.catch(error => {
						console.log(error);
					});
			});
		}
	}
};

module.exports = NodeMailerSrvc;