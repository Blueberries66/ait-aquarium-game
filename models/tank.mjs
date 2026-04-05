import mongoose from "mongoose";

const TankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    default: 10,
    min: 1
  },
  coins: {
    type: Number,
    default: 500,
    min: 0
  },
  fish: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fish"
    }
  ]
});

export default mongoose.model("Tank", TankSchema);