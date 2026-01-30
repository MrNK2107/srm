
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    if (!deployer) {
        console.error("ERROR: No account found. Please Check your .env file.");
        console.error("Make sure PRIVATE_KEY is set and valid.");
        process.exit(1);
    }

    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Verifier
    // We expect Verifier.sol to be present in contracts/contracts (copied from circuits/build)
    // Ensure we have compiled it first.

    // NOTE: If Verifier.sol is not yet compiled by Hardhat, we might fail here.
    // We assume the user runs `npm run compile` in contracts workspace after copying the verifier.

    const VerifierFactory = await ethers.getContractFactory("Verifier");
    const verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();
    console.log("Verifier deployed to:", verifierAddr);

    // 2. Deploy VerifiableCompute
    const VerifiableComputeFactory = await ethers.getContractFactory("VerifiableCompute");
    const verifiableCompute = await VerifiableComputeFactory.deploy(verifierAddr);
    await verifiableCompute.waitForDeployment();
    const vcAddr = await verifiableCompute.getAddress();
    console.log("VerifiableCompute deployed to:", vcAddr);

    // Save address to .env??? Or just log it.
    console.log("\nCopy this address to your .env file as CONTRACT_ADDRESS:");
    console.log(vcAddr);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
