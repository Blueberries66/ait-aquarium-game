import mongoose from "mongoose";

const OwnedFishSchema = new mongoose.Schema({
  template:   { type: mongoose.Schema.Types.ObjectId, ref: "FishTemplate", required: true },
  acquiredAt: { type: Date, default: Date.now }
});

const TankSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:        { type: String, required: true, trim: true },
  capacity:    { type: Number, default: 10, min: 1 },
  fish:        { type: [OwnedFishSchema], default: [] },
  decorations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Decoration" }]
});

export default mongoose.model("Tank", TankSchema);