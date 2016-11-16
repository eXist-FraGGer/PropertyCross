var passport = require('passport'),
	config = require('../oauth.js'),
	AuthGoogleStrategy = require('passport-google-oauth2').Strategy,
	AuthFacebookStrategy = require('passport-facebook'),
	AuthLocalStrategy = require('passport-local').Strategy;

module.exports = (homeController) => {
	// serialize and deserialize
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	// config
	passport.use('google', new AuthGoogleStrategy({
			clientID: config.google.clientID,
			clientSecret: config.google.clientSecret,
			callbackURL: config.google.callbackURL,
			passReqToCallback: true
		},
		function(request, accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				if (request.isAuthenticated()) {
					homeController.addGoogleAcc({
							'username': request.session.login,
							'id': profile._json.id
						}).then(data => {
							return done(null, data);
						})
						.catch(data => {
							request.user.msg = data;
							request.session.msg = data;
							return done(null, request.user);
						});;
				} else {
					homeController.loginWithGoogle(profile._json)
						.then(data => {
							/*var msg = 'Login & Password - your email: ' + profile._json.emails[0].value;
							//console.log(data.msg);
							request.session.msg = msg;*/
							return done(null, data);
						})
						.catch(data => {
							return done(null, data);
						});
				}
			});
		}
	));
	passport.use('facebook', new AuthFacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields: [
				'id', 'name', 'displayName', 'age_range', 'link', 'gender', 'locale', 'picture', 'timezone', 'updated_time', 'verified'
			]
		},
		function(accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				return done(null, {
					profile: profile,
					homeController: homeController
				});
			});
		}
	));

	passport.use('local', new AuthLocalStrategy(
		function(username, password, done) {
			homeController.login({
					username: username,
					password: password
				})
				.then(data => {
					return done(null, data);
				})
				.catch(error => {
					return done(null, false, {
						message: 'Неверный логин или пароль'
					});
				});
		}
	));
};