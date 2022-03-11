const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		match: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	classes: {
		type: [mongoose.SchemaTypes.ObjectId],
		required: true,
		default: [],
		ref: 'Class'
	},
	avatar: {
		type: String,
		default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
		maxlength: 255,
		match: /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/i
	}
});

module.exports = mongoose.model('Users', userSchema);