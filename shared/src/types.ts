export interface JobRecord {
    jobId: string;
    requester: string;
    inputCID: string;
    inputHash: string;
    modelCID: string;
    modelHash: string;
    output: number;
    status: 'PENDING' | 'VERIFIED' | 'INVALID';
    timestamp: number;
    txHash?: string;
}

export interface ModelData {
    weights: number[]; // size 8
    bias: number;
    threshold?: number;
}

export interface InputData {
    features: number[]; // size 8
}

export interface ProveRequest {
    modelCID: string;
    inputCID: string;
}

export interface ProveResponse {
    jobId?: string; // If we wanted to track it early
    proof: {
        a: string[];
        b: string[][];
        c: string[];
    };
    publicSignals: string[]; // [output, modelHash, inputHash]
    output: number;
    modelHash: string;
    inputHash: string;
}
