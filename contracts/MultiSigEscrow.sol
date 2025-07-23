// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Multi-Signature Escrow for Privilege Issuance
/// @notice Holds ERC20 tokens in escrow and releases them when a
/// threshold of signers approve a release request. This can be used
/// as a generic mechanism for multi-party privilege issuance where
/// privileges are represented by token ownership.
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract MultiSigEscrow {
    IERC20 public immutable token;
    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public immutable threshold;

    struct ReleaseRequest {
        address recipient;
        uint256 amount;
        bool executed;
        uint256 approvals;
        mapping(address => bool) approvedBy;
    }

    ReleaseRequest[] private _requests;

    event Deposit(address indexed from, uint256 amount);
    event ReleaseRequested(uint256 indexed requestId, address indexed to, uint256 amount);
    event Approved(uint256 indexed requestId, address indexed signer);
    event Executed(uint256 indexed requestId);

    modifier onlySigner() {
        require(isSigner[msg.sender], "not authorized");
        _;
    }

    constructor(address tokenAddress, address[] memory signerAddresses, uint256 _threshold) {
        require(signerAddresses.length >= _threshold, "threshold too high");
        require(_threshold > 0, "threshold must be positive");

        token = IERC20(tokenAddress);
        threshold = _threshold;
        for (uint256 i = 0; i < signerAddresses.length; i++) {
            address signer = signerAddresses[i];
            require(!isSigner[signer] && signer != address(0), "invalid signer");
            isSigner[signer] = true;
            signers.push(signer);
        }
    }

    /// @notice Deposit tokens into escrow
    function deposit(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "transfer failed");
        emit Deposit(msg.sender, amount);
    }

    /// @notice Create a new release request
    function createRelease(address to, uint256 amount) external onlySigner returns (uint256 requestId) {
        ReleaseRequest storage r = _requests.push();
        r.recipient = to;
        r.amount = amount;
        requestId = _requests.length - 1;
        emit ReleaseRequested(requestId, to, amount);
    }

    /// @notice Approve an existing release request
    function approve(uint256 requestId) external onlySigner {
        ReleaseRequest storage r = _requests[requestId];
        require(!r.executed, "already executed");
        require(!r.approvedBy[msg.sender], "already approved");

        r.approvedBy[msg.sender] = true;
        r.approvals += 1;
        emit Approved(requestId, msg.sender);

        if (r.approvals >= threshold) {
            _execute(requestId);
        }
    }

    /// @notice Execute a release request once threshold approvals are met
    function _execute(uint256 requestId) internal {
        ReleaseRequest storage r = _requests[requestId];
        require(!r.executed, "already executed");
        r.executed = true;
        require(token.transfer(r.recipient, r.amount), "transfer failed");
        emit Executed(requestId);
    }

    /// @notice Get release request details
    function getRequest(uint256 requestId) external view returns (address to, uint256 amount, bool executed, uint256 approvals) {
        ReleaseRequest storage r = _requests[requestId];
        return (r.recipient, r.amount, r.executed, r.approvals);
    }

    /// @notice Number of existing requests
    function requestCount() external view returns (uint256) {
        return _requests.length;
    }
}

