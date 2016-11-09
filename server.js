var express = require('express'),
	session = require('express-session'),
	redis = require('redis'),
	redisStore = require('connect-redis')(session),
	passport = require('passport'),
	config = require('./oauth.js'),
	AuthGoogleStrategy = require('passport-google-oauth2').Strategy,
	AuthLocalStrategy = require('passport-local').Strategy,
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient;

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
				return done(null, {
					username: "admin"
				});
			})
			.catch(error => {
				return done(null, false, {
					message: 'Неверный логин или пароль'
				});
			});
	}
));

var app = express();
//app.use(bodyParser.urlencoded({ extended: false }));
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

app.use(passport.initialize());
app.use(passport.session());

app.listen(8080, () => {
	console.log('server started');
	MongoClient.connect('mongodb://localhost:27017/PropertyCross', function(err, db) {
		homeController = new HomeCtrl(db);
		console.log('Connected successfully to server');
	})
});



app.get('/', ensureAuthenticated, (req, res) => {
	if (req.session.login) {
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
		res.redirect('/');
	}
);

/*app.post('/reg', passport.authenticate('local-signup', {
	successRedirect: '/',
	failureRedirect: '/login'
}));*/

app.get('/logout', (req, res) => {
	req.logout();
	req.session.login = "";
	res.status(200).redirect('/');
});

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
});

// test authentication
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};