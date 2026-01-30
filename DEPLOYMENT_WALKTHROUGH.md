# Contract Deployment Walkthrough

This guide details how to deploy your smart contracts to the Sepolia testnet and "get the contract address" for your `.env` file.

## Prerequisites
Before you begin, ensure your `.env` file has:
1.  `SEPOLIA_RPC_URL`: A valid URL (e.g., from Alchemy, Infura, or Ankr).
2.  `PRIVATE_KEY`: The private key of a wallet **that has Sepolia ETH**.

> [!TIP]
> **Need Sepolia ETH?**
> Visit [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/) or [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) to get free testnet tokens. Deployment costs gas!

## Step 1: Run the Deploy Script
Open your terminal in **your current folder** (`c:\Users\admin\Desktop\srm`):

```bash
npm run deploy:contracts
```

**What happens next?**
1.  Hardhat compiles your Solidity contracts (`Verifier.sol` and `VerifiableCompute.sol`).
2.  It sends a transaction to the Sepolia network using your `PRIVATE_KEY`.
3.  It waits for the transaction to be confirmed (mined).

## Step 2: Find the Address in Output
Once the command finishes (it may take 15-30 seconds), looking for the output like this:

```text
Deploying contracts with the account: 0xYourWalletAddress...
Verifier deployed to: 0x1111111111111111111111111111111111111111
VerifiableCompute deployed to: 0x9999999999999999999999999999999999999999

Copy this address to your .env file as CONTRACT_ADDRESS:
0x9999999999999999999999999999999999999999
```

## Step 3: Update .env
1.  Copy the address under "VerifiableCompute deployed to".
2.  Open your `.env` file.
3.  Paste it into **two** places:
    ```env
    CONTRACT_ADDRESS=0x9999...
    # ...
    # Frontend section
    VITE_CONTRACT_ADDRESS=0x9999...
    ```
4.  Save the `.env` file.

## Troubleshooting
- **"Insufficient funds"**: Your wallet is empty. Get Sepolia ETH from a faucet.
- **"ProviderError: ... unauthorized"**: Your `SEPOLIA_RPC_URL` might be invalid or the API key is wrong. Try a public one like `https://rpc.ankr.com/eth_sepolia`.
- **"Verifier.sol not found"**: Ensure you have successfully compiled the circuits or (for this hackathon demo) the mock verifier is present in `contracts/contracts/`.
