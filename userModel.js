const { model, Schema } = require("mongoose");

const schema = new Schema({
  username: String,
});

module.exports = model("username", schema);
