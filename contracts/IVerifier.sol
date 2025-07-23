// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVerifier
 * @notice Interface for zk-SNARK verifier contracts.
 */
interface IVerifier {
    function verifyProof(bytes memory proof, uint256[] memory pubSignals) external view returns (bool);
}
