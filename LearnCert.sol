// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title LearnCert — Behavior-Verified NFT Certificate System
/// @notice Mints ERC-721 certificates on Base Sepolia. Gas is covered by UGF — students never need ETH.
contract LearnCert is ERC721, Ownable {

    struct Certificate {
        string  courseName;
        uint8   genuinenessScore;
        uint256 issuedAt;
        address studentWallet;
    }

    uint256 private _tokenCounter;
    mapping(uint256 => Certificate) private _certificates;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        string  courseName,
        uint8   genuinenessScore,
        uint256 issuedAt
    );

    constructor() ERC721("LearnCert", "LCRT") Ownable(msg.sender) {}

    function mint(address recipient, string memory courseName, uint8 score) public returns (uint256) {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(score <= 100, "Score must be between 0 and 100");
        require(bytes(courseName).length > 0, "Course name cannot be empty");

        _tokenCounter += 1;
        uint256 tokenId = _tokenCounter;

        _certificates[tokenId] = Certificate({
            courseName:       courseName,
            genuinenessScore: score,
            issuedAt:         block.timestamp,
            studentWallet:    recipient
        });

        _safeMint(recipient, tokenId);
        emit CertificateMinted(tokenId, recipient, courseName, score, block.timestamp);
        return tokenId;
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _certificates[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenCounter;
    }
}