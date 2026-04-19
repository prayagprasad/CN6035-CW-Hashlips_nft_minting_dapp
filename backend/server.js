require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DISTRIBUTED SYSTEM CONNECTED: MongoDB Cloud Atlas is live"))
  .catch(err => console.error("❌ CONNECTION ERROR: Check your IP Access List (0.0.0.0/0)", err));

// Using Mongoose to interface with MongoDB Atlas (Cloud Database)
// This makes sure every record in database is valid and consistent.
const MintSchema = new mongoose.Schema({
    wallet: { type: String, required: true },
    hash: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Mint = mongoose.model('Mint', MintSchema);

app.use(cors());
app.use(express.json()); // Week 3 requirement: Handling JSON bodies
app.use(morgan('dev'));

// POST: Save a new mint
app.post('/api/mints', async (req, res) => {
    try {
        const newMint = new Mint(req.body);
        const savedMint = await newMint.save(); // Saves to MongoDB Atlas
        console.log("💾 Successfully Saved to MongoDB:", savedMint);
        res.status(201).json(savedMint);
    } catch (err) {
        console.error("❌ Save Error:", err);
        res.status(500).json({ error: "Failed to save to database" });
    }
});

// GET: Get all mints for the UI
app.get('/api/mints', async (req, res) => {
    try {
        const history = await Mint.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

const PORT = 3000;
app.get('/', (req, res) => {
    res.send('🚀 MintPulse Hybrid Backend is running successfully!');
});

app.listen(PORT, () => console.log(`Backend is live on port ${PORT}`));
