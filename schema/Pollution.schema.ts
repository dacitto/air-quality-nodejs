const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Pollution = new Schema({
  ts: { type: String, required: true },
  aqius: { type: Number, required: true },
  aqicn: { type: Number, required: true },
  mainus: { type: String, required: true },
  maincn: { type: String, required: true },
});

// module.exports =
export default mongoose.model("Pollution", Pollution);
