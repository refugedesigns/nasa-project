const mongoose = require("mongoose");

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: [true, "name of planet is required!"],
  },
}, { timestamps: true});

module.exports = mongoose.model("Planet", planetSchema);
