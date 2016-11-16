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
	image: String,
	accounts: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.model('user', UserSchema);