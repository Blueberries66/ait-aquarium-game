import mongoose from "mongoose";

const FishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  clickBonus: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  }
});

export default mongoose.model("Fish", FishSchema);