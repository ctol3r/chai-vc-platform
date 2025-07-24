// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title JobMarketplace
 * @dev Simple marketplace for posting jobs and registering candidate profiles.
 */
contract JobMarketplace {
    struct Job {
        address employer;
        string title;
        string description;
        uint256 payment;
        bool isOpen;
    }

    struct Candidate {
        address candidateAddress;
        string skills;
        string resumeCid;
    }

    // Incremental counters for IDs
    uint256 private nextJobId;
    uint256 private nextCandidateId;

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => uint256) public candidateIds;
    mapping(uint256 => uint256[]) public jobApplicants; // jobId => candidateId array

    event JobPosted(uint256 indexed jobId, address indexed employer);
    event JobClosed(uint256 indexed jobId);
    event CandidateRegistered(uint256 indexed candidateId, address indexed candidate);
    event Applied(uint256 indexed jobId, uint256 indexed candidateId);

    /**
     * @dev Post a new job listing.
     * @param title Title of the job.
     * @param description Description of the job.
     * @param payment Proposed payment amount.
     */
    function postJob(string calldata title, string calldata description, uint256 payment) external {
        jobs[nextJobId] = Job({
            employer: msg.sender,
            title: title,
            description: description,
            payment: payment,
            isOpen: true
        });
        emit JobPosted(nextJobId, msg.sender);
        nextJobId++;
    }

    /**
     * @dev Close an open job posting. Only employer who created can close.
     */
    function closeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.employer == msg.sender, "not employer");
        require(job.isOpen, "already closed");
        job.isOpen = false;
        emit JobClosed(jobId);
    }

    /**
     * @dev Register a candidate profile. One profile per address.
     */
    function registerCandidate(string calldata skills, string calldata resumeCid) external {
        require(candidateIds[msg.sender] == 0 && (nextCandidateId == 0 || candidates[0].candidateAddress != msg.sender), "profile exists");
        uint256 candidateId = nextCandidateId;
        candidates[candidateId] = Candidate({
            candidateAddress: msg.sender,
            skills: skills,
            resumeCid: resumeCid
        });
        candidateIds[msg.sender] = candidateId;
        emit CandidateRegistered(candidateId, msg.sender);
        nextCandidateId++;
    }

    /**
     * @dev Apply to an open job. Caller must have registered candidate profile.
     */
    function applyToJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.isOpen, "job closed");
        uint256 candidateId = candidateIds[msg.sender];
        require(candidates[candidateId].candidateAddress == msg.sender, "candidate not registered");
        jobApplicants[jobId].push(candidateId);
        emit Applied(jobId, candidateId);
    }

    /**
     * @dev View applicants for a job.
     */
    function getApplicants(uint256 jobId) external view returns (uint256[] memory) {
        return jobApplicants[jobId];
    }
}

