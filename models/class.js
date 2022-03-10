const mongoose = require('mongoose'),
	classSchema = new mongoose.Schema({
		className: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 50,
			alias: 'name',
		},
		classDescription: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 255,
			alias: 'description',
		},
		classImage: {
			type: String,
			default:
        'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
			maxlength: 255,
			match: /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/i,
			alias: 'image',
		},
		classTeacher: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			alias: 'teacher',
		},
		classStudents: {
			type: [mongoose.SchemaTypes.ObjectId],
			required: true,
			alias: 'students',
		},
	});

module.exports = mongoose.model('Classes', classSchema);
