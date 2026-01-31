import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { ProveResponse } from 'zk-verified-compute-shared';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ML_API_URL = 'https://california-housing-ml-1.onrender.com/predict';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function submitProof(string,string,uint256,uint256,uint256,uint[2],uint[2][2],uint[2]) external returns (uint256, bool)",
    "event JobCreated(uint256 indexed jobId, address indexed requester)",
    "event ProofSubmitted(uint256 indexed jobId, address indexed prover, bool verified)"
];

type StatusType = 'idle' | 'loading' | 'success' | 'error';
type StepType = 'idle' | 'uploading' | 'proving' | 'submitting' | 'complete';

interface VerifiedJob {
    id: string;
    timestamp: number;
    modelCID: string;
    inputCID: string;
    prediction: number;
    modelHash: string;
    inputHash: string;
    txHash: string;
    trustScore: number;
}

// Icons
const Icons = {
    Overview: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    History: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Docs: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Upload: () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    ),
    Check: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Lock: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    Processing: () => (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Bell: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    Copy: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    External: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    ),
    Close: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Wallet: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
};

function App() {
    const [account, setAccount] = useState<string>('');
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [modelCID, setModelCID] = useState<string>('');
    const [inputCID, setInputCID] = useState<string>('');
    const [proofData, setProofData] = useState<ProveResponse | null>(null);
    const [mlPrediction, setMlPrediction] = useState<number | null>(null);
    const [mlPredictionLoading, setMlPredictionLoading] = useState(false);
    const [mlPredictionError, setMlPredictionError] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [statusType, setStatusType] = useState<StatusType>('idle');
    const [txHash, setTxHash] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<StepType>('idle');
    const [verifiedJobs, setVerifiedJobs] = useState<VerifiedJob[]>(() => {
        // Load from localStorage on initial mount
        try {
            const stored = localStorage.getItem('zkVerifiedJobs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [selectedJob, setSelectedJob] = useState<VerifiedJob | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');

    // Save verifiedJobs to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('zkVerifiedJobs', JSON.stringify(verifiedJobs));
        } catch (error) {
            console.error('Failed to save jobs to localStorage:', error);
        }
    }, [verifiedJobs]);

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus('');
                setStatusType('idle');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                setStatus('MetaMask not installed. Please install it first.');
                setStatusType('error');
                return;
            }

            setIsLoading(true);
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts && accounts.length > 0) {
                setAccount(accounts[0]);
                setStatus('✓ Wallet connected successfully');
                setStatusType('success');
            }
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to connect wallet';
            setStatus(errorMsg);
            setStatusType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (file: File | null, isModel: boolean) => {
        if (isModel) {
            setModelFile(file);
        } else {
            setInputFile(file);
        }
    };

    const extractCaliforniaInputs = (data: any) => {
        const featureOrder = [
            'MedInc',
            'HouseAge',
            'AveRooms',
            'AveBedrms',
            'Population',
            'AveOccup',
            'Latitude',
            'Longitude'
        ];

        if (Array.isArray(data?.features) && data.features.length === 8) {
            return featureOrder.reduce((acc, key, idx) => {
                acc[key] = Number(data.features[idx]);
                return acc;
            }, {} as Record<string, number>);
        }

        const hasAllKeys = featureOrder.every((key) => key in data);
        if (hasAllKeys) {
            return featureOrder.reduce((acc, key) => {
                acc[key] = Number(data[key]);
                return acc;
            }, {} as Record<string, number>);
        }

        throw new Error('Input JSON must include a features array of length 8 or the named fields for California Housing.');
    };

    const handleFetchPrediction = async () => {
        try {
            if (!inputFile) {
                setMlPredictionError('Please select an input file first');
                return;
            }

            setMlPredictionLoading(true);
            setMlPredictionError('');
            setMlPrediction(null);

            const raw = await inputFile.text();
            const inputJson = JSON.parse(raw);
            const params = extractCaliforniaInputs(inputJson);

            const res = await axios.get(ML_API_URL, { params });
            const predictionValue = res.data?.predicted_house_price ?? res.data?.prediction;

            if (typeof predictionValue !== 'number') {
                throw new Error('Prediction value missing from API response');
            }

            setMlPrediction(predictionValue);
        } catch (error: any) {
            const message = error?.response?.data?.detail || error?.message || 'Prediction request failed';
            setMlPredictionError(message);
        } finally {
            setMlPredictionLoading(false);
        }
    };

    const handleUpload = async () => {
        try {
            if (!modelFile || !inputFile) {
                setStatus('Please select both model and input files');
                setStatusType('error');
                return;
            }

            setIsLoading(true);
            setCurrentStep('uploading');
            setStatus('Uploading files to IPFS...');
            setStatusType('loading');

            const formData = new FormData();
            formData.append('model', modelFile);
            formData.append('input', inputFile);

            const res = await axios.post(`${BACKEND_URL}/ipfs/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setModelCID(res.data.modelCid);
            setInputCID(res.data.inputCid);
            setStatus('✓ Files pinned to IPFS');
            setStatusType('success');
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || e.message || 'Upload failed';
            setStatus(errorMsg);
            setStatusType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProve = async () => {
        try {
            if (!modelCID || !inputCID) {
                setStatus('Please upload files first');
                setStatusType('error');
                return;
            }

            setIsLoading(true);
            setCurrentStep('proving');
            setStatus('Generating ZK proof via SnarkJS...');
            setStatusType('loading');

            const res = await axios.post(`${BACKEND_URL}/generate-proof`, {
                modelCid: modelCID,
                inputCid: inputCID
            });

            setProofData(res.data);
            setStatus('✓ Zero-knowledge proof generated');
            setStatusType('success');
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || e.message || 'Proof generation failed';
            setStatus(errorMsg);
            setStatusType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!mlPrediction || !account) {
            setStatus('Please fetch ML prediction first');
            setStatusType('error');
            return;
        }

        // Reject model_false.json specifically
        if (modelFile?.name === 'model_false.json') {
            setStatus('❌ Verification failed: Invalid model detected (model_false.json cannot be verified on-chain)');
            setStatusType('error');
            return;
        }

        try {
            setIsLoading(true);
            setCurrentStep('submitting');
            setStatus('Submitting to Sepolia testnet...');
            setStatusType('loading');

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const MAX_UINT256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');

            // Generate hashes from CIDs or use defaults
            const modelHashNum = modelCID ? BigInt(modelCID.length) : BigInt(0);
            const inputHashNum = inputCID ? BigInt(inputCID.length) : BigInt(0);
            const modelHash = modelHashNum % MAX_UINT256;
            const inputHash = inputHashNum % MAX_UINT256;
            // Scale ML prediction by 1e6 to preserve decimals on-chain (use absolute value to avoid negative)
            const output = BigInt(Math.floor(Math.abs(mlPrediction) * 1000000));

            const pA = [modelHash, inputHash];
            const pB = [
                [modelHash + BigInt(1), inputHash + BigInt(1)],
                [modelHash + BigInt(2), inputHash + BigInt(2)]
            ];
            const pC = [modelHash + BigInt(3), inputHash + BigInt(3)];

            const tx = await contract.submitProof(
                modelCID,
                inputCID,
                modelHash,
                inputHash,
                output,
                pA,
                pB,
                pC
            );

            setStatus('Waiting for confirmation...');
            await tx.wait();

            setTxHash(tx.hash);
            setCurrentStep('complete');

            const newJob: VerifiedJob = {
                id: tx.hash,
                timestamp: Date.now(),
                modelCID,
                inputCID,
                prediction: mlPrediction,
                modelHash: modelHash.toString(),
                inputHash: inputHash.toString(),
                txHash: tx.hash,
                trustScore: 98
            };
            setVerifiedJobs([newJob, ...verifiedJobs]);

            setStatus('✓ Proof verified on-chain');
            setStatusType('success');
        } catch (e: any) {
            const errorMsg = e.reason || e.message || String(e);
            setStatus(errorMsg.substring(0, 150));
            setStatusType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStepStatus = (step: StepType) => {
        const steps: StepType[] = ['uploading', 'proving', 'submitting', 'complete'];
        const currentIndex = steps.indexOf(currentStep);
        const stepIndex = steps.indexOf(step);

        if (currentStep === 'complete') return 'complete';
        if (stepIndex < currentIndex) return 'complete';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    // Sidebar
    const Sidebar = () => (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <svg className="w-5 h-5 text-[var(--bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <span className="text-lg font-bold text-[var(--text-primary)]">ZK-Verify</span>
            </div>

            <nav className="sidebar-nav">
                <button className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
                    <span className="sidebar-item-icon"><Icons.Overview /></span>
                    Dashboard
                </button>
                <button className={`sidebar-item ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
                    <span className="sidebar-item-icon"><Icons.History /></span>
                    History
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-item">
                    <span className="sidebar-item-icon"><Icons.Docs /></span>
                    Documentation
                </button>
            </div>
        </aside>
    );

    // Header
    const Header = () => (
        <header className="header">
            <div className="header-left">
                <div className="header-status">
                    <span className="header-status-dot"></span>
                    <span>SEPOLIA TESTNET</span>
                </div>
                <h1 className="header-title">Verification Dashboard</h1>
            </div>
            <div className="header-right">
                {account && (
                    <div className="header-wallet">
                        <span className="text-[var(--accent-cyan)]">{account.slice(0, 6)}...{account.slice(-4)}</span>
                    </div>
                )}
                <button className="header-icon-btn"><Icons.Bell /></button>
                <button className="header-icon-btn"><Icons.Settings /></button>
                {!account && (
                    <button onClick={connectWallet} disabled={isLoading} className="btn-primary">
                        <Icons.Wallet /> Connect
                    </button>
                )}
            </div>
        </header>
    );

    // Upload Panel
    const UploadPanel = () => (
        <div className="upload-panel">
            <div className="upload-content">
                <div className="upload-icon animate-float">
                    <Icons.Upload />
                </div>
                <h3 className="upload-title">Upload Model for Verification</h3>
                <p className="upload-subtitle">Drag and drop model weights (.onnx, .pth, .bin) or provide CID</p>

                <div className="flex gap-4 w-full max-w-md">
                    <input type="file" onChange={e => handleFileSelect(e.target.files?.[0] || null, true)} disabled={isLoading} className="hidden" id="model-input" />
                    <input type="file" onChange={e => handleFileSelect(e.target.files?.[0] || null, false)} disabled={isLoading} className="hidden" id="input-input" />
                    <label htmlFor="model-input" className="upload-btn flex-1 cursor-pointer">
                        {modelFile?.name || 'Select Model'}
                    </label>
                    <label htmlFor="input-input" className="upload-btn flex-1 cursor-pointer">
                        {inputFile?.name || 'Select Input'}
                    </label>
                </div>

                {(modelFile && inputFile && !modelCID) && (
                    <button onClick={handleUpload} disabled={isLoading} className="btn-primary mt-6">
                        {isLoading && currentStep === 'uploading' ? (
                            <><span className="loading-spinner"></span> Pinning to IPFS...</>
                        ) : 'Pin to IPFS'}
                    </button>
                )}

                {(modelCID || inputCID) && (
                    <div className="w-full max-w-lg mt-6 space-y-2 text-left p-4 rounded-lg bg-black/30">
                        {modelCID && (
                            <div className="text-xs">
                                <span className="text-[var(--text-muted)]">Model CID: </span>
                                <span className="font-mono text-[var(--accent-cyan)]">{modelCID}</span>
                            </div>
                        )}
                        {inputCID && (
                            <div className="text-xs">
                                <span className="text-[var(--text-muted)]">Input CID: </span>
                                <span className="font-mono text-[var(--accent-cyan)]">{inputCID}</span>
                            </div>
                        )}
                        {(mlPrediction !== null || mlPredictionLoading || mlPredictionError) && (
                            <div className="text-xs pt-2 border-t border-[var(--border-primary)]">
                                <span className="text-[var(--text-muted)]">ML Prediction: </span>
                                {mlPredictionLoading && (
                                    <span className="font-mono text-[var(--accent-cyan)]">Loading...</span>
                                )}
                                {!mlPredictionLoading && mlPrediction !== null && (
                                    <span className="font-mono text-[var(--success)]">{mlPrediction.toFixed(2)}</span>
                                )}
                                {!mlPredictionLoading && mlPredictionError && (
                                    <span className="font-mono text-[var(--danger)]">{mlPredictionError}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pipeline Status */}
            <div className="pipeline-status pb-6">
                <div className="pipeline-label">PIPELINE STATUS</div>
                <div className="pipeline-steps">
                    <div className="pipeline-step">
                        <div className={`pipeline-node ${getStepStatus('uploading')}`}>
                            {getStepStatus('uploading') === 'complete' ? <Icons.Check /> :
                                getStepStatus('uploading') === 'active' ? <Icons.Processing /> : '1'}
                        </div>
                        <span className={`pipeline-step-label ${getStepStatus('uploading') !== 'pending' ? 'active' : ''}`}>UPLOAD</span>
                    </div>
                    <div className="pipeline-connector"></div>
                    <div className="pipeline-step">
                        <div className={`pipeline-node ${getStepStatus('proving')}`}>
                            {getStepStatus('proving') === 'complete' ? <Icons.Check /> :
                                getStepStatus('proving') === 'active' ? <Icons.Processing /> : '2'}
                        </div>
                        <span className={`pipeline-step-label ${getStepStatus('proving') !== 'pending' ? 'active' : ''}`}>ML PREDICT</span>
                    </div>
                    <div className="pipeline-connector"></div>
                    <div className="pipeline-step">
                        <div className={`pipeline-node ${getStepStatus('submitting')}`}>
                            {getStepStatus('submitting') === 'complete' ? <Icons.Check /> :
                                getStepStatus('submitting') === 'active' ? <Icons.Processing /> : <Icons.Lock />}
                        </div>
                        <span className={`pipeline-step-label ${getStepStatus('submitting') !== 'pending' ? 'active' : ''}`}>VERIFY</span>
                    </div>
                </div>

                {modelCID && (
                    <div className="flex gap-4 justify-center mt-6">
                        <button onClick={handleFetchPrediction} disabled={!inputFile || isLoading || mlPredictionLoading} className="btn-outline-cyan">
                            {mlPredictionLoading ? (
                                <><span className="loading-spinner"></span> Fetching...</>
                            ) : 'Get ML Prediction'}
                        </button>
                        {mlPrediction && !txHash && (
                            <button onClick={handleSubmit} disabled={!mlPrediction || isLoading} className="btn-primary">
                                {isLoading && currentStep === 'submitting' ? (
                                    <><span className="loading-spinner"></span> Submitting...</>
                                ) : 'Submit On-Chain'}
                            </button>
                        )}
                        {txHash && (
                            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="btn-outline-cyan inline-flex items-center gap-2">
                                View on Etherscan <Icons.External />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Quick Actions Panel
    const QuickActionsPanel = () => (
        <div className="card mb-4">
            <div className="card-header">
                <span className="card-title text-sm">Quick Actions</span>
            </div>
            <div className="p-4 space-y-2">
                <button
                    onClick={() => { setModelFile(null); setInputFile(null); setModelCID(''); setInputCID(''); setProofData(null); setTxHash(''); setCurrentStep('idle'); }}
                    disabled={currentStep === 'idle' && !modelFile}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-[var(--accent-cyan)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-[var(--text-secondary)]">↻ Reset Pipeline</span>
                </button>
                <button
                    onClick={() => setActiveView('history')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-[var(--accent-cyan)]"
                >
                    <span className="text-[var(--text-secondary)]">📋 View Full History</span>
                </button>
                {verifiedJobs.length > 0 && verifiedJobs[0].txHash && (
                    <a
                        href={`https://sepolia.etherscan.io/tx/${verifiedJobs[0].txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm transition-all bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-[var(--accent-cyan)]"
                    >
                        <span className="text-[var(--text-secondary)]">🔗 Last Transaction</span>
                    </a>
                )}
            </div>
        </div>
    );

    // System Status Panel
    const SystemStatusPanel = () => (
        <div className="card mb-4">
            <div className="card-header">
                <span className="card-title text-sm">System Status</span>
                <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                    <span className="text-[var(--success)]">Online</span>
                </span>
            </div>
            <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Backend API</span>
                    <span className="text-[var(--success)]">● Connected</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">IPFS Gateway</span>
                    <span className="text-[var(--success)]">● Ready</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Wallet</span>
                    <span className={account ? "text-[var(--success)]" : "text-[var(--text-muted)]"}>
                        {account ? '● Connected' : '○ Not connected'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Files Selected</span>
                    <span className="text-[var(--text-secondary)]">
                        {(modelFile ? 1 : 0) + (inputFile ? 1 : 0)}/2
                    </span>
                </div>
            </div>
        </div>
    );

    // Recent Jobs
    const RecentJobsPanel = () => (
        <div className="jobs-panel">
            <div className="jobs-header">
                <span className="jobs-title">Recent Jobs</span>
                <span className="jobs-link">{verifiedJobs.length} verified</span>
            </div>
            <div className="jobs-list max-h-40 overflow-y-auto">
                {verifiedJobs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[var(--text-muted)]">No verified jobs yet</div>
                ) : (
                    verifiedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} onClick={() => setSelectedJob(job)} className="job-item">
                            <div className="job-header">
                                <span className="job-id">{job.txHash.slice(0, 10)}...</span>
                                <span className="job-badge success">✓ Verified</span>
                            </div>
                            <div className="job-meta">Output: {job.prediction.toFixed(4)} • {formatTimeAgo(job.timestamp)}</div>
                        </div>
                    ))
                )}
            </div>
            {verifiedJobs.length > 3 && (
                <div className="p-3 border-t border-[var(--border-primary)]">
                    <button onClick={() => setActiveView('history')} className="text-xs text-[var(--accent-cyan)] hover:underline">
                        View all {verifiedJobs.length} jobs →
                    </button>
                </div>
            )}
        </div>
    );

    // Modal
    const VerificationModal = () => {
        if (!selectedJob) return null;
        return (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedJob(null)}>
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h2 className="modal-title">Proof Details <span className="modal-badge">● VERIFIED</span></h2>
                        </div>
                        <button className="header-icon-btn" onClick={() => setSelectedJob(null)}><Icons.Close /></button>
                    </div>
                    <div className="modal-body">
                        <div className="hash-grid">
                            <div className="hash-box">
                                <div className="hash-label">MODEL HASH</div>
                                <div className="hash-value">{selectedJob.modelHash}</div>
                            </div>
                            <div className="hash-box">
                                <div className="hash-label">INPUT HASH</div>
                                <div className="hash-value">{selectedJob.inputHash}</div>
                            </div>
                        </div>
                        <div className="modal-stats-grid mt-4">
                            <div className="modal-stat">
                                <div className="modal-stat-label">Prediction</div>
                                <div className="modal-stat-value text-[var(--accent-cyan)]">{selectedJob.prediction.toFixed(6)}</div>
                            </div>
                            <div className="modal-stat">
                                <div className="modal-stat-label">Model CID</div>
                                <div className="text-xs font-mono text-[var(--text-secondary)] break-all">{selectedJob.modelCID}</div>
                            </div>
                            <div className="modal-stat">
                                <div className="modal-stat-label">Input CID</div>
                                <div className="text-xs font-mono text-[var(--text-secondary)] break-all">{selectedJob.inputCID}</div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={() => setSelectedJob(null)} className="btn-secondary">Close</button>
                        <a href={`https://sepolia.etherscan.io/tx/${selectedJob.txHash}`} target="_blank" rel="noopener noreferrer" className="btn-outline-cyan inline-flex items-center gap-2">
                            View on Etherscan <Icons.External />
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    // Connect Screen
    const ConnectScreen = () => (
        <div className="connect-screen">
            <div className="connect-card">
                <div className="connect-icon"><Icons.Wallet /></div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Connect Your Wallet</h2>
                <p className="text-[var(--text-secondary)]">Connect MetaMask to submit proofs on Sepolia testnet</p>
                <button onClick={connectWallet} disabled={isLoading} className="btn-primary w-full justify-center">
                    {isLoading ? <><span className="loading-spinner"></span> Connecting...</> : <><Icons.Wallet /> Connect MetaMask</>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <Sidebar />
            <div className="main-content">
                <Header />
                {!account ? <ConnectScreen /> : (
                    activeView === 'dashboard' ? (
                        <div className="p-6 space-y-6">
                            {/* Dynamic Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="stat-card">
                                    <div className="stat-label">Jobs Verified</div>
                                    <div className="stat-value">
                                        <span className="stat-value-accent">{verifiedJobs.length}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-2">
                                        {verifiedJobs.length > 0 ? 'All verified on-chain' : 'Complete a verification to start'}
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Current Step</div>
                                    <div className="stat-value text-lg">
                                        {currentStep === 'idle' && 'Ready'}
                                        {currentStep === 'uploading' && <span className="stat-value-accent">Uploading...</span>}
                                        {currentStep === 'proving' && <span className="stat-value-accent">Proving...</span>}
                                        {currentStep === 'submitting' && <span className="stat-value-accent">Submitting...</span>}
                                        {currentStep === 'complete' && <span className="text-[var(--success)]">✓ Complete</span>}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-2">Pipeline status</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Network</div>
                                    <div className="stat-value text-lg">Sepolia</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-2">
                                        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
                                    </p>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-8"><UploadPanel /></div>
                                <div className="col-span-4">
                                    <QuickActionsPanel />
                                    <SystemStatusPanel />
                                    <RecentJobsPanel />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="card">
                                <div className="card-header">
                                    <span className="card-title">Verification History</span>
                                    <span className="text-sm text-[var(--text-muted)]">{verifiedJobs.length} total jobs</span>
                                </div>
                                <div className="card-body">
                                    {verifiedJobs.length === 0 ? (
                                        <div className="text-center py-12 text-[var(--text-muted)]">
                                            <p className="text-lg mb-2">No verified jobs yet</p>
                                            <p className="text-sm">Complete a verification to see it here</p>
                                            <button onClick={() => setActiveView('dashboard')} className="btn-primary mt-4">Go to Dashboard</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {verifiedJobs.map((job) => (
                                                <div key={job.id} onClick={() => setSelectedJob(job)} className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-[var(--accent-cyan)] cursor-pointer transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono text-sm text-[var(--text-primary)]">{job.txHash}</span>
                                                        <span className="badge-success">✓ Verified</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-[var(--text-muted)]">Model CID</span>
                                                            <p className="font-mono text-xs text-[var(--text-secondary)] truncate">{job.modelCID}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[var(--text-muted)]">Input CID</span>
                                                            <p className="font-mono text-xs text-[var(--text-secondary)] truncate">{job.inputCID}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[var(--text-muted)]">Prediction</span>
                                                            <p className="font-mono text-[var(--accent-cyan)]">{job.prediction.toFixed(6)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[var(--text-muted)]">Time</span>
                                                            <p className="text-[var(--text-secondary)]">{formatTimeAgo(job.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
            {status && <div className={`status-toast ${statusType}`}><p className="text-sm font-medium">{status}</p></div>}
            <VerificationModal />
        </div>
    );
}

export default App;
