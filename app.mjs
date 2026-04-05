import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Fish from "./models/fish.mjs";
import Tank from "./models/tank.mjs";

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aquarium";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.log("mongo error:", err));

app.get("/", async (req, res) => {
  let tank = await Tank.findOne({ name: "Starter Tank" }).populate("fish");

  if (!tank) {
    tank = await Tank.create({
      name: "Starter Tank",
      capacity: 10,
      coins: 500,
      fish: []
    });
  }

  res.render("home", { tank });
});

app.get("/shop", async (req, res) => {
  let tank = await Tank.findOne({ name: "Starter Tank" }).populate("fish");

  if (!tank) {
    tank = await Tank.create({
      name: "Starter Tank",
      capacity: 10,
      coins: 500,
      fish: []
    });
  }

  res.render("shop", {
    tank,
    errorMessage: ""
  });
});

app.post("/shop/buy-fish", async (req, res) => {
  try {
    const { name, species, cost, clickBonus } = req.body;

    const parsedCost = Number(cost);
    const parsedClickBonus = Number(clickBonus);

    const tank = await Tank.findOne({ name: "Starter Tank" }).populate("fish");

    if (!tank) {
      return res.redirect("/");
    }

    if (!name || !species) {
      return res.render("shop", {
        tank,
        errorMessage: "Fish name and species are required."
      });
    }

    if (Number.isNaN(parsedCost) || parsedCost < 0) {
      return res.render("shop", {
        tank,
        errorMessage: "Cost must be a valid non-negative number."
      });
    }

    if (Number.isNaN(parsedClickBonus) || parsedClickBonus < 0) {
      return res.render("shop", {
        tank,
        errorMessage: "Click bonus must be a valid non-negative number."
      });
    }

    if (tank.fish.length >= tank.capacity) {
      return res.render("shop", {
        tank,
        errorMessage: "This tank is full."
      });
    }

    if (tank.coins < parsedCost) {
      return res.render("shop", {
        tank,
        errorMessage: "Not enough coins to buy this fish."
      });
    }

    const newFish = await Fish.create({
      name,
      species,
      cost: parsedCost,
      clickBonus: parsedClickBonus
    });

    tank.fish.push(newFish._id);
    tank.coins -= parsedCost;
    await tank.save();

    res.redirect("/inventory");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error while buying fish.");
  }
});

app.get("/inventory", async (req, res) => {
  let tank = await Tank.findOne({ name: "Starter Tank" }).populate("fish");

  if (!tank) {
    tank = await Tank.create({
      name: "Starter Tank",
      capacity: 10,
      coins: 500,
      fish: []
    });
  }

  const totalClickBonus = tank.fish.reduce((sum, fish) => {
    return sum + fish.clickBonus;
  }, 0);

  res.render("inventory", { tank, totalClickBonus });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});