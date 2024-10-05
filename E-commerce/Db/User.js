const mongoose = require("mongoose");

const userShema = new mongoose.Schema({
  name: String,
  Email: String,
  password: String,
});
module.exports = mongoose.model("users", userShema);
