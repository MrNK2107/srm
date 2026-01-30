
import dotenv from 'dotenv';
import path from 'path';
// @ts-ignore
import { uploadToIPFS } from '../backend/src/ipfs.ts'; // Direct TS file import
import * as fs from 'fs';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    console.log("Testing IPFS Upload...");
    console.log("PINATA_JWT configured:", !!process.env.PINATA_JWT);

    try {
        const buffer = Buffer.from("Hello World Debug");
        const cid = await uploadToIPFS(buffer, "debug.txt");
        console.log("Upload Success! CID:", cid);
    } catch (e: any) {
        console.error("Upload Failed!");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        } else {
            console.error(e);
        }
    }
}

main();
