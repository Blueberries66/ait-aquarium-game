import "./config.mjs";
import express from "express";
import mongoose from "mongoose";
import Fish from "./models/fish.mjs";
import Tank from "./models/tank.mjs";

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const MONGODB_URI = process.env.DSN;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

async function getOrCreateStarterTank() {
  let tank = await Tank.findOne({ name: "Starter Tank" }).populate("fish");

  if (!tank) {
    tank = await Tank.create({
      name: "Starter Tank",
      capacity: 10,
      coins: 500,
      fish: []
    });

    tank = await Tank.findById(tank._id).populate("fish");
  }

  return tank;
}

app.get("/", async (req, res) => {
  try {
    const tank = await getOrCreateStarterTank();
    res.render("home", { tank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading home page.");
  }
});

app.get("/shop", async (req, res) => {
  try {
    const tank = await getOrCreateStarterTank();

    res.render("shop", {
      tank,
      errorMessage: ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading shop page.");
  }
});

app.post("/shop/buy-fish", async (req, res) => {
  try {
    const { name, species, cost, clickBonus } = req.body;

    const parsedCost = Number(cost);
    const parsedClickBonus = Number(clickBonus);

    const tank = await getOrCreateStarterTank();

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
    console.error(err);
    res.status(500).send("Server error while buying fish.");
  }
});

app.get("/inventory", async (req, res) => {
  try {
    const tank = await getOrCreateStarterTank();

    const totalClickBonus = tank.fish.reduce((sum, fish) => {
      return sum + fish.clickBonus;
    }, 0);

    res.render("inventory", { tank, totalClickBonus });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading inventory.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});