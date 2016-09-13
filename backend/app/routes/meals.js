var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../auth.js');
var Meal = require('../models/Meal.js');
var respondWithError = require('../respondWithError.js')

var getUserIdForMeal = function(req) {
	return req.body.userid || req.query.userid || req.user._id;
};

var getMealWithoutExtras = function(meal) {
	meal = JSON.parse(JSON.stringify(meal));
	delete meal.createdAt;
	delete meal.updatedAt;
	delete meal.__v;
	return meal;
}

/* CREATE a meal */
router.post('/', auth.requireLoggedIn, auth.requireAdminWhenUseridPresent, function(req, res, next) {
	req.body.userid = getUserIdForMeal(req);
	Meal.create(req.body, function (err, meal) {
		if (respondWithError(err, res)) return;
		res.json({ data: getMealWithoutExtras(meal) });
	});
});

/* READ meals */
router.get('/', auth.requireLoggedIn, auth.requireAdminWhenUseridPresent, function(req, res, next) {
	Meal.find({userid: getUserIdForMeal(req)}, '-createdAt -updatedAt -__v', {sort: '-dateandtime'}, function (err, meals) {
		if (respondWithError(err, res, 'User not found.')) return;
		res.json({ data: meals });
	});
});

/* UPDATE a meal */
router.put('/:id', auth.requireLoggedIn, auth.requireAdminWhenUseridPresent, function(req, res, next) {
	Meal.findOneAndUpdate({_id: req.params.id, userid: getUserIdForMeal(req)}, req.body, {new: true, runValidators: true}, function (err, meal) {
		if (respondWithError(err, res, 'Meal not found.')) return;
		res.json({ data: getMealWithoutExtras(meal) });
	});
});

/* DELETE a meal */
router.delete('/:id', auth.requireLoggedIn, auth.requireAdminWhenUseridPresent, function(req, res, next) {
	Meal.findOneAndRemove({_id: req.params.id, userid: getUserIdForMeal(req)}, function (err) {
		if (err) return next(err);
		res.json({ data: null });
	});
});

module.exports = router;
