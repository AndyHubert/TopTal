var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var MealSchema = new mongoose.Schema({
	userid: {
		type: ObjectId,
		required: true,
		index: true
	},
    dateandtime: {
		type: Date,
		required: [true, 'Missing or invalid date / time.'],
	},
	description: {
		type: String,
		required: [true, 'Missing description.'],
		trim: true
	},
	calories: {
		type: Number,
		required: [true, 'Missing calories.'],
		min: [0, 'Invalid calories.']
	}
}, {
    timestamps: true
});

module.exports = mongoose.model('Meal', MealSchema);
