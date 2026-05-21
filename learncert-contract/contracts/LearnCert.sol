// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title LearnCert — Behavior-Verified NFT Certificate System
/// @notice Mints ERC-721 certificates on Base Sepolia. Gas is covered by UGF — students never need ETH.
contract LearnCert is ERC721, Ownable {

    // -------------------------------------------------------------------------
    // Data Structures
    // -------------------------------------------------------------------------

    /// @notice All data stored on-chain for a single certificate NFT
    struct Certificate {
        string  courseName;        // e.g. "Machine Learning 101"
        uint8   genuinenessScore;  // 0-100, computed by Chrome extension behavior analysis
        uint256 issuedAt;          // block.timestamp at mint time
        address studentWallet;     // wallet address that received the NFT
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    /// @notice Total number of certificates minted. Also tracks next token ID.
    uint256 private _tokenCounter;

    /// @notice Maps token ID to its certificate data
    mapping(uint256 => Certificate) private _certificates;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a new certificate NFT is minted
    /// @param tokenId  The ID of the newly minted token
    /// @param student  The wallet that received the certificate
    /// @param courseName  The name of the completed course
    /// @param genuinenessScore  Behavior-verified score (0-100)
    /// @param issuedAt  Timestamp of issuance
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        string  courseName,
        uint8   genuinenessScore,
        uint256 issuedAt
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() ERC721("LearnCert", "LCRT") Ownable(msg.sender) {}

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------

    /// @notice Mints a new certificate NFT to a student's wallet.
    ///         Anyone can call this — the UGF sponsor calls it on behalf of the student.
    /// @param recipient    The student's wallet address that will own the NFT
    /// @param courseName   The name of the course completed (e.g. "Machine Learning 101")
    /// @param score        Genuineness score from behavior analysis, must be 0-100
    /// @return tokenId     The ID of the newly minted certificate
    function mint(
        address recipient,
        string memory courseName,
        uint8 score
    ) public returns (uint256) {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(score <= 100, "Score must be between 0 and 100");
        require(bytes(courseName).length > 0, "Course name cannot be empty");

        // Increment first so token IDs start at 1
        _tokenCounter += 1;
        uint256 tokenId = _tokenCounter;

        // Store certificate data on-chain before minting
        _certificates[tokenId] = Certificate({
            courseName:       courseName,
            genuinenessScore: score,
            issuedAt:         block.timestamp,
            studentWallet:    recipient
        });

        // Mint the NFT to the recipient
        _safeMint(recipient, tokenId);

        emit CertificateMinted(tokenId, recipient, courseName, score, block.timestamp);

        return tokenId;
    }

    /// @notice Returns all stored data for a given certificate NFT.
    /// @param tokenId  The ID of the certificate to look up
    /// @return         The full Certificate struct (courseName, genuinenessScore, issuedAt, studentWallet)
    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _certificates[tokenId];
    }

    /// @notice Returns the total number of certificates minted so far.
    /// @return Total supply (also equals the ID of the last minted token)
    function totalSupply() public view returns (uint256) {
        return _tokenCounter;
    }
}
