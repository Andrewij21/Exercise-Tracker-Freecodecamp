const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema({
  userId: mongoose.Schema.ObjectId,
  duration: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date().toDateString(),
  },
});

module.exports = model("exercise", schema);
