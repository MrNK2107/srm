
// @ts-ignore
import { generateProof } from '../backend/src/prover.ts';
import { ModelData, InputData } from '../shared/src/types.ts';

async function main() {
    console.log("Testing Prover Logic...");

    const model: ModelData = {
        weights: [1, 2, 3, 4, 5, 6, 7, 8],
        bias: 0
    };

    const input: InputData = {
        features: [1, 0, 1, 0, 1, 0, 1, 0]
    };

    try {
        const result = await generateProof(model, input);
        console.log("Proof Generation Success!");
        console.log("Output:", result.output);
        console.log("Model Hash:", result.modelHash);
    } catch (e) {
        console.error("Prover Failed:");
        console.error(e);
    }
}

main();
