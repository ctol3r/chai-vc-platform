pragma solidity ^0.8.0;

/**
 * @title DIDRegistry
 * @dev Simplified registry for W3C Decentralized Identifiers (DIDs).
 *      Stores a DID document as a string for a given identifier and owner.
 */
contract DIDRegistry {
    struct Record {
        address owner;
        string document;
    }

    // Mapping of DID hash to record
    mapping(bytes32 => Record) private records;

    // Events
    event DIDRegistered(string indexed did, address indexed owner);
    event DIDUpdated(string indexed did);
    event DIDRemoved(string indexed did);

    /**
     * @dev Registers a new DID with its associated document. The caller
     *      becomes the owner of the DID record.
     * @param did The DID string (e.g. "did:example:123").
     * @param document The DID document, typically a JSON string.
     */
    function register(string calldata did, string calldata document) external {
        bytes32 id = keccak256(bytes(did));
        require(records[id].owner == address(0), "DID already exists");
        records[id] = Record({owner: msg.sender, document: document});
        emit DIDRegistered(did, msg.sender);
    }

    /**
     * @dev Updates the DID document. Only the owner can update.
     * @param did The DID string.
     * @param document The new DID document.
     */
    function update(string calldata did, string calldata document) external {
        bytes32 id = keccak256(bytes(did));
        Record storage record = records[id];
        require(record.owner == msg.sender, "Not DID owner");
        record.document = document;
        emit DIDUpdated(did);
    }

    /**
     * @dev Removes a DID record. Only the owner can remove.
     * @param did The DID string.
     */
    function remove(string calldata did) external {
        bytes32 id = keccak256(bytes(did));
        Record storage record = records[id];
        require(record.owner == msg.sender, "Not DID owner");
        delete records[id];
        emit DIDRemoved(did);
    }

    /**
     * @dev Retrieves a DID document.
     * @param did The DID string.
     * @return document The associated DID document.
     * @return owner The owner of the DID record.
     */
    function resolve(string calldata did) external view returns (string memory document, address owner) {
        bytes32 id = keccak256(bytes(did));
        Record storage record = records[id];
        require(record.owner != address(0), "DID not found");
        return (record.document, record.owner);
    }
}

