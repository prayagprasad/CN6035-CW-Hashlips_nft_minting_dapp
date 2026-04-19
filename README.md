# MintPulse: Hybrid NFT Distributed System

**MintPulse** is an improved version of the HashLips NFT Minting DApp, transformed into a professional 3-tier Hybrid Distributed System for the CN6035 module.

## 🚀 Key Improvements (The "Missing" Parts)
- **Middleware API:** Built a Node.js/Express backend to handle off-chain data.
- **Persistence Layer:** Integrated MongoDB Atlas for global transaction history.
- **Enhanced UI:** Added a Live System Monitor and Blockchain Analytics dashboard.
- **Blockchain Logic:** Implemented transaction receipt tracking (Block Number & Gas).

## 🛠️ Installation Manual

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MetaMask Extension (Connected to Sepolia Testnet)
- MongoDB Atlas account

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add your MongoDB connection string:
   `MONGO_URI=mongodb+srv://<user>:<password>@cluster...`
4. Start the server: `node server.js` (Port 3000)

### 3. Frontend Setup
1. Return to the root folder: `cd ..`
2. Install dependencies: `npm install`
3. Start the DApp: `npm start` (Port 3001)

## 🏗️ System Architecture
The project follows a **Hybrid Distributed Architecture**:
1. **Client:** React.js Redux-based UI.
2. **Middleware:** Express.js RESTful API.
3. **Ledger:** Ethereum Virtual Machine (Sepolia Testnet).
4. **Data:** MongoDB Atlas Cloud Storage.

## 🔗 Links
- **Original Repository:** https://github.com/HashLips/hashlips_nft_minting_dapp.git
