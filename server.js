var express = require('express'),
	session = require('express-session'),
	redis = require('redis'),
	redisStore = require('connect-redis')(session),
	passport = require('passport'),
	config = require('./oauth.js'),
	AuthFacebookStrategy = require('passport-facebook'),
	AuthGoogleStrategy = require('passport-google-oauth2').Strategy,
	AuthLocalStrategy = require('passport-local').Strategy,
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	mongoose = require('mongoose'),
	multer = require('multer'),
	fs = require('fs');

mongoose.connect('mongodb://localhost:27017/PropertyCross');

var HomeCtrl = require('./controllers/home');
var homeController;
var client = redis.createClient();

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
				console.log('add google acc');

				homeController.addGoogleAcc({
						'username': request.session.login,
						'id': profile._json.id
					}).then(data => {
						return done(null, data);
					})
					.catch(data => {
						request.user.msg = data;
						return done(null, request.user);
					});;
			} else {
				console.log('login with google');
				homeController.loginWithGoogle(profile._json)
					.then(data => {
						//data.msg = 'Login & Password - your email: ' + profile._json.emails[0].value;
						//console.log(data.msg);*/
						//request.user.msg = msg;
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
			return done(null, profile);
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

var app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(__dirname+'/public'));
app.use(session({
	secret: 'PropertyCross secret key',
	store: new redisStore({
		host: 'localhost',
		port: 6379,
		client: client,
		ttl: 260
	}),
	resave: false,
	saveUninitialized: true
}));

app.use(multer({
	dest: './uploads/'
}).single('image'));

app.use(passport.initialize());
app.use(passport.session());

app.listen(8080, () => {
	console.log('server started');
	MongoClient.connect('mongodb://localhost:27017/PropertyCross', function(err, db) {
		homeController = new HomeCtrl(db);
		console.log('Connected successfully to server');
	})
});

require('./routes/auth.js')(app);


app.get('/', ensureAuthenticated, (req, res) => {
	console.log(req.user);
	if (req.session.login) {
		res.clearCookie('msg');
		if (req.user.msg) {
			res.cookie('msg', req.user.msg);
			req.user.msg = undefined;
		}
		res.cookie('login', req.session.login);
		res.sendFile(__dirname + '/public/index.html');
		//res.location('http://example.com');
		//res.status(200).redirect('./public/index.html');
	} else {
		res.sendFile(__dirname + '/public/login.html');
		//res.status(200).redirect('/login');
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
			res.cookie('user', JSON.stringify(data));
			res.sendFile(__dirname + '/public/profile.html');
		})
		.catch(error => {
			res.send(error);
		});
});

app.get('/img/:name', (req, res) => {
	res.sendFile(__dirname + '/public/img/' + req.params.name);
});

app.post('/profile/upload', function(req, res) {
	if (req.file.mimetype.indexOf('image/') === 0) {
		fs.readFile(req.file.path, function(error, result) {
			var fName = __dirname + '/public/img/ava-' + req.user.username + '.jpg';
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

app.post('/reg', (req, res) => {
	homeController.createProfile(req.body)
		.then(data => {
			res.send("Теперь можете войти");
		})
		.catch(error => {
			res.send(error);
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
	res.sendFile(__dirname + '/public/login.html');
});

// test authentication
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};