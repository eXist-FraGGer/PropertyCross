var User = function(db) {
	return {
		isExist: (data) => {
			//
			return new Promise(function(resolve, reject) {
				var user = db.collection('users').find({
					"username": data.username,
					"password": data.password
				});
				user.count()
					.then(count => {
						if (count) {
							resolve(data.username);
						} else {
							reject(err);
						};
					});
			});
		}
	}
}


module.exports = User;