import mongoose from "mongoose";

const ItemSchema = new Schema({
  type: { type: String, enum: ['decoration', 'special_fish', 'currency_boost'] },
  name: { type: String, required: true },
  description: String,
  effect: { type: Number }
});

export default mongoose.model("Item", ItemSchema);