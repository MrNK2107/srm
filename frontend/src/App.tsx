import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { ProveResponse } from 'zk-verified-compute-shared';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function submitProof(string,string,uint256,uint256,uint256,uint[2],uint[2][2],uint[2]) external returns (uint256, bool)",
    "event JobCreated(uint256 indexed jobId, address indexed requester)",
    "event ProofSubmitted(uint256 indexed jobId, address indexed prover, bool verified)"
];

function App() {
    const [account, setAccount] = useState<string>('');
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [modelCID, setModelCID] = useState<string>('');
    const [inputCID, setInputCID] = useState<string>('');
    const [proofData, setProofData] = useState<ProveResponse | null>(null);
    const [status, setStatus] = useState<string>('');
    const [txHash, setTxHash] = useState<string>('');

    const connectWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            setAccount(await signer.getAddress());
        } else {
            alert("Install MetaMask");
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${BACKEND_URL}/ipfs/upload`, formData);
        return res.data.cid;
    };

    const handleUpload = async () => {
        try {
            setStatus('Uploading to IPFS...');
            if (!modelFile || !inputFile) return alert("Select files");

            const mCid = await uploadFile(modelFile);
            setModelCID(mCid);

            const iCid = await uploadFile(inputFile);
            setInputCID(iCid);

            setStatus('Uploaded! Ready to prove.');
        } catch (e: any) {
            setStatus('Error: ' + e.message);
        }
    };

    const handleProve = async () => {
        try {
            setStatus('Generating Proof (off-chain)...');
            const res = await axios.post(`${BACKEND_URL}/prove`, { modelCID, inputCID });
            setProofData(res.data);
            setStatus('Proof Generated! Ready to verify on-chain.');
        } catch (e: any) {
            setStatus('Error: ' + e.message);
        }
    };

    const handleSubmit = async () => {
        if (!proofData || !account) return;
        try {
            setStatus('Submitting to Sepolia...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Prepare args for submitProof(modelCID, inputCID, modelHash, inputHash, output, pA, pB, pC)
            const p = proofData.proof;

            console.log("Proof data:", proofData);
            console.log("Submitting with:", {
                modelCID,
                inputCID,
                modelHash: proofData.modelHash,
                inputHash: proofData.inputHash,
                output: proofData.output
            });

            // Format proof arrays - take first 2 elements as uint[2]
            const pA = [p.pi_a[0], p.pi_a[1]];
            const pB = [p.pi_b[0].slice(0, 2), p.pi_b[1].slice(0, 2)]; // uint[2][2]
            const pC = [p.pi_c[0], p.pi_c[1]];

            const tx = await contract.submitProof(
                modelCID,
                inputCID,
                proofData.modelHash,
                proofData.inputHash,
                proofData.output,
                pA,
                pB,
                pC
            );

            setStatus('Transaction sent! Waiting for confirmation...');
            const receipt = await tx.wait();
            setTxHash(tx.hash);
            setStatus('Verified On-Chain! ✅');
            console.log("Transaction successful:", receipt);
        } catch (e: any) {
            console.error("Transaction error:", e);
            // Extract meaningful error message
            const errorMsg = e.reason || e.message || String(e);
            setStatus('Error: ' + errorMsg.substring(0, 100));
        }
    };

    return (
        <div className="min-h-screen p-8 bg-slate-900 text-slate-100 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                ZK Verified Compute
            </h1>

            {!account ? (
                <button onClick={connectWallet} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500">
                    Connect Wallet
                </button>
            ) : (
                <div className="w-full max-w-2xl space-y-8">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4">1. Data Upload</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block mb-2">Model (JSON)</label>
                                <input type="file" onChange={e => setModelFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                "/>
                            </div>
                            <div>
                                <label className="block mb-2">Input (JSON)</label>
                                <input type="file" onChange={e => setInputFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700
                "/>
                            </div>
                            <button onClick={handleUpload} disabled={!modelFile || !inputFile} className="bg-slate-700 py-2 rounded hover:bg-slate-600 disabled:opacity-50">
                                Upload to IPFS
                            </button>
                        </div>
                        {modelCID && <div className="mt-2 text-xs text-green-400">Model CID: {modelCID}</div>}
                        {inputCID && <div className="mt-1 text-xs text-green-400">Input CID: {inputCID}</div>}
                    </div>

                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4">2. Compute & Prove</h2>
                        <button onClick={handleProve} disabled={!modelCID} className="w-full bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-500 disabled:opacity-50">
                            Generate ZK Proof
                        </button>
                        {proofData && (
                            <div className="mt-4 p-4 bg-slate-900 rounded font-mono text-xs overflow-auto max-h-40">
                                <p className="text-green-400">Proof Generated!</p>
                                <p>Output: {proofData.output}</p>
                                <p>Model Hash: {proofData.modelHash}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4">3. Verify On-Chain</h2>
                        <button onClick={handleSubmit} disabled={!proofData} className="w-full bg-emerald-600 py-3 rounded font-bold hover:bg-emerald-500 disabled:opacity-50">
                            Submit to Sepolia
                        </button>
                        {txHash && (
                            <div className="mt-4">
                                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="text-blue-400 hover:underline">
                                    View Transaction: {txHash.slice(0, 10)}...
                                </a>
                            </div>
                        )}
                    </div>

                    {status && (
                        <div className="fixed bottom-4 right-4 bg-slate-800 border border-blue-500 px-6 py-3 rounded shadow-lg animate-pulse">
                            {status}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default App
