import mongoose from "mongoose";

const FishTemplateSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  cost:       { type: Number, required: true, min: 0 },
  clickBonus: { type: Number, required: true, min: 1, default: 1 },
  imagePath:  { type: String, default: null }
});

export default mongoose.model("FishTemplate", FishTemplateSchema);