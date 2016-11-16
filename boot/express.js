var session = require('express-session'),
	redis = require('redis'),
	redisStore = require('connect-redis')(session),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	multer = require('multer');


var client = redis.createClient();

module.exports = (app) => {
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

};