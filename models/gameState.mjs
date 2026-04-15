import mongoose from "mongoose";

const GameStateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  coins: { type: Number, default: 500, min: 0 }
});

export default mongoose.model("GameState", GameStateSchema);