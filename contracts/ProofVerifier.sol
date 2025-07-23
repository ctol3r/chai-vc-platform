// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ProofVerifier
 * @notice Basic verification contract that checks a credential hash and verifies
 *         revocation status. This is a simplified skeleton used for demonstration
 *         purposes within chai-vc-platform.
 */
contract ProofVerifier {
    // mapping of credential hash to revocation status
    mapping(bytes32 => bool) public revoked;

    /**
     * @notice Mark a credential as revoked.
     * @param credentialHash Hash of the credential to revoke.
     */
    function revokeCredential(bytes32 credentialHash) external {
        revoked[credentialHash] = true;
    }

    /**
     * @notice Verify a credential hash and ensure it has not been revoked.
     * @param credentialHash Hash of the credential to verify.
     * @return valid True if the credential exists and is not revoked.
     */
    function verifyProof(bytes32 credentialHash) external view returns (bool valid) {
        // In a real implementation there would be additional signature and proof checks
        return !revoked[credentialHash];
    }
}
