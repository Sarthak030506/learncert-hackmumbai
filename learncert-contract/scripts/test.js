'use strict';

require('dotenv').config();
const { ethers } = require('ethers');
const { mintCertificateGasless } = require('./ugf');

// ─── Config ──────────────────────────────────────────────────────────────────

const TEST_COURSE = "Machine Learning 101";
const TEST_SCORE  = 85;

const LEARNCERT_ABI = [
    "function getCertificate(uint256 tokenId) public view returns (tuple(string courseName, uint8 genuinenessScore, uint256 issuedAt, address studentWallet))"
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Prints a timestamped log line.
 * @param {string} stage  - Label shown in brackets, e.g. "MINT"
 * @param {string} message - The message to print
 */
function log(stage, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [${stage}] ${message}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * End-to-end test: mints a gasless NFT certificate via UGF, then reads it
 * back from the chain and asserts all fields match what was submitted.
 */
async function main() {
    // ── Validate env vars ────────────────────────────────────────────────────
    if (!process.env.PRIVATE_KEY) {
        console.error("ERROR: PRIVATE_KEY not set in .env");
        process.exit(1);
    }
    if (!process.env.CONTRACT_ADDRESS) {
        console.error("ERROR: CONTRACT_ADDRESS not set in .env");
        process.exit(1);
    }

    // ── Wallet setup ─────────────────────────────────────────────────────────
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    log("TEST START", "LearnCert Gasless Mint Test");
    log("SETUP",      `Wallet: ${wallet.address}`);

    // ── Step 2: Mint ─────────────────────────────────────────────────────────
    log("MINT", `Minting certificate for: ${TEST_COURSE}, Score: ${TEST_SCORE}`);
    log("MINT", "Starting UGF gasless flow...");

    const startTime = Date.now();
    const result    = await mintCertificateGasless(wallet, TEST_COURSE, TEST_SCORE);
    const elapsed   = ((Date.now() - startTime) / 1000).toFixed(2);

    log("MINT", `✓ Mint complete in ${elapsed}s`);
    log("MINT", `  txHash:  ${result.txHash}`);
    log("MINT", `  tokenId: ${result.tokenId}`);
    log("MINT", `  Explorer: https://sepolia.basescan.org/tx/${result.txHash}`);

    // ── Step 3: Read back from chain ─────────────────────────────────────────
    log("VERIFY", `Reading certificate #${result.tokenId} from chain...`);

    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        LEARNCERT_ABI,
        provider
    );
    const cert = await contract.getCertificate(result.tokenId);

    log("VERIFY", "On-chain certificate data:");
    log("VERIFY", `  courseName:        ${cert.courseName}`);
    log("VERIFY", `  genuinenessScore:  ${cert.genuinenessScore}`);
    log("VERIFY", `  issuedAt:          ${new Date(Number(cert.issuedAt) * 1000).toISOString()}`);
    log("VERIFY", `  studentWallet:     ${cert.studentWallet}`);

    // ── Step 4: Assertions ───────────────────────────────────────────────────
    let passed = true;

    if (cert.courseName !== TEST_COURSE) {
        log("ASSERT", `FAIL: courseName mismatch. Expected "${TEST_COURSE}", got "${cert.courseName}"`);
        passed = false;
    }
    if (Number(cert.genuinenessScore) !== TEST_SCORE) {
        log("ASSERT", `FAIL: score mismatch. Expected ${TEST_SCORE}, got ${cert.genuinenessScore}`);
        passed = false;
    }
    if (cert.studentWallet.toLowerCase() !== wallet.address.toLowerCase()) {
        log("ASSERT", `FAIL: wallet mismatch. Expected ${wallet.address}, got ${cert.studentWallet}`);
        passed = false;
    }

    if (passed) {
        log("RESULT", "✓ ALL ASSERTIONS PASSED — Gasless mint verified on-chain!");
    } else {
        log("RESULT", "✗ SOME ASSERTIONS FAILED — Check logs above");
        process.exit(1);
    }

    // ── Step 5: Summary ──────────────────────────────────────────────────────
    log("SUMMARY", "=".repeat(50));
    log("SUMMARY", "Contract:  " + process.env.CONTRACT_ADDRESS);
    log("SUMMARY", "Token ID:  " + result.tokenId);
    log("SUMMARY", "Tx Hash:   " + result.txHash);
    log("SUMMARY", "Verify:    https://sepolia.basescan.org/tx/" + result.txHash);
    log("SUMMARY", "=".repeat(50));
    log("SUMMARY", "Ready to hand off to Person C!");
}

main().catch(err => {
    console.error(`\n[FATAL ERROR] ${err.message}`);
    console.error("Stack:", err.stack);
    process.exit(1);
});
