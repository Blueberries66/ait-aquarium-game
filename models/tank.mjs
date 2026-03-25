import mongoose from "mongoose";

const TankSchema = new Schema({
  name: { type: String, default: 'My Tank' },
  fish: [{ type: Schema.Types.ObjectId, ref: 'Fish' }], // max 10
  decorations: [String],
});

export default mongoose.model("Tank", TankSchema);