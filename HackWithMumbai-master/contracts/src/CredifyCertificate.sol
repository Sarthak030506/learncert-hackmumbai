// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title CredifyCertificate
/// @author Credify Team
/// @notice Soulbound ERC-721 NFT representing verified proof-of-learning certificates.
/// @dev Certificates are non-transferable (soulbound). Metadata and SVG artwork are
///      generated entirely on-chain — no IPFS dependency. Only the contract owner
///      (Credify backend) may mint new certificates, and each learning session
///      (identified by a unique sessionHash) can only produce one certificate.
contract CredifyCertificate is ERC721, Ownable {
    using Strings for uint256;

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    /// @notice On-chain data stored for every minted certificate.
    struct Certificate {
        string videoTitle;
        string videoId;
        uint256 credibilityScore;   // 0–100
        uint256 completionPercentage; // 0–100
        uint256 issuedAt;           // block.timestamp at mint
        bytes32 sessionHash;        // unique learning-session fingerprint
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @notice Auto-incrementing token-ID counter (starts at 1).
    uint256 private _nextTokenId;

    /// @notice Certificate data keyed by token ID.
    mapping(uint256 => Certificate) public certificates;

    /// @notice Tracks used session hashes to prevent double-minting.
    mapping(bytes32 => bool) public usedSessionHashes;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when a new certificate is minted.
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string videoId,
        uint256 credibilityScore,
        bytes32 sessionHash
    );

    // ──────────────────────────────────────────────
    //  Errors
    // ──────────────────────────────────────────────

    /// @notice Thrown when a sessionHash has already been used.
    error SessionAlreadyUsed(bytes32 sessionHash);

    /// @notice Thrown when someone tries to transfer a soulbound token.
    error SoulboundTransferNotAllowed();

    /// @notice Thrown when the credibility score exceeds the maximum (100).
    error InvalidCredibilityScore(uint256 score);

    /// @notice Thrown when the completion percentage exceeds the maximum (100).
    error InvalidCompletionPercentage(uint256 percentage);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /// @param initialOwner Address that will own this contract and be allowed to mint.
    constructor(address initialOwner)
        ERC721("Credify Learning Certificate", "CREDCERT")
        Ownable(initialOwner)
    {}

    // ──────────────────────────────────────────────
    //  External / Public — Write
    // ──────────────────────────────────────────────

    /// @notice Mint a new soulbound learning certificate.
    /// @dev Only callable by the contract owner. Reverts if the sessionHash
    ///      has already been consumed or if score/percentage are out of range.
    /// @param to                   Recipient wallet address.
    /// @param videoTitle           Title of the completed video.
    /// @param videoId              Platform-specific video identifier.
    /// @param credibilityScore     Learning credibility score (0–100).
    /// @param completionPercentage Video completion percentage (0–100).
    /// @param sessionHash          Unique fingerprint of the learning session.
    /// @return tokenId The ID of the newly minted certificate.
    function mint(
        address to,
        string calldata videoTitle,
        string calldata videoId,
        uint256 credibilityScore,
        uint256 completionPercentage,
        bytes32 sessionHash
    ) external onlyOwner returns (uint256 tokenId) {
        // --- Validation ---
        if (usedSessionHashes[sessionHash]) {
            revert SessionAlreadyUsed(sessionHash);
        }
        if (credibilityScore > 100) {
            revert InvalidCredibilityScore(credibilityScore);
        }
        if (completionPercentage > 100) {
            revert InvalidCompletionPercentage(completionPercentage);
        }

        // --- State changes ---
        usedSessionHashes[sessionHash] = true;

        unchecked {
            tokenId = ++_nextTokenId;
        }

        certificates[tokenId] = Certificate({
            videoTitle: videoTitle,
            videoId: videoId,
            credibilityScore: credibilityScore,
            completionPercentage: completionPercentage,
            issuedAt: block.timestamp,
            sessionHash: sessionHash
        });

        // --- Mint ---
        _safeMint(to, tokenId);

        emit CertificateMinted(tokenId, to, videoId, credibilityScore, sessionHash);
    }

    // ──────────────────────────────────────────────
    //  External / Public — Read
    // ──────────────────────────────────────────────

    /// @notice Returns the total number of certificates minted so far.
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @inheritdoc ERC721
    /// @dev Returns a fully on-chain data URI (application/json;base64) containing
    ///      the certificate metadata and an embedded SVG image.
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        Certificate memory cert = certificates[tokenId];
        return _generateMetadata(cert, tokenId);
    }

    // ──────────────────────────────────────────────
    //  Overrides — Soulbound
    // ──────────────────────────────────────────────

    /// @dev Restricts all transfers. Only minting (from == address(0)) and
    ///      burning (to == address(0)) are permitted.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == 0) and burning (to == 0); block everything else.
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferNotAllowed();
        }

        return super._update(to, tokenId, auth);
    }

    // ──────────────────────────────────────────────
    //  Internal — Metadata Generation
    // ──────────────────────────────────────────────

    /// @dev Builds the complete JSON metadata string and returns it as a
    ///      `data:application/json;base64,...` URI.
    function _generateMetadata(Certificate memory cert, uint256 tokenId)
        internal
        pure
        returns (string memory)
    {
        string memory svg = _generateSVG(cert, tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));

        string memory json = string(
            abi.encodePacked(
                '{"name":"Credify Learning Certificate #',
                _toString(tokenId),
                '","description":"Verified proof-of-learning certificate issued by the Credify platform. '
                'This soulbound NFT certifies that the holder completed a learning session with a credibility score of ',
                _toString(cert.credibilityScore),
                '/100 and ',
                _toString(cert.completionPercentage),
                '% completion.","image":"data:image/svg+xml;base64,',
                svgBase64,
                '","attributes":[{"trait_type":"Credibility Score","value":',
                _toString(cert.credibilityScore),
                '},{"trait_type":"Completion","value":',
                _toString(cert.completionPercentage),
                '},{"trait_type":"Video ID","value":"',
                cert.videoId,
                '"},{"display_type":"date","trait_type":"Issued","value":',
                _toString(cert.issuedAt),
                '}]}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }

    /// @dev Generates a premium 600×800 SVG certificate.
    function _generateSVG(Certificate memory cert, uint256 tokenId)
        internal
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                _svgHeader(),
                _svgDefs(),
                _svgBody(cert, tokenId),
                "</svg>"
            )
        );
    }

    /// @dev SVG root element and background.
    function _svgHeader() internal pure returns (string memory) {
        return
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">'
            '<rect width="600" height="800" rx="20" fill="url(#bg)"/>';
    }

    /// @dev SVG <defs>: gradients, filters, and glow effects.
    function _svgDefs() internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<defs>"
                // Background gradient
                '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
                '<stop offset="0%" stop-color="#0a0e27"/>'
                '<stop offset="100%" stop-color="#1a0533"/>'
                "</linearGradient>"
                // Gold accent gradient
                '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">'
                '<stop offset="0%" stop-color="#f7931a"/>'
                '<stop offset="50%" stop-color="#ffd700"/>'
                '<stop offset="100%" stop-color="#f7931a"/>'
                "</linearGradient>"
                // Score ring gradient
                '<linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">'
                '<stop offset="0%" stop-color="#00d2ff"/>'
                '<stop offset="100%" stop-color="#7b2ff7"/>'
                "</linearGradient>"
                // Glow filter
                '<filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/>'
                '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
                // Soft glow filter
                '<filter id="softGlow"><feGaussianBlur stdDeviation="2" result="blur"/>'
                '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
                "</defs>"
            )
        );
    }

    /// @dev The main body content of the certificate SVG.
    function _svgBody(Certificate memory cert, uint256 tokenId)
        internal
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                _svgBorder(),
                _svgHeaderText(tokenId),
                _svgDivider(),
                _svgVideoInfo(cert),
                _svgScoreSection(cert),
                _svgFooter(cert)
            )
        );
    }

    /// @dev Decorative border with rounded corners.
    function _svgBorder() internal pure returns (string memory) {
        return
            '<rect x="15" y="15" width="570" height="770" rx="15" fill="none" '
            'stroke="url(#gold)" stroke-width="1.5" opacity="0.6"/>'
            '<rect x="25" y="25" width="550" height="750" rx="12" fill="none" '
            'stroke="url(#gold)" stroke-width="0.5" opacity="0.3"/>';
    }

    /// @dev "CREDIFY" header and "LEARNING CERTIFICATE" subtitle.
    function _svgHeaderText(uint256 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                // Credify logo text with glow
                '<text x="300" y="90" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="48" font-weight="bold" fill="url(#gold)" filter="url(#glow)" '
                'letter-spacing="12">CREDIFY</text>'
                // Subtitle
                '<text x="300" y="130" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="16" fill="#a0a0c0" letter-spacing="6">LEARNING CERTIFICATE</text>'
                // Certificate number
                '<text x="300" y="160" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="12" fill="#606080" letter-spacing="2">#',
                _toString(tokenId),
                "</text>"
            )
        );
    }

    /// @dev Horizontal divider with gold gradient.
    function _svgDivider() internal pure returns (string memory) {
        return
            '<line x1="80" y1="180" x2="520" y2="180" stroke="url(#gold)" '
            'stroke-width="1" opacity="0.5"/>'
            // Small diamond accent in center
            '<polygon points="300,175 305,180 300,185 295,180" fill="url(#gold)" opacity="0.7"/>';
    }

    /// @dev Video title and ID section.
    function _svgVideoInfo(Certificate memory cert) internal pure returns (string memory) {
        // Truncate title if too long for display
        return string(
            abi.encodePacked(
                '<text x="300" y="225" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="11" fill="#8080a0" letter-spacing="3">VIDEO COMPLETED</text>'
                '<text x="300" y="260" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="18" fill="#e0e0ff" font-weight="bold">',
                cert.videoTitle,
                "</text>"
                '<text x="300" y="290" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="11" fill="#606080">ID: ',
                cert.videoId,
                "</text>"
            )
        );
    }

    /// @dev Large credibility score circle and completion percentage.
    function _svgScoreSection(Certificate memory cert)
        internal
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                // Score ring background
                '<circle cx="300" cy="440" r="90" fill="none" stroke="#1a1a3a" stroke-width="8"/>'
                // Score ring foreground (colored arc approximation)
                '<circle cx="300" cy="440" r="90" fill="none" stroke="url(#scoreGrad)" '
                'stroke-width="8" stroke-linecap="round" stroke-dasharray="565" '
                'stroke-dashoffset="',
                // dashoffset = circumference * (1 - score/100)
                _toString(565 - ((565 * cert.credibilityScore) / 100)),
                '" transform="rotate(-90 300 440)"/>'
                // Score label
                '<text x="300" y="420" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="11" fill="#8080a0" letter-spacing="2">CREDIBILITY</text>'
                // Score value — large
                '<text x="300" y="465" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="52" font-weight="bold" fill="#ffffff" filter="url(#softGlow)">',
                _toString(cert.credibilityScore),
                "</text>"
                // "/100" subscript
                '<text x="300" y="490" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="14" fill="#606080">/100</text>'
                // Completion bar section
                '<text x="300" y="570" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="11" fill="#8080a0" letter-spacing="2">COMPLETION</text>',
                _svgCompletionBar(cert.completionPercentage)
            )
        );
    }

    /// @dev Horizontal completion progress bar.
    function _svgCompletionBar(uint256 pct) internal pure returns (string memory) {
        uint256 barWidth = (300 * pct) / 100; // max bar width = 300px
        return string(
            abi.encodePacked(
                // Bar background
                '<rect x="150" y="585" width="300" height="10" rx="5" fill="#1a1a3a"/>'
                // Bar fill
                '<rect x="150" y="585" width="',
                _toString(barWidth),
                '" height="10" rx="5" fill="url(#scoreGrad)"/>'
                // Percentage text
                '<text x="300" y="615" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="14" fill="#e0e0ff" font-weight="bold">',
                _toString(pct),
                "%</text>"
            )
        );
    }

    /// @dev Footer: date, verified badge, and chain info.
    function _svgFooter(Certificate memory cert) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                // Divider
                '<line x1="80" y1="650" x2="520" y2="650" stroke="url(#gold)" '
                'stroke-width="0.5" opacity="0.4"/>'
                // Issued date
                '<text x="300" y="685" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="11" fill="#606080">Issued: ',
                _formatDate(cert.issuedAt),
                "</text>"
                // Verified badge
                '<rect x="210" y="700" width="180" height="32" rx="16" fill="none" '
                'stroke="url(#scoreGrad)" stroke-width="1.5"/>'
                '<text x="300" y="721" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="12" fill="#00d2ff" letter-spacing="2" filter="url(#softGlow)">'
                "\xe2\x9c\x93 VERIFIED ON-CHAIN</text>" // ✓ character UTF-8 encoded
                // Chain label
                '<text x="300" y="760" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" '
                'font-size="9" fill="#404060">Base Sepolia \xc2\xb7 ERC-721 \xc2\xb7 Soulbound</text>' // · character
            )
        );
    }

    // ──────────────────────────────────────────────
    //  Internal — Utility Helpers
    // ──────────────────────────────────────────────

    /// @dev Converts a uint256 to its ASCII decimal string representation.
    ///      Uses OpenZeppelin's Strings library under the hood.
    function _toString(uint256 value) internal pure returns (string memory) {
        return Strings.toString(value);
    }

    /// @dev Formats a Unix timestamp into a human-readable "YYYY-MM-DD" string.
    ///      This is a simplified implementation suitable for on-chain display;
    ///      it does not account for leap-second edge cases.
    function _formatDate(uint256 timestamp) internal pure returns (string memory) {
        // --- Date calculation (based on the civil calendar algorithm) ---
        uint256 z = timestamp / 86400 + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint256 y = yoe + era * 400;
        uint256 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint256 mp = (5 * doy + 2) / 153;
        uint256 d = doy - (153 * mp + 2) / 5 + 1;
        uint256 m = mp < 10 ? mp + 3 : mp - 9;

        if (m <= 2) {
            y += 1;
        }

        return string(
            abi.encodePacked(
                _toString(y),
                "-",
                m < 10 ? "0" : "",
                _toString(m),
                "-",
                d < 10 ? "0" : "",
                _toString(d)
            )
        );
    }
}
