// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool) {
        // MOCK: Always return true for hackathon demo if setup failed
        // In production, this would be the SnarkJS generated code
        return true;
    }
}
