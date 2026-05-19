# Aquarium Builder

Aquarium Builder is a small full-stack clicker game where players build a collection of fish tanks. Users register or log in, earn coins by clicking, spend coins on fish, and buy additional tanks as their collection grows. Each fish increases the number of coins earned per click, so the game loop gradually scales as the aquarium expands.

## Live Demo

[https://final-project-blueberries66-1.onrender.com/](https://final-project-blueberries66-1.onrender.com/)

The app requires an account. Register with a username and password, then use the dashboard, shop, and tank views from there.

## Features

- User registration and login with hashed passwords
- Persistent sessions stored in MongoDB
- Real-time coin updates with Socket.io
- Fish shop with coin costs and per-click bonuses
- Multiple tanks per user
- Tank capacity limits
- Animated fish display on individual tank pages
- MongoDB-backed persistence for users, tanks, fish templates, and coin balances

## Tech Stack

- Node.js
- Express
- MongoDB and Mongoose
- EJS templates
- Socket.io
- Tailwind CSS via CDN
- bcrypt
- express-session and connect-mongo

## Getting Started

### Prerequisites

- Node.js
- MongoDB connection string

### Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
DSN=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

Start the app:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Repository Layout

```text
.
|-- app.mjs                    # Express app, routes, Socket.io events, catalog seeding
|-- config.mjs                 # Environment variable loading
|-- package.json               # Project metadata, scripts, and dependencies
|-- models/
|   |-- fishTemplate.mjs       # Fish catalog schema
|   |-- gameState.mjs          # Per-user coin balance schema
|   |-- tank.mjs               # Tank and owned fish schemas
|   `-- user.mjs               # User schema and password comparison method
|-- public/
|   `-- images/                # Fish image assets
|-- views/
|   |-- home.ejs               # Dashboard and clicker page
|   |-- login.ejs              # Login form
|   |-- register.ejs           # Registration form
|   |-- shop.ejs               # Fish and tank shop
|   `-- tank.ejs               # Individual animated tank view
`-- documentation/             # Milestone notes and screenshots
```

## Data Model

The app uses four main MongoDB collections:

- `User`: stores usernames and bcrypt password hashes.
- `GameState`: stores the current coin balance for each user.
- `Tank`: stores each user's tanks, capacity, and owned fish.
- `FishTemplate`: stores shared fish catalog entries such as name, cost, bonus, and image path.

Owned fish are embedded in a tank as references to `FishTemplate` documents, with an acquisition timestamp.

## Main Routes

- `GET /` - dashboard with coin counter, click button, and tank list
- `GET /register` and `POST /register` - account creation
- `GET /login` and `POST /login` - authentication
- `POST /logout` - end the session
- `GET /tank/:id` - individual tank display
- `GET /shop` - fish and tank shop
- `POST /shop/buy-fish` - purchase a fish for a selected tank
- `POST /shop/buy-tank` - purchase a new tank

## Notes

Fish catalog data is seeded automatically on server start if the fish template collection is empty. User-specific progress is stored in MongoDB, and coin changes are pushed to the browser in real time through Socket.io.
