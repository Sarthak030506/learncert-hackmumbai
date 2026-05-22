// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CredifyCertificate.sol";

/// @title CredifyCertificateTest
/// @notice Comprehensive Foundry test suite for the CredifyCertificate contract.
contract CredifyCertificateTest is Test {
    CredifyCertificate public certificate;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob   = makeAddr("bob");

    string  constant VIDEO_TITLE = "Introduction to Blockchain";
    string  constant VIDEO_ID    = "vid_abc123";
    uint256 constant SCORE       = 85;
    uint256 constant COMPLETION  = 100;
    bytes32 constant SESSION     = keccak256("session-1");

    /// @dev Deploy a fresh contract before each test.
    function setUp() public {
        certificate = new CredifyCertificate(owner);
    }

    // ─────────────────────────────────────────
    //  Minting
    // ─────────────────────────────────────────

    /// @notice Owner can mint a certificate and data is stored correctly.
    function test_mint_success() public {
        uint256 tokenId = certificate.mint(
            alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION
        );

        assertEq(tokenId, 1);
        assertEq(certificate.ownerOf(1), alice);
        assertEq(certificate.totalSupply(), 1);

        (
            string memory title,
            string memory vid,
            uint256 score,
            uint256 pct,
            uint256 issuedAt,
            bytes32 hash
        ) = certificate.certificates(1);

        assertEq(title, VIDEO_TITLE);
        assertEq(vid, VIDEO_ID);
        assertEq(score, SCORE);
        assertEq(pct, COMPLETION);
        assertGt(issuedAt, 0);
        assertEq(hash, SESSION);
    }

    /// @notice Minting emits the CertificateMinted event with correct params.
    function test_mint_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit CredifyCertificate.CertificateMinted(1, alice, VIDEO_ID, SCORE, SESSION);

        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);
    }

    /// @notice Multiple mints produce sequential token IDs.
    function test_mint_sequential() public {
        bytes32 s1 = keccak256("s1");
        bytes32 s2 = keccak256("s2");

        uint256 id1 = certificate.mint(alice, "V1", "id1", 80, 90, s1);
        uint256 id2 = certificate.mint(bob,   "V2", "id2", 70, 80, s2);

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(certificate.totalSupply(), 2);
    }

    // ─────────────────────────────────────────
    //  Access Control
    // ─────────────────────────────────────────

    /// @notice Non-owner cannot mint.
    function test_mint_revert_nonOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice)
        );
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);
    }

    // ─────────────────────────────────────────
    //  Double-Mint Prevention
    // ─────────────────────────────────────────

    /// @notice Re-using a sessionHash reverts with SessionAlreadyUsed.
    function test_mint_revert_duplicateSession() public {
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);

        vm.expectRevert(
            abi.encodeWithSelector(
                CredifyCertificate.SessionAlreadyUsed.selector,
                SESSION
            )
        );
        certificate.mint(bob, "Other", "other", 50, 50, SESSION);
    }

    // ─────────────────────────────────────────
    //  Validation
    // ─────────────────────────────────────────

    /// @notice Credibility score > 100 reverts.
    function test_mint_revert_invalidScore() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                CredifyCertificate.InvalidCredibilityScore.selector,
                101
            )
        );
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, 101, COMPLETION, SESSION);
    }

    /// @notice Completion percentage > 100 reverts.
    function test_mint_revert_invalidCompletion() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                CredifyCertificate.InvalidCompletionPercentage.selector,
                101
            )
        );
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, 101, SESSION);
    }

    // ─────────────────────────────────────────
    //  Soulbound — Transfer Prevention
    // ─────────────────────────────────────────

    /// @notice transferFrom reverts for soulbound tokens.
    function test_transfer_revert_soulbound() public {
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);

        vm.prank(alice);
        vm.expectRevert(
            CredifyCertificate.SoulboundTransferNotAllowed.selector
        );
        certificate.transferFrom(alice, bob, 1);
    }

    /// @notice safeTransferFrom also reverts.
    function test_safeTransfer_revert_soulbound() public {
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);

        vm.prank(alice);
        vm.expectRevert(
            CredifyCertificate.SoulboundTransferNotAllowed.selector
        );
        certificate.safeTransferFrom(alice, bob, 1);
    }

    // ─────────────────────────────────────────
    //  Token URI — On-chain Metadata
    // ─────────────────────────────────────────

    /// @notice tokenURI returns a valid data URI.
    function test_tokenURI_valid() public {
        certificate.mint(alice, VIDEO_TITLE, VIDEO_ID, SCORE, COMPLETION, SESSION);

        string memory uri = certificate.tokenURI(1);

        // Must start with the data URI prefix
        assertTrue(_startsWith(uri, "data:application/json;base64,"));

        // Must contain reasonable length (SVG + JSON)
        assertTrue(bytes(uri).length > 200);
    }

    /// @notice tokenURI reverts for non-existent token.
    function test_tokenURI_revert_nonExistent() public {
        vm.expectRevert();
        certificate.tokenURI(999);
    }

    // ─────────────────────────────────────────
    //  Edge Cases
    // ─────────────────────────────────────────

    /// @notice Minting with score = 0 and completion = 0 succeeds.
    function test_mint_zeroValues() public {
        bytes32 s = keccak256("zero-session");
        uint256 tokenId = certificate.mint(alice, "Zero", "z0", 0, 0, s);
        assertEq(tokenId, 1);
    }

    /// @notice Minting with score = 100 and completion = 100 succeeds.
    function test_mint_maxValues() public {
        bytes32 s = keccak256("max-session");
        uint256 tokenId = certificate.mint(alice, "Max", "m0", 100, 100, s);
        assertEq(tokenId, 1);
    }

    // ─────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────

    /// @dev Returns true if `str` starts with `prefix`.
    function _startsWith(string memory str, string memory prefix)
        internal
        pure
        returns (bool)
    {
        bytes memory s = bytes(str);
        bytes memory p = bytes(prefix);
        if (s.length < p.length) return false;
        for (uint256 i; i < p.length; i++) {
            if (s[i] != p[i]) return false;
        }
        return true;
    }
}
