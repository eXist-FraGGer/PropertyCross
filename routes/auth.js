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
			req.session.login = req.user.displayName;
			res.status(200).redirect('/');
		}
	);

	app.get('/auth/facebook',
		passport.authenticate('facebook', {
			scope: 'read_stream'
		})
	);

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			failureRedirect: '/'
		}),
		function(req, res) {
			req.session.login = req.user.displayName;
			res.status(200).redirect('/');
		}
	);
}