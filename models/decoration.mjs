import mongoose from "mongoose";

const DecorationSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  cost:         { type: Number, required: true, min: 0 },
  visitorBonus: { type: Number, default: 0 },
  imagePath:    { type: String, default: null }
});

export default mongoose.model("Decoration", DecorationSchema);