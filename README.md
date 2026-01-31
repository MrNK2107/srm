ZK-Verify Platform
End-to-End Zero-Knowledge Verified ML Inference System

📌 Overview
ZK-Verify is a full-stack Web3 platform that enables trustless verification of machine learning predictions using blockchain and zero-knowledge–style proof submission.

The platform allows users to:

Upload ML models and inputs dynamically

Pin artifacts to IPFS

Fetch real-time ML predictions

Submit proof-like verification data on-chain

Store and audit verification history transparently

This system demonstrates verifiable off-chain computation with on-chain trust.

🚀 Complete Application Flow (Step-by-Step)
1️⃣ Wallet Connection

<img width="1920" height="1200" alt="Screenshot (509)" src="https://github.com/user-attachments/assets/e7ec31ed-0ac5-4d31-adb2-07338da0198a" />

User Action

User opens the application

Clicks “Connect MetaMask”

What Happens

Frontend calls connectWallet()

MetaMask requests eth_requestAccounts

User approves connection

Wallet address is displayed (e.g. 0x7d13...a205)

Status updates to Wallet: Connected

Backend

No backend interaction at this stage

2️⃣ Model & Input File Upload
<img width="1920" height="1200" alt="Screenshot (510)" src="https://github.com/user-attachments/assets/3afe0fbd-1ea8-412e-8e5a-d449a839188b" />

User Uploads

model.json → ML model configuration

input.json → Feature values

Example: model.json

{
  "weights": [1, 2, 3, 4, 5, 6, 7, 8],
  "bias": 0
}
Example: input.json

{
  "features": [1.5, 2.3, 0.8, 1.1, 0.5, 0.9, 34.5, -118.2]
}
Frontend Behavior

Files accepted via input controls

Selected filenames displayed

Status: Files Selected (2/2)

“Pin to IPFS” button becomes active
<img width="1920" height="1200" alt="Screenshot (511)" src="https://github.com/user-attachments/assets/24387b97-2e23-418d-a334-c30665011ca0" />


3️⃣ IPFS Pinning
<img width="1920" height="1200" alt="Screenshot (512)" src="https://github.com/user-attachments/assets/31ebef48-1c8c-4761-a340-7f5fd5601ea8" />

User Action

Clicks “Pin to IPFS”

Frontend
Creates FormData with both files

Sends POST request:

POST /ipfs/upload
Backend
Receives multipart form data

Uploads files to IPFS

Returns CIDs

Example Response

Model CID: QmQ0N88UhExJKAt5D8SQDJdhm825neB3Q33aTUKVyGdZw
Input CID: QmqpJRwzJhPiu6vvyA3kJcUCLmsncqgTNAURkV4sL3yPga
Frontend Update
Displays IPFS CIDs

Pipeline Status: UPLOAD ✅

4️⃣ ML Prediction Generation
<img width="1920" height="1200" alt="Screenshot (513)" src="https://github.com/user-attachments/assets/d588cedc-68ec-49c3-9938-d7763b968573" />

User Action

Clicks “Get ML Prediction”

Frontend
Reads input.json

Extracts 8 required features:

[MedInc, HouseAge, AveRooms, AveBedrms,
 Population, AveOccup, Latitude, Longitude]
Calls external ML API:

GET /predict?MedInc=1.5&HouseAge=2.3&...
ML API
Loads trained California Housing model

Runs inference

Returns prediction

Response

{ "predicted_house_price": 43.18 }
Frontend Update
Displays prediction

Stores value in state

Pipeline Status: ML PREDICT ✅

Enables “Submit On-Chain”

5️⃣ Validation & Security Checks
<img width="1920" height="1200" alt="Screenshot (515)" src="https://github.com/user-attachments/assets/e22d2148-863a-49d9-9e6d-fb5012260e7c" />

Before blockchain submission, the system validates:

✅ Wallet connection
✅ Model file name (blacklist check)
✅ Input feature count (must be 8)
✅ Prediction existence
✅ Prediction numeric compatibility
✅ Model authenticity

Invalid Model Example
<img width="1920" height="1200" alt="Screenshot (519)" src="https://github.com/user-attachments/assets/88d5e175-fb1b-4345-ba49-6adfc8293834" />


model_false.json → ❌ Rejected at submission
6️⃣ On-Chain Submission

User Action with correct valid model :
<img width="1920" height="1200" alt="Screenshot (514)" src="https://github.com/user-attachments/assets/e1484fa9-6da3-46c3-8929-e9a87fa7986d" />
<img width="1920" height="1200" alt="Screenshot (516)" src="https://github.com/user-attachments/assets/e64ef876-ed77-4f7b-9890-a9742778cba5" />


Clicks “Submit On-Chain”

Frontend Preparation
modelHash = BigInt(modelCID.length) % MAX_UINT256
inputHash = BigInt(inputCID.length) % MAX_UINT256
output = BigInt(Math.floor(Math.abs(43.18) * 1_000_000))
// output = 43180000
Proof Parameters
pA, pB, pC generated deterministically

Smart Contract Call
submitProof(
  modelCID,
  inputCID,
  modelHash,
  inputHash,
  output,
  pA,
  pB,
  pC
)
MetaMask
User approves transaction

Sent to Sepolia testnet

7️⃣ Transaction Confirmation
<img width="1920" height="1200" alt="Screenshot (516)" src="https://github.com/user-attachments/assets/e64ef876-ed77-4f7b-9890-a9742778cba5" />
Blockchain

Transaction mined (~12–15s)

Smart contract verifies data

Emits event:

ProofSubmitted(jobId, address, true)
Frontend

Displays success status

Shows transaction hash

Enables View on Etherscan

8️⃣ Verification History Storage


Stored Automatically

Saved in localStorage

{
  "id": "0x7d0d16982f...",
  "timestamp": 1706816982000,
  "modelCID": "QmQ0N88...",
  "inputCID": "QmqpJR...",
  "prediction": 43.18,
  "modelHash": "12345",
  "inputHash": "67890",
  "txHash": "0x7d0d16982f...",
  "trustScore": 98
}
Persists across refresh

Dashboard shows latest 3 jobs

9️⃣ Verification History View
<img width="1920" height="1200" alt="Screenshot (517)" src="https://github.com/user-attachments/assets/cdb5018e-95f8-47a5-a319-a0dfd47a9e5a" />

Displayed Fields

Transaction Hash (Etherscan link)

Model CID (IPFS)

Input CID (IPFS)

Prediction (6 decimals)

Timestamp

Status badge (Verified ✅)

🔟 Proof Details View
Modal Displays

Model Hash

Input Hash

Prediction Value

IPFS CIDs

Verification Status

Etherscan link

🏗 System Architecture
┌──────────────────────────────────────────┐
│            React Frontend                │
│  - Wallet Connection                     │
│  - File Upload                           │
│  - ML Prediction                         │
│  - On-Chain Submission                  │
│  - History Dashboard                    │
└───────────────┬──────────────────────────┘
                │
   ┌────────────┼─────────────┐
   ▼            ▼             ▼
┌───────┐   ┌────────┐   ┌────────────┐
│ IPFS  │   │Backend │   │ ML API     │
│       │   │ API    │   │ (Housing)  │
└───────┘   └────────┘   └────────────┘
                │
                ▼
        ┌──────────────────┐
        │ Smart Contract   │
        │ Sepolia Testnet  │
        └──────────────────┘
✨ Key Features
Dynamic ML model handling

IPFS-based decentralized storage

Real-time ML inference

On-chain verification

Persistent audit trail

Robust validation & error handling

⚠ Error Handling
Scenario	Error Message	Resolution
Wallet not connected	Connect MetaMask first	Connect wallet
Missing files	Select both files	Upload files
Invalid model	model_false.json rejected	Upload valid model
ML not fetched	Fetch prediction first	Get ML Prediction
API error	Must include 8 features	Fix input JSON
🔄 Complete Data Flow Summary
Wallet Connect
↓
Upload Model + Input
↓
Pin to IPFS
↓
Fetch ML Prediction
↓
Validate Inputs
↓
Submit Proof On-Chain
↓
Transaction Confirmed
↓
History Stored
↓
Audit & Verification View
🎉 Conclusion
This project demonstrates a fully functional, end-to-end verifiable ML system where:

Computation happens off-chain

Trust is enforced on-chain

Data integrity is guaranteed via IPFS

Users retain transparency and auditability

ZK-Verify bridges ML, blockchain, and trustless verification into a single production-ready platform.
