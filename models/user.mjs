import mongoose from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  currency: { type: Number, default: 0 },
  tanks: [{ type: Schema.Types.ObjectId, ref: 'Tank' }],
  inventory: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
});

export default mongoose.model("User", UserSchema);