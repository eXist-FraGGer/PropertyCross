var path = require('path'),
	fs = require('fs');

var NodeMailerSrvc = require('../services/nodemailer');
var mailer = new NodeMailerSrvc();

module.exports = (app, homeController) => {
	app.get('/', ensureAuthenticated, (req, res) => {
		if (req.session.login) {
			res.clearCookie('msg');
			if (req.session.msg) {
				res.cookie('msg', req.session.msg);
				req.session.msg = undefined;
			}
			res.cookie('login', req.session.login);
			res.sendFile(path.join(__dirname, '..', '/public/index.html'));
		} else {
			res.sendFile(path.join(__dirname, '..', '/public/login.html'));
		}
	});

	app.post('/location', (req, res) => {
		//res.set('Access-Control-Allow-Origin', '*');
		homeController.findByLocation(req.body)
			.then(data => {
				res.json(data);
			})
			.catch(error => {
				res.send(error);
			});
	});

	app.post('/find', (req, res) => {
		homeController.findByName(req.body)
			.then(data => {
				res.send(data);
			})
			.catch(error => {
				res.send(error);
			});
	});

	app.get('/profile', ensureAuthenticated, (req, res) => {
		homeController.getUserByName(req.user.username)
			.then(data => {
				//console.log(data);
				res.cookie('user', JSON.stringify(data));
				res.sendFile(path.join(__dirname, '..', '/public/profile.html'));
			})
			.catch(error => {
				res.send(error);
			});
	});

	app.get('/img/:name', (req, res) => {
		res.sendFile(path.join(__dirname, '..', '/public/img/' + req.params.name));
	});

	app.post('/profile/upload', function(req, res) {
		if (req.file.mimetype.indexOf('image/') === 0) {
			fs.readFile(req.file.path, function(error, result) {
				var fName = path.join(__dirname, '..', '/public/img/ava-' + req.user.username + '.jpg');
				fs.writeFile(fName, result, function() {
					homeController.setAvatar(req.user.username)
						.then(data => {
							console.log('avatar loaded');
						})
						.catch(error => {
							console.log('Erro avatar loaded');
						});
				});
			});

		}
		res.status(200).redirect('../profile');
		//	res.end();
	});

	app.get('/reg', (req, res) => {
		res.sendFile(path.join(__dirname, '..', '/public/registration.html'));
	});

	app.post('/reg', (req, res) => {
		homeController.createProfile(req.body)
			.then(data => {
				res.send("Теперь можете войти");
			})
			.catch(error => {
				res.send(error);
			});
	});

	app.get('/profileedit', (req, res) => {
		res.cookie('user', JSON.stringify(req.user));
		res.sendFile(path.join(__dirname, '..', '/public/editProfile.html'));
	});

	app.post('/profileedit', (req, res) => {
		homeController.changeProfile(req.body)
			.then(data => {
				console.log(data);
				res.send({
					redirect: '/profile'
				});
			})
			.catch(error => {
				console.log(error);
				res.send({
					redirect: '/profileedit'
				});
			});
	});

	app.get('/logout', (req, res) => {
		req.logout();
		req.session.login = "";
		res.status(200).redirect('/');
	});

	app.get('/login', (req, res) => {
		/*if (req.isAuthenticated()) {
        res.redirect('/');
    	return;
    }*/
		res.sendFile(path.join(__dirname, '..', '/public/login.html'));
	});

	app.post('/activated', (req, res) => {
		if (!req.body.email)
			res.end('Need email');
		mailer.sendVerifyMsg({
				to: req.body.email
			})
			.then(data => {
				res.json({
					data: data
				})
			})
			.catch(error => {
				res.json({
					error: error
				});
			});
	});

	app.get('/activated/:token/:email', (req, res) => {
		mailer.validateAccessToken(req.params.email, req.params.token)
			.then(data => {
				if (data)
					homeController.activatedAcc(req.params.email)
					.then(data => {
						res.redirect('/profile');
					})
					.catch(error => {
						req.session.msg = error;
						res.redirect('/');
					});
			})
			.catch(error => {
				res.json({
					error: error
				});
			});
	});

	// test authentication
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	};
}