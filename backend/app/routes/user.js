var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bcrypt = require('bcrypt');

var auth = require('../auth.js');
var User = require('../models/User.js');
var respondWithError = require('../respondWithError.js')

var getUserWithoutExtras = function(user) {
	user = JSON.parse(JSON.stringify(user));
	delete user.password;
	delete user.createdAt;
	delete user.updatedAt;
	delete user.__v;
	return user;
}

/* CREATE user record */
router.post('/', function(req, res, next) {
	if(!req.user || req.user.adminLevel < 2) {
		req.body.adminLevel = 1;
	}
	User.create(req.body, function (err, user) {
		if (respondWithError(err, res)) return;
		auth.doLogin(req, res, next);
	});
});

/* READ my user record */
router.get('/', auth.requireLoggedIn, function(req, res, next) {
	res.json({ data: getUserWithoutExtras(req.user) });
});

/* GET list of all users */
router.get('/all', auth.requireManager, function(req, res, next) {
	User.find(null, "username _id", function (err, users) {
		if (err) return next(err);
		res.json({ data: users });
	});
});

/* READ another's user records */
router.get('/:id', auth.requireManager, function(req, res, next) {
	User.findById(req.params.id, '-password -createdAt -updatedAt -__v', function (err, user) {
		if (err || !user) return res.json({ error: true, message: 'User not found.' });
		res.json({ data: user });
	});
});

/* UPDATE a user record */
router.put('/:id', auth.requireLoggedIn, function(req, res, next) {
	if(req.params.id == req.user._id || req.user.adminLevel >= 2) {
		if(req.body.password) {
			req.body.password = bcrypt.hashSync(req.body.password, 10);
		}
		if(req.body.adminLevel > req.user.adminLevel) {
			return res.json({ error: true, message: 'Unauthorized change.' });
		}
		User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true, context: 'query'}, function (err, user) {
			if (respondWithError(err, res, 'User not found.')) return;
			res.json({ data: getUserWithoutExtras(user) });
		});
	} else {
		res.sendStatus(401);
	}
});

/* DELETE a user record */
router.delete('/:id', auth.requireLoggedIn, function(req, res, next) {
	if(req.params.id == req.user._id || req.user.adminLevel >= 2) {
		User.findByIdAndRemove(req.params.id, function (err) {
			res.json({ data: null });
		});
	} else {
		res.sendStatus(401);
	}
});

module.exports = router;
