var passport = require('passport');
//
module.exports = (app) => {
	app.post('/login',
		passport.authenticate('local', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			req.session.login = req.user.username;
			res.send({
				redirect: '/'
			});
		}
	);

	app.get('/auth/google',
		passport.authenticate('google', {
			scope: [
				'https://www.googleapis.com/auth/plus.login',
				'https://www.googleapis.com/auth/plus.profile.emails.read'
			]
		})
	);

	app.get('/auth/google/callback',
		passport.authenticate('google', {
			failureRedirect: '/'
		}),
		function(req, res) {
			req.session.login = req.user.username;
			res.status(200).redirect('/');
		}
	);

	app.get('/auth/facebook',
		passport.authenticate('facebook', {
			scope: [
				'email',
				'public_profile'
			]
		})
	);

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			failureRedirect: '/'
		}),
		function(req, res) {
			if (req.session.login) {
				req.user.homeController.addFacebookAcc({
						'username': req.session.login,
						'id': req.user.profile._json.id
					}).then(data => {
						req.session.passport.user = data;
						req.session.login = data.username;
						res.status(200).redirect('/');
					})
					.catch(msg => {
						req.user.homeController.getUserByName(req.session.login)
							.then(data => {
								req.session.passport.user = data;
								req.session.msg = msg;
								req.session.login = data.username;
								res.status(200).redirect('/');
							})
							.catch(error => {
								res.send(error);
							});
					});;
			} else {
				req.user.homeController.loginWithFacebook(req.user.profile._json)
					.then(data => {
						req.session.passport.user = data;
						req.session.login = data.username;
						res.status(200).redirect('/');
					})
					.catch(data => {
						req.session.passport.user = data;
						req.session.login = data.username;
						res.status(200).redirect('/');
					});
			}
		}
	);
}