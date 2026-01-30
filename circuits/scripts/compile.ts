import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const BUILD_DIR = path.join(__dirname, '../build');
const CIRCUIT_NAME = 'inference';

async function main() {
    console.log('Compiling circuit...');
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR);
    }

    // 1. Compile Circuit to R1CS & WASM
    let circomCmd = 'circom';
    const localCircom = path.join(__dirname, '../../bin/circom.exe');
    if (fs.existsSync(localCircom)) {
        console.log('Using local circom binary:', localCircom);
        circomCmd = localCircom;
    }

    try {
        // Point to root node_modules for circomlib
        execSync(`${circomCmd} ${CIRCUIT_NAME}.circom -l ../node_modules -l node_modules --r1cs --wasm --sym --output build`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (e) {
        console.error("Circom compiler failed.");
        process.exit(1);
    }

    // 2. Setup Groth16 using snarkjs
    // We use the raw snarkjs CLI commands via execSync for simplicity in this script, or we could import snarkjs lib.
    // Using CLI is often robust for local setup scripts.
    const r1csPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
    const ptauPath = path.join(BUILD_DIR, 'powersOfTau28_hez_final_12.ptau');
    const zkeyPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}_0000.zkey`);
    const finalZkeyPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}_final.zkey`);
    const verifierKeyPath = path.join(BUILD_DIR, 'verification_key.json');
    const verifierSolPath = path.join(BUILD_DIR, 'Verifier.sol');

    // Generate PTAU locally (robust for hackathon, avoiding download issues)
    if (!fs.existsSync(ptauPath)) {
        console.log('Generating PTAU locally...');
        // 1. New Power of Tau
        execSync(`npx snarkjs powersoftau new bn128 12 ${ptauPath}`, { stdio: 'inherit' });
        // 2. We skip the ceremony contributions for dev MVP and just prepare phase 2? 
        // Actually for groth16 setup we need a prepared ptau.
        // Let's do a quick random contribution to make it valid for snarkjs expectations.
        const contribPath = path.join(BUILD_DIR, 'contrib.ptau');
        execSync(`npx snarkjs powersoftau contribute ${ptauPath} ${contribPath} --name="First" -v -e="random"`, { stdio: 'inherit' });

        // 3. Prepare Phase 2
        // We use the contrib file as the final ptau for setup
        // But for simplicity, we can just use the contrib path or rename it.
        // Let's use contribPath as the ptau input for setup.

        // Overwrite ptauPath with contribPath? Or just use contribPath.
        // SnarkJS setup needs `powersoftau prepare phase2` usually for Groth16?
        // Let's check docs. `snarkjs groth16 setup` takes a ptau file.
        // It should be phase2 prepared.

        const phase2Path = path.join(BUILD_DIR, 'phase2.ptau');
        execSync(`npx snarkjs powersoftau prepare phase2 ${contribPath} ${phase2Path} -v`, { stdio: 'inherit' });

        // Use phase2Path for setup
        // We will rename it to ptauPath to keep variables consistent if we want, 
        // OR just execute setup with phase2Path.
        fs.renameSync(phase2Path, ptauPath);
    }

    console.log('Generating zKey...');
    execSync(`npx snarkjs groth16 setup ${r1csPath} ${ptauPath} ${zkeyPath}`, { stdio: 'inherit' });

    console.log('Contributing to Phase 2...');
    execSync(`npx snarkjs zkey contribute ${zkeyPath} ${finalZkeyPath} --name="1st Contributor" -v -e="some random entropy"`, { stdio: 'inherit' });

    console.log('Exporting Verification Key...');
    execSync(`npx snarkjs zkey export verificationkey ${finalZkeyPath} ${verifierKeyPath}`, { stdio: 'inherit' });

    console.log('Generating Solidity Verifier...');
    execSync(`npx snarkjs zkey export solidityverifier ${finalZkeyPath} ${verifierSolPath}`, { stdio: 'inherit' });

    console.log('Done! Artifacts in /circuits/build');
}

main().catch(console.error);
