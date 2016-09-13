var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('../config/database');
var User = require('./models/User.js');

var auth = {};
 
var getToken = function (headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
};

auth.doLogin = function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) {
		return res.json({ error: true, message: req.body.username ? 'Incorrect username.' : 'Missing username.' });
    }
	user.comparePassword(req.body.password, function (err, isMatch) {
		if (isMatch && !err) {
		    var token = jwt.encode({ _id: user._id, password: user.password }, config.secret);
			user = JSON.parse(JSON.stringify(user));
			delete user.password;
		    res.json({ data: user, token: 'JWT ' + token });
		} else {
			return res.json({ error: true, message: req.body.password ? 'Incorrect password.' : 'Missing password.' });
		}
	});
  });
};

auth.doAuth = function(req, res, next) {
	passport.authenticate('jwt', { session: false});
	var token = getToken(req.headers);
	if (token) {
		try {
			var decoded = jwt.decode(token, config.secret);
			User.findOne({ _id: decoded._id, password: decoded.password}, function(err, user) {
				if (err) throw err;
				if (user) req.user = user;
				next();
			});
		} catch(e) {
			next();
		}
	} else {
		next();
	}
};

auth.requireLoggedIn = function(req, res, next) {
	if (!req.user) {
		res.sendStatus(401);
	} else {
		next();
	}
}

auth.requireManager = function(req, res, next) {
	if (!req.user || req.user.adminLevel < 2) {
		res.sendStatus(401);
	} else {
		next();
	}
}

auth.requireAdmin = function(req, res, next) {
	if (!req.user || req.user.adminLevel < 3) {
		res.sendStatus(401);
	} else {
		next();
	}
}

auth.requireAdminWhenUseridPresent = function(req, res, next) {
	if(req.user.adminLevel < 3 && (req.body.userid || req.query.userid)) {
		res.sendStatus(401);
		} else {
			next();
		}
}

module.exports = auth;
