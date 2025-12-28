// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CrossChainDAO
/// @notice Simple governance contract allowing issuers, holders and verifiers to vote on proposals.
/// @dev Includes a hook for cross-chain vote relays through the BRIDGE_ROLE.
contract CrossChainDAO is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant HOLDER_ROLE = keccak256("HOLDER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    struct Proposal {
        string description;      // human readable description
        uint256 forVotes;        // count of supporting votes
        uint256 againstVotes;    // count of opposing votes
        bool executed;           // whether proposal has been executed
        uint256 deadline;        // timestamp when voting ends
    }

    // Mapping of proposal id to proposal data
    mapping(uint256 => Proposal) public proposals;
    // Tracks which addresses have voted on a proposal
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    // Total number of proposals created
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed id, string description, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event CrossChainVote(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight, string sourceChain);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Create a new proposal.
    /// @param description Text describing the proposal.
    /// @param votingPeriod Duration in seconds that voting remains open.
    /// @return proposalId Identifier of the created proposal.
    function propose(string memory description, uint256 votingPeriod) public returns (uint256 proposalId) {
        require(
            hasRole(ISSUER_ROLE, msg.sender) ||
            hasRole(HOLDER_ROLE, msg.sender) ||
            hasRole(VERIFIER_ROLE, msg.sender),
            "Unauthorized proposer"
        );

        proposalId = ++proposalCount;
        Proposal storage p = proposals[proposalId];
        p.description = description;
        p.deadline = block.timestamp + votingPeriod;

        emit ProposalCreated(proposalId, description, p.deadline);
    }

    /// @notice Cast a local vote on a proposal.
    /// @param proposalId Identifier of the proposal.
    /// @param support True to vote in favour, false to vote against.
    function vote(uint256 proposalId, bool support) public {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.deadline, "Voting closed");
        require(
            hasRole(ISSUER_ROLE, msg.sender) ||
            hasRole(HOLDER_ROLE, msg.sender) ||
            hasRole(VERIFIER_ROLE, msg.sender),
            "Unauthorized voter"
        );
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;
        uint256 weight = _getWeight(msg.sender);
        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    /// @notice Record a vote that originated on another chain.
    /// @dev Only callable by an account with the BRIDGE_ROLE that represents the cross-chain bridge.
    /// @param proposalId Identifier of the proposal.
    /// @param voter Address of the original voter on the remote chain.
    /// @param support True to vote in favour, false to vote against.
    /// @param weight Voting weight assigned to the voter on the remote chain.
    /// @param sourceChain Name or identifier of the source chain.
    function receiveCrossChainVote(
        uint256 proposalId,
        address voter,
        bool support,
        uint256 weight,
        string memory sourceChain
    )
        public
    {
        Proposal storage p = proposals[proposalId];
        require(hasRole(BRIDGE_ROLE, msg.sender), "Only bridge");
        require(block.timestamp < p.deadline, "Voting closed");
        require(!hasVoted[proposalId][voter], "Already voted");

        hasVoted[proposalId][voter] = true;
        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit CrossChainVote(proposalId, voter, support, weight, sourceChain);
    }

    /// @notice Execute a proposal after voting has concluded and passed.
    /// @param proposalId Identifier of the proposal.
    function execute(uint256 proposalId) public {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.deadline, "Voting not closed");
        require(!p.executed, "Already executed");
        require(p.forVotes > p.againstVotes, "Proposal not approved");

        p.executed = true;
        emit ProposalExecuted(proposalId);
        // In a full implementation, governance actions would occur here.
    }

    /// @dev Determine the voting weight for a voter. Currently each address gets one vote.
    function _getWeight(address /*voter*/) internal pure returns (uint256) {
        return 1;
    }
}

