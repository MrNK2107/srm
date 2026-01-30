// @ts-ignore
import * as snarkjs from 'snarkjs';
import path from 'path';
import { ModelData, InputData, ProveResponse, computeHash, toCircomInput } from 'zk-verified-compute-shared';

// Mock Prover for Hackathon Demo if local ZK setup failed
export async function generateProof(model: ModelData, input: InputData): Promise<ProveResponse> {

    // 1. Compute Logic & Hashes (We still want valid logic for the demo!)
    const weightsBi = toCircomInput(model.weights);
    const biasBi = BigInt(model.bias);
    const xBi = toCircomInput(input.features);

    const modelHash = await computeHash([...weightsBi, biasBi]);
    const inputHash = await computeHash(xBi);

    // Compute dot product output
    let sum = BigInt(0);
    for (let i = 0; i < 8; i++) {
        sum += weightsBi[i] * xBi[i];
    }
    const total = sum + biasBi;
    const output = total >= BigInt(0) ? 1 : 0;

    console.log("Mock Proof Generation...");
    console.log("Computed Output:", output);

    // 2. Return Mock Proof
    // This proof format matches what SnarkJS returns, but with dummy values.
    // The Contract is also mocked to accept anything, so this works for the demo flow.

    const proof = {
        pi_a: ["0", "0", "1"],
        pi_b: [["0", "0"], ["0", "0"], ["1", "0"]],
        pi_c: ["0", "0", "1"],
        protocol: "groth16",
        curve: "bn128"
    };

    const publicSignals = [
        output.toString(),
        modelHash,
        inputHash
    ];

    return {
        // @ts-ignore
        proof,
        publicSignals,
        output,
        modelHash,
        inputHash
    };
}
