const mongoose = require("mongoose"),
  studysetSchema = new mongoose.Schema({
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: [
        5,
        "Study set name must be at least 5 characters long, got {VALUE}",
      ],
      maxlength: [
        50,
        "Study set name must be at most 50 characters long, got {VALUE}",
      ],
      alias: "studySetName",
    },
    description: {
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: [
        5,
        "Study set description must be at least 5 characters long, got {VALUE}",
      ],
      maxlength: [
        255,
        "Study set description must be at most 255 characters long, got {VALUE}",
      ],
      alias: "studySetDescription",
    },
    flashcards: [
      {
        term: {
          type: mongoose.SchemaTypes.String,
          required: true,
          minlength: [
            5,
            "Flashcard term must be at least 5 characters long, got {VALUE}",
          ],
          maxlength: [
            255,
            "Flashcard term must be at most 255 characters long, got {VALUE}",
          ],
        },
        definition: {
          type: mongoose.SchemaTypes.String,
          required: true,
          minlength: [
            5,
            "Flashcard definition must be at least 5 characters long, got {VALUE}",
          ],
          maxlength: [
            510,
            "Flashcard definition must be at most 510 characters long, got {VALUE}",
          ],
        },
        interchangeable: {
          type: mongoose.SchemaTypes.Boolean,
          default: false,
        },
        image: {
          type: mongoose.SchemaTypes.String,
        },
        setAuthor: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
          alias: "author",
        },
      },
    ],
  }),
  classSchema = new mongoose.Schema({
    className: {
      type: mongoose.SchemaTypes.String,
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
      type: mongoose.SchemaTypes.String,
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
      type: mongoose.SchemaTypes.String,
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
      type: [mongoose.SchemaTypes.Date],
      alias: "time",
    },
    classLocation: {
      type: mongoose.SchemaTypes.String,
      alias: "location",
    },
    classCapacity: {
      type: mongoose.SchemaTypes.Number,
      required: [true, "Class capacity is required"],
      alias: "capacity",
      default: 10,
    },
    classDeleted: {
      type: mongoose.SchemaTypes.Boolean,
      default: false,
      alias: "deleted",
    },
    classCreatedAt: {
      type: mongoose.SchemaTypes.Date,
      default: Date.now,
      alias: "createdAt",
    },
    classUpdatedAt: {
      type: mongoose.SchemaTypes.Date,
      default: Date.now,
      alias: "updatedAt",
    },
    classDays: {
      type: [mongoose.SchemaTypes.String],
      alias: "days",
    },
    studysets: [studysetSchema],
    classLanguage: {
      type: mongoose.SchemaTypes.String,
      enum: {
        values: ["en", "es"],
        message: "Invalid language {{VALUE}}",
      },
      default: "en",
      alias: "language",
    },
  });

classSchema.virtual("classStudentsCount").get(function () {
  return this.classStudents.length;
});

module.exports = mongoose.model("Classes", classSchema);
