const mongoose = require("mongoose"),
  classSchema = new mongoose.Schema({
    className: {
      type: String,
      required: true,
      minlength: [
        5,
        "Class name must be at least 5 characters long, got {VALUE}",
      ],
      maxlength: [
        50,
        "Class name must be at most 50 characters long, got {VALUE}",
      ],
      alias: "name",
    },
    classDescription: {
      type: String,
      required: true,
      minlength: [
        5,
        "Class description must be at least 5 characters long, got {VALUE}",
      ],
      maxlength: [
        255,
        "Class description must be at most 255 characters long, got {VALUE}",
      ],
      alias: "description",
    },
    classImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
      maxlength: 255,
      match: /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/i,
      alias: "image",
    },
    // Could be called 'classInstructor'
    classTeacher: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, "Class teacher is required"],
      alias: "teacher",
    },
    classStudents: {
      type: [mongoose.SchemaTypes.ObjectId],
      required: [true, "Class students are required"],
      alias: "students",
      validate: {
        validator: function (v) {
          return v.length <= this.classCapacity;
        },
        message: "Class capacity exceeded",
      },
    },
    classTime: {
      type: [Date],
      alias: "time",
    },
    classLocation: {
      type: String,
      alias: "location",
    },
    classCapacity: {
      type: Number,
      required: [true, "Class capacity is required"],
      alias: "capacity",
      default: 10,
    },
    classActive: {
      type: Boolean,
      default: true,
      alias: "active",
    },
    classDeleted: {
      type: Boolean,
      default: false,
      alias: "deleted",
    },
    classCreatedAt: {
      type: Date,
      default: Date.now,
      alias: "createdAt",
    },
    classUpdatedAt: {
      type: Date,
      default: Date.now,
      alias: "updatedAt",
    },
    classDays: {
      type: [String],
      alias: "days",
    },
  });

module.exports = mongoose.model("Classes", classSchema);
