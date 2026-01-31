import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { uploadToIPFS, downloadFromIPFS } from './ipfs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Store latest uploaded CIDs
interface UploadSession {
  modelCid: string;
  inputCid: string;
  timestamp: number;
}

let latestUpload: UploadSession | null = null;

// Hardcoded ML Model (Simple Linear Regression)
const HARDCODED_MODEL = {
  modelType: 'linear_regression',
  weights: [0.5, 1.2, -0.3, 0.8, 0.9],
  bias: 10.5,
  description: 'Pretrained linear regression model with 5 features'
};

// Hardcoded Input Data
const HARDCODED_INPUT = {
  features: [1.5, 2.3, 0.8, 1.1, 0.5],
  description: 'Sample input with 5 features'
};

function detectModelType(modelData: any): string {
  console.log('Detecting model type for:', typeof modelData, Object.keys(modelData || {}));
  
  if (!modelData || typeof modelData !== 'object') {
    return 'unknown';
  }

  if (modelData.modelType) return modelData.modelType;
  
  if (modelData.weights && Array.isArray(modelData.weights) && typeof modelData.bias === 'number') {
    return 'linear_regression';
  }
  
  if (modelData.coef_ && modelData.intercept_) {
    return 'sklearn_linear';
  }

  // If it has numeric arrays, might be weights
  const keys = Object.keys(modelData);
  if (keys.length > 0 && (keys.includes('weights') || keys.includes('coef_'))) {
    console.log('Found weight-like keys:', keys);
    return 'linear_regression';
  }
  
  return 'unknown';
}

function processModel(modelData: any, features: number[]): number {
  const modelType = detectModelType(modelData);

  if (modelType === 'linear_regression' || modelType === 'sklearn_linear') {
    const weights = modelData.weights || modelData.coef_;
    const bias = modelData.bias || modelData.intercept_;

    if (!Array.isArray(weights)) {
      throw new Error('Model weights must be an array');
    }
    if (weights.length !== features.length) {
      throw new Error(`Dimension mismatch: ${weights.length} weights but ${features.length} features`);
    }

    let prediction = bias;
    for (let i = 0; i < weights.length; i++) {
      prediction += weights[i] * features[i];
    }
    return prediction;
  }

  throw new Error(`Unsupported model type: ${modelType}`);
}

// Upload endpoint - uses Pinata via uploadToIPFS
app.post('/ipfs/upload', upload.fields([{ name: 'model' }, { name: 'input' }]), async (req, res) => {
  try {
    if (!req.files || !('model' in req.files) || !('input' in req.files)) {
      return res.status(400).json({ error: 'Both model and input files required' });
    }

    const modelFile = (req.files.model as Express.Multer.File[])[0];
    const inputFile = (req.files.input as Express.Multer.File[])[0];

    const modelCid = await uploadToIPFS(modelFile.buffer, modelFile.originalname);
    const inputCid = await uploadToIPFS(inputFile.buffer, inputFile.originalname);

    latestUpload = {
      modelCid,
      inputCid,
      timestamp: Date.now(),
    };

    console.log(`✅ Uploaded to Pinata - Model: ${modelCid}, Input: ${inputCid}`);

    res.json({
      modelCid,
      inputCid,
      message: 'Files uploaded to Pinata successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Upload failed: ${error}` });
  }
});

// Generate proof endpoint - uses hardcoded model and input (no IPFS required)
app.post('/generate-proof', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Check if user wants to use custom input or defaults to hardcoded
    let useHardcodedInput = !req.body.inputCid;
    let inputData: any = useHardcodedInput ? HARDCODED_INPUT : null;
    let inputCid = req.body.inputCid || 'hardcoded';

    // Use hardcoded model
    console.log('📦 Using hardcoded ML model');
    let modelData = HARDCODED_MODEL;
    let modelCid = 'hardcoded';
    
    // Fetch input from IPFS if CID provided, otherwise use hardcoded
    if (req.body.inputCid && !useHardcodedInput) {
      console.log(`📥 Fetching Input CID: ${req.body.inputCid}`);
      inputData = await downloadFromIPFS(req.body.inputCid);
      inputCid = req.body.inputCid;

      // Parse input if string
      if (typeof inputData === 'string') {
        try {
          inputData = JSON.parse(inputData);
        } catch (parseError) {
          console.error('❌ JSON parse error for input:', parseError);
          throw new Error(`Failed to parse input data: ${parseError}`);
        }
      }
    } else {
      console.log('📦 Using hardcoded input data');
    }

    console.log('📋 Model Data:', modelData);
    console.log('📋 Input Data:', inputData);

    // Validate input
    if (!inputData || !inputData.features || !Array.isArray(inputData.features)) {
      return res.status(400).json({ error: 'Invalid input: missing features array' });
    }

    const features = inputData.features as number[];
    
    // Process model and compute prediction
    console.log('🔧 Processing model...');
    const prediction = processModel(modelData, features);
    
    console.log(`✅ Prediction computed: ${prediction}`);

    // Generate proof
    const proofHash = Buffer.from(
      `proof_${modelCid}_${inputCid}_${Date.now()}`
    ).toString('hex');

    res.json({
      proof: proofHash,
      prediction,
      modelCid,
      inputCid,
      output: prediction,
      modelHash: parseInt(proofHash.slice(0, 16), 16),
      inputHash: parseInt(proofHash.slice(16, 32), 16),
    });
  } catch (error) {
    console.error('❌ Error generating proof:', error);
    res.status(500).json({ error: `Proof generation failed: ${error}` });
  }
});

const PORT = process.env.BACKEND_PORT || 45000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
