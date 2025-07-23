// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustRegistry
 * @notice Registry that tracks issuer reputation and endorsement votes.
 *         This simplified contract allows issuers to register and other
 *         participants to endorse them with reputation weights.
 */
contract TrustRegistry {
    struct Issuer {
        uint256 reputation;
        mapping(address => uint256) endorsements;
        bool exists;
    }

    mapping(address => Issuer) private issuers;

    event IssuerRegistered(address indexed issuer);
    event IssuerEndorsed(address indexed issuer, address indexed endorser, uint256 weight);

    /**
     * @notice Register an issuer in the trust registry.
     */
    function registerIssuer() external {
        require(!issuers[msg.sender].exists, "already registered");
        issuers[msg.sender].exists = true;
        emit IssuerRegistered(msg.sender);
    }

    /**
     * @notice Endorse an issuer with a reputation weight.
     * @param issuer Address of the issuer to endorse.
     * @param weight Numeric weight representing the strength of endorsement.
     */
    function endorseIssuer(address issuer, uint256 weight) external {
        require(issuers[issuer].exists, "issuer not registered");
        issuers[issuer].endorsements[msg.sender] = weight;
        issuers[issuer].reputation += weight;
        emit IssuerEndorsed(issuer, msg.sender, weight);
    }

    /**
     * @notice Get the reputation score for an issuer.
     * @param issuer Address of the issuer.
     */
    function getReputation(address issuer) external view returns (uint256) {
        return issuers[issuer].reputation;
    }
}
