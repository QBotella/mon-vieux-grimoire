const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true },
});

const bookSchema = mongoose.Schema({
  userId: { type: String, require: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, require: true },
  genre: { type: String, require: true },
  ratings: [ratingSchema],
  averageRating: { type: Number, require: true, default: 0 },
});

module.exports = mongoose.model("Book", bookSchema);
