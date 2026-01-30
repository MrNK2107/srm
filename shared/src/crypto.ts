// @ts-ignore
const { buildPoseidon } = require('circomlibjs');

let poseidon: any;

export async function getPoseidon() {
    if (!poseidon) {
        poseidon = await buildPoseidon();
    }
    return poseidon;
}

export function bigIntToHex(val: bigint | string): string {
    let bi = BigInt(val);
    return '0x' + bi.toString(16);
}

// Convert a number array to BigInt array for Circom inputs
export function toCircomInput(arr: number[]): bigint[] {
    return arr.map(x => BigInt(x));
}

export async function computeHash(inputs: bigint[]): Promise<string> {
    const p = await getPoseidon();
    const hash = p(inputs);
    // Convert field element to decimal string (as expected by smart contract and SnarkJS public signals)
    const hashStr = p.F.toString(hash);
    return hashStr;
}
