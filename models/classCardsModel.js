import mongoose from "mongoose";
const classCardsLikeSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  timeStamp: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
  },
});

const classCardsSchema = new mongoose.Schema({
  classId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    alias: "id",
  },
  cardType: {
    type: mongoose.SchemaTypes.String,
    required: true,
    alias: "type",
    enum: ["", "post", "comment"],
  },
  content: {
    title: {
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: [5, "Title must be at least 5 characters long, got {VALUE}"],
    },
    description: {
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: [
        5,
        "Description must be at least 5 characters long, got {VALUE}",
      ],
    },
    media: {
      type: mongoose.SchemaTypes.String,
      maxlength: 255,
      match: /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/i,
      alias: "image",
    },
    cardText: {
      type: mongoose.SchemaTypes.String,
      required: true,
      minlength: [
        10,
        "Card text must be at least 10 characters long, got {VALUE}",
      ],
      maxlength: [
        1000,
        "Card text must be at most 1000 characters long, got {VALUE}",
      ],
      alias: "text",
    },
  },
  authorId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    alias: "author",
  },
  timeStamp: {
    type: mongoose.SchemaTypes.Date,
    alias: "time",
    default: Date.now,
  },
  likes: {
    type: [classCardsLikeSchema],
    default: [],
  },
});

classCardsSchema.statics.findByClassId = function (classId) {
  return this.find({ classId: classId });
};
export default mongoose.model("Class Cards", classCardsSchema);
