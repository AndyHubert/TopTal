var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Missing username.'],
		unique: true,
		index: true,
		trim: true
	},
	password: {
		type: String,
		required: [true, 'Missing password.']
	},
	adminLevel: {
		type: Number,
		default: 1,
		min: [1, 'Invalid admin level.'],
		max: [3, 'Invalid admin level.']
	},
	expectedPerDay: {
		type: Number,
		min: [0, 'Invalid expected calories / day.'],
		default: 2640
	}
}, {
    timestamps: true
});

UserSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
		this.password = bcrypt.hashSync(this.password, 10);
    }
	return next();
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.plugin(uniqueValidator, { message: 'Username already in use.' });

module.exports = mongoose.model('User', UserSchema);
