# zk-verified-compute-circom

A full-stack Web3 verifiable computation system. Heavy computations (ML inference) are executed off-chain and verified on-chain using zk-SNARKs (Groth16) on Ethereum Sepolia.

## Features
- **Off-Chain Computation:** Node.js backend runs "heavy" ML inference.
- **On-Chain Verification:** Solidity contract verifies ZK proofs using SnarkJS generated Verifier.
- **Data Integrity:** Inputs and Model params are stored on IPFS (Pinata) and hashed (Poseidon) to bind the proof.
- **End-to-End UI:** React frontend to upload files, generate proofs, and submit transactions.

## Architecture
1. **Frontend**: User uploads `model.json` and `input.json`.
2. **IPFS**: Data is pinned to IPFS, returning CIDs.
3. **Backend**:
   - Fetches data from IPFS.
   - Computes result (`dot(w, x) + b`).
   - Generates ZK Proof (Witness + Groth16 Proof) using `.wasm` and `.zkey`.
4. **Blockchain**:
   - `submitProof(...)` is called with Public Signals (Output, Model Hash, Input Hash).
   - `Verifier.sol` validates the proof.
   - Contract stores the verified job result.

## Prerequisites
- Node.js & npm
- MetaMask Wallet
- Sepolia ETH

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   Copy `.env.example` to `.env` and fill in:
   - `SEPOLIA_RPC_URL`
   - `PRIVATE_KEY` (for deployment)
   - `PINATA_JWT` (for IPFS)

3. **Compile Circuits & Generate Keys**
   ```bash
   npm run compile:circuits
   ```
   *Note: On Windows, this script attempts to download `circom`. If it fails, ensure `circom` is in your PATH.*

4. **Deploy Contracts**
   ```bash
   npm run deploy:contracts
   ```
   *Copy the deployed `VerifiableCompute` address to `.env` (`VITE_CONTRACT_ADDRESS`).*

5. **Start Applications**
   - **Backend**:
     ```bash
     npm run dev:backend
     ```
   - **Frontend**:
     ```bash
     npm run dev:frontend
     ```

## Usage
1. Connect Wallet (Sepolia).
2. Upload `circuits/input.json` (example) as both Model and Input (for demo).
3. Click **Generate Proof**.
4. Click **Submit to Sepolia**.
5. View transaction on Etherscan.

## Proof Binding
The circuit calculates two hashes using Poseidon:
- `modelHash = Poseidon(weights_0...weigths_7, bias)`
- `inputHash = Poseidon(input_0...input_7)`

These hashes are exposed as **Public Signals**. The smart contract requires the submitter to provide these exact hashes (computed off-chain). The `Verifier` ensures the Proof is valid ONLY for those specific public signals. This proves that the `output` was computed from the specific Model/Input data identified by the hashes.
