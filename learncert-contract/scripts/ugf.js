/**
 * ugf.js — Gasless NFT minting via UGF (Universal Gas Framework)
 *
 * This module handles the full gasless transaction lifecycle:
 * Auth → Quote → Settle (x402) → Execute → Confirm
 *
 * The student never needs ETH. UGF pays all gas using TYI_MOCK_USD.
 *
 * Usage:
 *   const { mintCertificateGasless } = require('./ugf');
 *   const result = await mintCertificateGasless(wallet, "ML101", 85);
 *   console.log(result.txHash, result.tokenId);
 */

require("dotenv").config();
const { UGFClient } = require("@tychilabs/ugf-testnet-js");
const { ethers } = require("ethers");

// -------------------------------------------------------------------------
// Network Constants
// -------------------------------------------------------------------------
const BASE_SEPOLIA_RPC      = "https://sepolia.base.org";
const BASE_SEPOLIA_CHAIN_ID = 84532;
const PAYMENT_COIN          = "TYI_MOCK_USD";

// -------------------------------------------------------------------------
// Minimal ABI — only what ugf.js needs to encode calldata and parse events
// -------------------------------------------------------------------------
const LEARNCERT_ABI = [
    "function mint(address recipient, string memory courseName, uint8 score) public returns (uint256)",
    "function getCertificate(uint256 tokenId) public view returns (tuple(string courseName, uint8 genuinenessScore, uint256 issuedAt, address studentWallet))",
    "event CertificateMinted(uint256 indexed tokenId, address indexed student, string courseName, uint8 genuinenessScore, uint256 issuedAt)",
];

// -------------------------------------------------------------------------
// Error code → human-readable message map
// -------------------------------------------------------------------------
const UGF_ERROR_MESSAGES = {
    UNSUPPORTED_TESTNET_ROUTE: "Network not supported. Ensure you're on Base Sepolia (chainId 84532).",
    QUOTE_ERROR:               "Failed to get gas quote. Check wallet balance and CONTRACT_ADDRESS.",
    SETTLEMENT_ERROR:          "Payment settlement failed. Check TYI_MOCK_USD balance.",
    EXECUTION_ERROR:           "Transaction execution failed. Check contract address and calldata.",
    COMPLETION_TIMEOUT:        "Transaction timed out. Check https://sepolia.basescan.org for status.",
    AUTH_FAILED:               "Wallet authentication failed. Ensure wallet is connected to a provider.",
};

/**
 * Translates a raw UGF SDK error into a human-readable message.
 * Falls back to the original error message if code is not recognised.
 * @param {Error} err - The error thrown by the UGF SDK
 * @returns {string} Human-readable error message
 */
function humanizeUGFError(err) {
    for (const [code, message] of Object.entries(UGF_ERROR_MESSAGES)) {
        if (err.message && err.message.includes(code)) return message;
    }
    return err.message || String(err);
}

// -------------------------------------------------------------------------
// Main Export
// -------------------------------------------------------------------------

/**
 * Mints a LearnCert NFT certificate gaslessly via UGF.
 *
 * The student (wallet) signs nothing and pays nothing.
 * UGF settles all gas costs using TYI_MOCK_USD from the server wallet.
 *
 * @param {ethers.Wallet} wallet     - ethers.Wallet instance for the student (private key loaded)
 * @param {string}        courseName - Name of completed course, e.g. "Machine Learning 101"
 * @param {number}        score      - Genuineness score 0–100 from behavior analysis
 * @returns {Promise<{ txHash: string, tokenId: number }>}
 */
async function mintCertificateGasless(wallet, courseName, score) {
    // ------------------------------------------------------------------
    // Input Validation — fail fast with clear messages before any network call
    // ------------------------------------------------------------------
    if (!process.env.CONTRACT_ADDRESS) {
        throw new Error("CONTRACT_ADDRESS not set in .env");
    }
    if (!wallet || !wallet.address) {
        throw new Error("wallet is required");
    }
    if (!courseName || courseName.trim().length === 0) {
        throw new Error("courseName is required");
    }
    if (score < 0 || score > 100) {
        throw new Error("score must be 0-100");
    }

    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

    // ------------------------------------------------------------------
    // Stage 0: Setup — connect wallet to Base Sepolia provider
    // ------------------------------------------------------------------
    const client          = new UGFClient();
    const provider        = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const connectedWallet = wallet.connect(provider);

    // Build calldata once — reused in quote + sponsorAndExecute callback
    const iface    = new ethers.Interface(LEARNCERT_ABI);
    const calldata = iface.encodeFunctionData("mint", [
        wallet.address,  // recipient = the student's wallet
        courseName,
        score,
    ]);

    const txObject = {
        from:  wallet.address,
        to:    CONTRACT_ADDRESS,
        data:  calldata,
        value: "0",
    };

    // ------------------------------------------------------------------
    // Stage 1: Auth — authenticate wallet with UGF service
    // ------------------------------------------------------------------
    console.log("[UGF Stage 1/4] Authenticating wallet...");
    try {
        await client.auth.login(connectedWallet);
        console.log("[UGF Stage 1/4] ✓ Auth complete");
    } catch (err) {
        console.error(`[UGF FAILED at Stage 1] ${err.message}`);
        throw new Error(`UGF_STAGE_1_FAILED: ${humanizeUGFError(err)}`);
    }

    // ------------------------------------------------------------------
    // Stage 2: Quote — get gas cost estimate for this specific tx
    // ------------------------------------------------------------------
    console.log("[UGF Stage 2/4] Getting gas quote...");
    let quote;
    try {
        quote = await client.quote.get({
            payer_address: wallet.address,
            tx_object:     JSON.stringify(txObject),
            payment_coin:  PAYMENT_COIN,
        });
        console.log(`[UGF Stage 2/4] ✓ Quote received. Estimated cost: ${quote.cost}`);
    } catch (err) {
        console.error(`[UGF FAILED at Stage 2] ${err.message}`);
        throw new Error(`UGF_STAGE_2_FAILED: ${humanizeUGFError(err)}`);
    }

    // ------------------------------------------------------------------
    // Stage 3: Payment — settle gas cost via x402 protocol
    // ------------------------------------------------------------------
    console.log("[UGF Stage 3/4] Executing x402 payment settlement...");
    try {
        await client.payment.x402.execute({
            quote:  quote,
            signer: connectedWallet,
        });
        console.log("[UGF Stage 3/4] ✓ Payment settled");
    } catch (err) {
        console.error(`[UGF FAILED at Stage 3] ${err.message}`);
        throw new Error(`UGF_STAGE_3_FAILED: ${humanizeUGFError(err)}`);
    }

    // ------------------------------------------------------------------
    // Stage 4: Execute — UGF sponsors and submits the actual mint tx
    // ------------------------------------------------------------------
    console.log("[UGF Stage 4/4] Sponsoring and executing mint transaction...");
    let txHash;
    try {
        const txResult = await client.chains.evm.sponsorAndExecute(
            quote.digest,
            connectedWallet,
            async () => txObject   // closure captures txObject
        );
        // SDK returns object { userTxHash: "0x..." } not a plain string
        txHash = txResult?.userTxHash || txResult?.txHash || txResult;
        console.log(`[UGF Stage 4/4] ✓ Transaction submitted: ${txHash}`);
    } catch (err) {
        console.error(`[UGF FAILED at Stage 4] ${err.message}`);
        throw new Error(`UGF_STAGE_4_FAILED: ${humanizeUGFError(err)}`);
    }

    // ------------------------------------------------------------------
    // Stage 5: Confirm — wait for on-chain receipt and extract tokenId
    // ------------------------------------------------------------------
    const receipt = await provider.waitForTransaction(txHash, 1, 120000);
    if (!receipt || receipt.status !== 1) {
        throw new Error(
            `Transaction failed on-chain. Check: https://sepolia.basescan.org/tx/${txHash}`
        );
    }

    // Parse CertificateMinted event to get the tokenId
    const contract  = new ethers.Contract(CONTRACT_ADDRESS, LEARNCERT_ABI, provider);
    const mintEvent = receipt.logs
        .map((log) => {
            try { return contract.interface.parseLog(log); }
            catch { return null; }
        })
        .find((e) => e && e.name === "CertificateMinted");

    const tokenId = mintEvent ? Number(mintEvent.args.tokenId) : null;
    console.log(`✓ NFT minted! Token ID: ${tokenId}`);
    console.log(`  BaseScan: https://sepolia.basescan.org/tx/${txHash}`);

    return { txHash, tokenId };
}

module.exports = { mintCertificateGasless };
