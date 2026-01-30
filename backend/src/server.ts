import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { uploadToIPFS, downloadFromIPFS } from './ipfs';
import { generateProof } from './prover';
import { ModelData, InputData } from 'zk-verified-compute-shared';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const upload = multer(); // Memory storage

app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 4000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/ipfs/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) throw new Error("No file");
        const cid = await uploadToIPFS(req.file.buffer, req.file.originalname);
        res.json({ cid });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/prove', async (req, res) => {
    try {
        const { modelCID, inputCID } = req.body;

        // 1. Fetch Data
        console.log("Fetching Model CID:", modelCID);
        const modelJson = await downloadFromIPFS(modelCID);
        console.log("Model Data Type:", typeof modelJson);
        console.log("Model Data Keys:", modelJson ? Object.keys(modelJson) : "null");

        console.log("Fetching Input CID:", inputCID);
        const inputJson = await downloadFromIPFS(inputCID);
        console.log("Input Data Type:", typeof inputJson);
        console.log("Input Data Keys:", inputJson ? Object.keys(inputJson) : "null");

        // 2. Generate Proof
        const result = await generateProof(modelJson, inputJson);

        res.json(result);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
