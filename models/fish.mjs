import mongoose from "mongoose";

const FishSchema = new Schema({
  species: { type: String, required: true },
  currencyBonus: { type: Number, default: 1 },
  rarity: { type: String, enum: ['common','rare','legendary'] },
});

export default mongoose.model("Fish", FishSchema);