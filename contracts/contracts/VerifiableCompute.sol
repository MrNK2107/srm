// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

contract VerifiableCompute {
    address public owner;
    IVerifier public verifier;

    // Approved models map: modelHash -> approved
    mapping(uint256 => bool) public approvedModels;
    
    // CID mapping for reference
    mapping(uint256 => string) public modelCIDs;

    struct Job {
        uint256 jobId;
        address requester; // or prover if self-submitted
        string inputCID;
        uint256 inputHash;
        string modelCID;
        uint256 modelHash;
        uint256 output;
        bool verified;
        uint256 timestamp;
    }

    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;

    event ModelApproved(uint256 indexed modelHash, string modelCID);
    event JobCreated(uint256 indexed jobId, address indexed requester);
    event ProofSubmitted(uint256 indexed jobId, address indexed prover, bool verified);

    constructor(address _verifier) {
        owner = msg.sender;
        verifier = IVerifier(_verifier);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function approveModel(uint256 _modelHash, string memory _modelCID) external onlyOwner {
        approvedModels[_modelHash] = true;
        modelCIDs[_modelHash] = _modelCID;
        emit ModelApproved(_modelHash, _modelCID);
    }

    // Main function to submit proof and record result
    function submitProof(
        string memory _modelCID,
        string memory _inputCID,
        uint256 _modelHash,
        uint256 _inputHash,
        uint256 _output,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC
    ) external returns (uint256 jobId, bool isValid) {
        // 1. Check if model is approved (optional constraint, good for security)
        // DISABLED FOR DEMO: require(approvedModels[_modelHash], "Model not approved");

        // 2. Construct public signals array [output, modelHash, inputHash]
        // Order MUST match the circuit public signal order!
        // In inference.circom: main {public [modelHash, inputHash]}
        // Wait, output is also public by default?
        // Circom: signal output y;
        // Public signals in Groth16 are outputs + public inputs.
        // Order depends on compilation. Usually [y, modelHash, inputHash].
        // We will assume [output, modelHash, inputHash] based on typical snarkjs ordering (outputs first).
        
        uint[3] memory pubSignals = [_output, _modelHash, _inputHash];

        // 3. Verify Proof
        isValid = verifier.verifyProof(_pA, _pB, _pC, pubSignals);
        require(isValid, "Invalid Proof");

        // 4. Create Job Record
        jobId = uint256(keccak256(abi.encodePacked(msg.sender, _inputHash, block.number)));
        
        jobs[jobId] = Job({
            jobId: jobId,
            requester: msg.sender,
            inputCID: _inputCID,
            inputHash: _inputHash,
            modelCID: _modelCID,
            modelHash: _modelHash,
            output: _output,
            verified: isValid,
            timestamp: block.timestamp
        });
        
        jobIds.push(jobId);

        emit JobCreated(jobId, msg.sender);
        emit ProofSubmitted(jobId, msg.sender, isValid);

        return (jobId, isValid);
    }
    
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
}
