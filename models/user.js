var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	image: String,
	active: {
		type: Boolean,
		default: false
	},
	accounts: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.model('user', UserSchema);