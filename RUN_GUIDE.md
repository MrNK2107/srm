# How to Run the Project

## 1. Start the Backend
Open a new terminal in the `srm` folder:

```bash
npm run dev:backend
```

It should say `Backend running on port 4000`.

## 2. Start the Frontend
Open **another** terminal in the `srm` folder:

```bash
npm run dev:frontend
```

It will show a local URL, usually `http://localhost:5173`.
Open that URL in your browser.

## 3. Demo Steps
1.  **Connect Wallet**: Click the button in the top right.
2.  **Upload Files**:
    - You can use the example files in `circuits/input.json` (pretend one is model, one is input, or create simple jsons).
    - Example `model.json`: `{ "weights": [1,2,3,4,5,6,7,8], "bias": 0 }`
    - Example `input.json`: `{ "features": [1,0,1,0,1,0,1,0] }`
3.  **Generate Proof**: Click "Generate ZK Proof".
    - *Note: Since we are in Hackathon Mode with a Mock Verifier, this generates a dummy proof instantly.*
4.  **Submit**: Click "Submit to Sepolia".
5.  **Verify**: Click the Etherscan link to see your "Verified" transaction on chain!
