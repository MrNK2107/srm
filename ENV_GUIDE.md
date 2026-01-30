# Environment Variables Setup Guide

This guide explains how to obtain the necessary API keys and values for your `.env` file.

## 1. SEPOLIA_RPC_URL (Sepolia RPC Endpoint)
This is the connection to the Ethereum Sepolia testnet.
- **Option A (Quick):** Use a public RPC URL.
  - URL: `https://rpc.ankr.com/eth_sepolia` (Free, no account needed, but might be rate-limited).
- **Option B (Recommended):** Get a private RPC from Alchemy or Infura.
  1. Go to [Alchemy.com](https://www.alchemy.com/).
  2. Sign up/Log in.
  3. Create a new App (Chain: Ethereum, Network: Sepolia).
  4. Click "API Key" and copy the "HTTPS" URL.

## 2. PRIVATE_KEY (Wallet Private Key)
**WARNING: Use a DEV-ONLY wallet. Never use a wallet with real Mainnet funds.**
1. Open MetaMask.
2. Click the three dots (menu) -> **Account Details**.
3. Click **Show Private Key**.
4. Enter your password and copy the key.
5. Paste it in `.env` (without `0x` prefix usually, but Ethers works with both).

## 3. PINATA_JWT (IPFS Storage)
Pinata is used to store the Model and Input files off-chain.
1. Go to [Pinata.cloud](https://app.pinata.cloud/).
2. Sign up/Log in.
3. Go to **API Keys** section.
4. Click **New Key**.
5. Enable "Admin" permissions (or specific pinning permissions).
6. Copy the **JWT** (big long string).
   *Note: Do not confuse this with "API Key" or "API Secret". We use the JWT.*

## 4. PINATA_GATEWAY_URL
- Default: `https://gateway.pinata.cloud/ipfs/`
- If you have a dedicated gateway from Pinata (paid plan), you can use that.

## 5. CONTRACT_ADDRESS
This is generated *after* you deploy your smart contracts.
1. Run `npm run deploy:contracts`.
2. The terminal will output:
   ```
   VerifiableCompute deployed to: 0x123...abc
   ```
3. Copy that address into your `.env`.
   *Note: Frontend needs it as `VITE_CONTRACT_ADDRESS`.*

## 6. VITE_ Variables (Frontend)
These are automatically picked up by the Vite frontend.
- `VITE_CONTRACT_ADDRESS`: Same as `CONTRACT_ADDRESS`.
- `VITE_CHAIN_ID`: `11155111` (This is the ID for Sepolia).
- `VITE_BACKEND_URL`: `http://localhost:4000` (Default local backend).
- `VITE_SEPOLIA_RPC_URL`: Same as `SEPOLIA_RPC_URL`.
