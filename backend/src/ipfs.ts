import axios from 'axios';
import FormData from 'form-data';

// Basic Pinata integration via axios to avoid complex SDK setup if preferred, 
// using generic gateway for download.

// Default to a public gateway if env not set
const getGateway = () => process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

export async function uploadToIPFS(buffer: Buffer, filename: string): Promise<string> {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("PINATA_JWT not configured");

    const data = new FormData();
    data.append('file', buffer, filename);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers: {
            'Authorization': `Bearer ${jwt}`,
            ...data.getHeaders()
        }
    });
    return res.data.IpfsHash;
}

export async function downloadFromIPFS(cid: string): Promise<any> {
    const url = `${getGateway()}${cid}`;
    const res = await axios.get(url);
    return res.data;
}
