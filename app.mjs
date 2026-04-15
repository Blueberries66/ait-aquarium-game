import "./config.mjs";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server } from "socket.io";

import Tank from "./models/tank.mjs";
import FishTemplate from "./models/fishTemplate.mjs";
import Decoration from "./models/decoration.mjs";
import GameState from "./models/gameState.mjs";
import User from "./models/user.mjs";

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.DSN)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


//sessions for login persistence
app.use(session({
  secret: process.env.SESSION_SECRET || "aquarium-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DSN }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 1 } // 1 day
}));

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

//set up
async function getCoins(userId) {
  let state = await GameState.findOne({ user: userId });
  if (!state) state = await GameState.create({ user: userId, coins: 0 });
  return state;
}

async function getOrCreateStarterTank(userId) {
  let tank = await Tank.findOne({ user: userId, name: "Starter Tank" })
    .populate("fish.template")
    .populate("decorations");
  if (!tank) {
    await Tank.create({ user: userId, name: "Starter Tank", capacity: 10, fish: [], decorations: [] });
    tank = await Tank.findOne({ user: userId, name: "Starter Tank" })
      .populate("fish.template")
      .populate("decorations");
  }
  return tank;
}

//seed initial fish and decorations 
async function seedCatalog() {
  const fishCount = await FishTemplate.countDocuments();
  if (fishCount === 0) {
    await FishTemplate.insertMany([
      { name: "Clownfish", cost: 50,  clickBonus: 6},
      { name: "Goldfish", cost: 10,  clickBonus: 1},
      { name: "Blue fish idk", cost: 120, clickBonus: 3},
      { name: "Expensive fish", cost: 5000, clickBonus: 50},
    ]);
    console.log("Fish catalog seeded.");
  }
  const decCount = await Decoration.countDocuments();
  if (decCount === 0) {
    await Decoration.insertMany([
      { name: "Castle",         cost: 80,  visitorBonus: 1 },
      { name: "Treasure Chest", cost: 150, visitorBonus: 3 },
      { name: "Coral Reef",     cost: 200, visitorBonus: 5 },
    ]);
    console.log("Decoration catalog seeded.");
  }
}

//authentication routes
app.get("/register", (req, res) => {
  res.render("register", { errorMessage: "" });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("register", { errorMessage: "Username and password are required." });
    }
    if (password.length < 6) {
      return res.render("register", { errorMessage: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.render("register", { errorMessage: "Username already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash });

    await getOrCreateStarterTank(user._id);
    await getCoins(user._id);

    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during registration.");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "" });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("login", { errorMessage: "Username and password are required." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { errorMessage: "Invalid username or password." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.render("login", { errorMessage: "Invalid username or password." });
    }

    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during login.");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});


app.get("/", requireLogin, async (req, res) => {
  try {
    const tanks = await Tank.find({ user: req.session.userId }).populate("fish.template");
    const state = await getCoins(req.session.userId);
    res.render("home", { tanks, coins: state.coins, userId: req.session.userId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading home page.");
  }
});

app.get("/tank/:id", requireLogin, async (req, res) => {
  try {
    const tank = await Tank.findOne({ _id: req.params.id, user: req.session.userId })
      .populate("fish.template")
      .populate("decorations");
    if (!tank) return res.status(404).send("Tank not found.");
    const state = await getCoins(req.session.userId);
    res.render("tank", { tank, coins: state.coins });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading tank.");
  }
});

app.get("/shop", requireLogin, async (req, res) => {
  try {
    const tanks = await Tank.find({ user: req.session.userId }).populate("fish.template");
    const fishCatalog = await FishTemplate.find();
    const decorationCatalog = await Decoration.find();
    const state = await getCoins(req.session.userId);
    const tankCost = tanks.length * 300;

    const selectedTankId = req.query.tankId || tanks[0]?._id.toString();
    const selectedTank = tanks.find(t => t._id.toString() === selectedTankId) || tanks[0];

    res.render("shop", {
      tanks,
      tank: selectedTank,
      fishCatalog,
      decorationCatalog,
      errorMessage: "",
      tankCost,
      coins: state.coins
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error loading shop.");
  }
});

app.post("/shop/buy-fish", requireLogin, async (req, res) => {
  const renderShopWithError = async (msg) => {
    const tanks = await Tank.find({ user: req.session.userId }).populate("fish.template");
    const fishCatalog = await FishTemplate.find();
    const decorationCatalog = await Decoration.find();
    const state = await getCoins(req.session.userId);
    const tankCost = tanks.length * 300;
    const selectedTank = tanks.find(t => t._id.toString() === req.body.tankId) || tanks[0];
    return { tanks, tank: selectedTank, fishCatalog, decorationCatalog, errorMessage: msg, tankCost, coins: state.coins };
  };

  try {
    const { templateId, tankId } = req.body;

    if (!tankId || !mongoose.Types.ObjectId.isValid(tankId)) {
      return res.render("shop", await renderShopWithError("Invalid tank."));
    }

    const tank = await Tank.findOne({ _id: tankId, user: req.session.userId });
    const template = await FishTemplate.findById(templateId);
    const state = await getCoins(req.session.userId);

    if (!tank)     return res.render("shop", await renderShopWithError("Tank not found."));
    if (!template) return res.render("shop", await renderShopWithError("Fish not found."));
    if (tank.fish.length >= tank.capacity) {
      return res.render("shop", await renderShopWithError("That tank is full! Select a different tank or buy a new one."));
    }
    if (state.coins < template.cost) {
      return res.render("shop", await renderShopWithError(`Not enough coins to buy ${template.name}.`));
    }

    await GameState.updateOne({ user: req.session.userId }, { $inc: { coins: -template.cost } });
    await Tank.updateOne({ _id: tank._id }, { $push: { fish: { template: template._id } } });

    res.redirect(`/shop/?tankId=${tank._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while buying fish.");
  }
});

app.post("/shop/buy-decoration", requireLogin, async (req, res) => {
  const renderShopWithError = async (msg) => {
    const tanks = await Tank.find({ user: req.session.userId }).populate("fish.template");
    const fishCatalog = await FishTemplate.find();
    const decorationCatalog = await Decoration.find();
    const state = await getCoins(req.session.userId);
    const tankCost = tanks.length * 300;
    const selectedTank = tanks.find(t => t._id.toString() === req.body.tankId) || tanks[0];
    return { tanks, tank: selectedTank, fishCatalog, decorationCatalog, errorMessage: msg, tankCost, coins: state.coins };
  };

  try {
    const { decorationId, tankId } = req.body;

    if (!tankId || !mongoose.Types.ObjectId.isValid(tankId)) {
      return res.render("shop", await renderShopWithError("Invalid tank."));
    }

    const tank = await Tank.findOne({ _id: tankId, user: req.session.userId });
    const decoration = await Decoration.findById(decorationId);
    const state = await getCoins(req.session.userId);

    if (!tank)       return res.render("shop", await renderShopWithError("Tank not found."));
    if (!decoration) return res.render("shop", await renderShopWithError("Decoration not found."));
    if (state.coins < decoration.cost) {
      return res.render("shop", await renderShopWithError(`Not enough coins to buy ${decoration.name}.`));
    }

    await GameState.updateOne({ user: req.session.userId }, { $inc: { coins: -decoration.cost } });
    await Tank.updateOne({ _id: tank._id }, { $push: { decorations: decoration._id } });

    res.redirect(`/tank/${tank._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while buying decoration.");
  }
});

app.post("/shop/buy-tank", requireLogin, async (req, res) => {
  const renderShopWithError = async (msg) => {
    const tanks = await Tank.find({ user: req.session.userId }).populate("fish.template");
    const fishCatalog = await FishTemplate.find();
    const decorationCatalog = await Decoration.find();
    const state = await getCoins(req.session.userId);
    const tankCost = tanks.length * 300;
    return { tanks, tank: tanks[0], fishCatalog, decorationCatalog, errorMessage: msg, tankCost, coins: state.coins };
  };

  try {
    const { tankName } = req.body;
    const tanks = await Tank.find({ user: req.session.userId });
    const tankCost = tanks.length * 300;
    const state = await getCoins(req.session.userId);

    if (!tankName || !tankName.trim()) {
      return res.render("shop", await renderShopWithError("Please enter a name for your new tank."));
    }
    if (state.coins < tankCost) {
      return res.render("shop", await renderShopWithError(`Not enough coins. A new tank costs ${tankCost} coins.`));
    }

    await GameState.updateOne({ user: req.session.userId }, { $inc: { coins: -tankCost } });
    const newTank = await Tank.create({
      user: req.session.userId,
      name: tankName.trim().substring(0, 30), // cap at 30 chars
      capacity: 10,
      fish: [],
      decorations: []
    });

    res.redirect(`/tank/${newTank._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while buying tank.");
  }
});

//SOCKET.IO for real-time coin updates on clicks
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("click", async ({ userId }) => {
    try {
      if (!userId) return;
      const tanks = await Tank.find({ user: userId }).populate("fish.template");
      const bonus = tanks.flatMap(t => t.fish)
        .filter(f => f.template != null)
        .reduce((sum, f) => sum + f.template.clickBonus, 0) || 1;

      await GameState.updateOne({ user: userId }, { $inc: { coins: bonus } });
      const state = await getCoins(userId);

      io.emit("coins:update", { userId: userId.toString(), coins: state.coins });
    } catch (err) {
      console.error("Click error:", err);
    }
  });

  socket.on("disconnect", () => console.log("user disconnected:", socket.id));
});


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {
  await seedCatalog();
  console.log(`Server running on port ${PORT}`);
});