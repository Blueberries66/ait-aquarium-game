import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// basic route
app.get("/", (req, res) => {
  res.send("Aqua Clicker App");
});

// MongoDB connection (can be fake for now)
mongoose.connect("mongodb://127.0.0.1:27017/aquaclicker", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});