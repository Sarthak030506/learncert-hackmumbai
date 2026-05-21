/**
 * getMockUSD.js — Swap Base Sepolia ETH for TYI_MOCK_USD via UGF faucet
 *
 * Flow (reverse-engineered from UGF faucet frontend):
 *   1. Auth      — sign into UGF gateway with your wallet
 *   2. Quote     — ask how many TYI_MOCK_USD you get for X ETH
 *   3. Pay ETH   — send ETH to payment_receiver address from the quote
 *   4. Verify    — tell UGF the ETH txHash so they confirm receipt
 *   5. Mint-sign — get a server-signed authorization for minting
 *   6. Mint      — call mintWithAuthorization() on the TYI_MOCK_USD contract
 *
 * Usage: node scripts/getMockUSD.js
 * Requires: PRIVATE_KEY in .env
 */

require("dotenv").config();
const { ethers } = require("ethers");
const https = require("https");

// -------------------------------------------------------------------------
// Config
// -------------------------------------------------------------------------
const RPC_URL          = "https://sepolia.base.org";
const GATEWAY_HOST     = "gateway.universalgasframework.com";
const TYI_USD_ADDRESS  = "0x27DC1C167AeF232bb1e21073304B526726a8727e";

// Amount of ETH to swap (adjust if needed — min is 0.00001 ETH)
// 0.003 ETH ≈ $6–7 of TYI_MOCK_USD at current rates
const ETH_TO_SWAP = "0.003";

// TYI_MOCK_USD ABI — only the functions we need
const TYI_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function mintWithAuthorization(address to, uint256 amount, bytes32 nonce, bytes signature)",
];

// -------------------------------------------------------------------------
// HTTP helpers
// -------------------------------------------------------------------------

function httpPost(path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const opts = {
            hostname: GATEWAY_HOST,
            path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const req = https.request(opts, (res) => {
            let d = "";
            res.on("data", (c) => (d += c));
            res.on("end", () => resolve({ status: res.statusCode, body: d }));
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

function httpGet(path, token) {
    return new Promise((resolve, reject) => {
        https
            .get(
                {
                    hostname: GATEWAY_HOST,
                    path,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                },
                (res) => {
                    let d = "";
                    res.on("data", (c) => (d += c));
                    res.on("end", () => resolve({ status: res.statusCode, body: d }));
                }
            )
            .on("error", reject);
    });
}

function parseJSON(raw, label) {
    try {
        return JSON.parse(raw);
    } catch {
        throw new Error(`Bad JSON from ${label}: ${raw.slice(0, 200)}`);
    }
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------

async function main() {
    if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set in .env");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("=".repeat(50));
    console.log("UGF Mock USD Faucet");
    console.log("=".repeat(50));
    console.log("Wallet:    ", wallet.address);

    // Show starting balances
    const ethBal = await provider.getBalance(wallet.address);
    const tyi    = new ethers.Contract(TYI_USD_ADDRESS, TYI_ABI, provider);
    const tyiBal = await tyi.balanceOf(wallet.address);
    console.log("ETH balance:     ", ethers.formatEther(ethBal), "ETH");
    console.log("TYI_MOCK_USD bal:", ethers.formatUnits(tyiBal, 6), "TYI");
    console.log("");

    const swapWei = ethers.parseEther(ETH_TO_SWAP);
    if (ethBal < swapWei + ethers.parseEther("0.001")) {
        throw new Error(
            `Not enough ETH. Need ${ETH_TO_SWAP} ETH to swap + ~0.001 ETH for gas. ` +
            `Have: ${ethers.formatEther(ethBal)} ETH`
        );
    }

    // ------------------------------------------------------------------
    // Step 1: Auth
    // ------------------------------------------------------------------
    console.log("[Step 1/6] Authenticating with UGF gateway...");
    const { body: nb } = await httpGet(`/auth/nonce?address=${wallet.address}`);
    const { nonce: authNonce } = parseJSON(nb, "nonce");

    const authSig = await wallet.signMessage(`Sign in to UGF\nNonce: ${authNonce}`);
    const { body: lb } = await httpPost("/auth/wallet-login", {
        address: wallet.address,
        nonce: authNonce,
        signature: authSig,
    });
    const { token } = parseJSON(lb, "login");
    if (!token) throw new Error("Auth failed — no JWT returned");
    console.log("        ✓ Auth OK\n");

    // ------------------------------------------------------------------
    // Step 2: Quote
    // ------------------------------------------------------------------
    console.log(`[Step 2/6] Getting quote for ${ETH_TO_SWAP} ETH...`);
    const { body: qb, status: qs } = await httpPost(
        "/testnet/quote",
        { recipient: wallet.address, ethAmountWei: swapWei.toString() },
        token
    );
    const quote = parseJSON(qb, "quote");
    if (qs !== 200 || !quote.success) throw new Error(`Quote failed: ${quote.error || qb}`);

    const mintAmountHuman = ethers.formatUnits(BigInt(quote.mint_amount), 6);
    console.log(`        ETH in:    ${ETH_TO_SWAP} ETH`);
    console.log(`        TYI out:   ${mintAmountHuman} TYI_MOCK_USD`);
    console.log(`        Rate:      1 ETH = $${quote.rate.eth_usd}`);
    console.log(`        Send ETH → ${quote.payment_receiver}`);
    console.log(`        Digest:    ${quote.digest}\n`);

    // ------------------------------------------------------------------
    // Step 3: Send ETH
    // ------------------------------------------------------------------
    console.log("[Step 3/6] Sending ETH to faucet...");
    const payTx = await wallet.sendTransaction({
        to: quote.payment_receiver,
        value: BigInt(quote.eth_amount_wei),
    });
    console.log(`        Tx sent: ${payTx.hash}`);
    const payReceipt = await payTx.wait(1);
    if (!payReceipt || payReceipt.status !== 1) {
        throw new Error(`ETH payment tx failed: ${payTx.hash}`);
    }
    console.log(`        ✓ ETH confirmed in block ${payReceipt.blockNumber}\n`);

    // ------------------------------------------------------------------
    // Step 4: Verify payment (wait a few seconds for gateway to index the block)
    // ------------------------------------------------------------------
    console.log("[Step 4/6] Waiting 8s for gateway to index block...");
    await new Promise((r) => setTimeout(r, 8000));
    console.log("        Verifying ETH payment with gateway...");
    const { body: vb, status: vs } = await httpPost(
        "/testnet/verify-payment",
        { digest: quote.digest, txHash: payTx.hash },
        token
    );
    const verify = parseJSON(vb, "verify");
    if (vs !== 200 || !verify.success) throw new Error(`Verify failed: ${verify.error || vb}`);
    console.log("        ✓ Payment verified\n");

    // ------------------------------------------------------------------
    // Step 5: Get mint signature from server
    // ------------------------------------------------------------------
    console.log("[Step 5/6] Requesting mint authorization signature...");
    const { body: mb, status: ms } = await httpPost(
        "/testnet/mint-sign",
        { digest: quote.digest },
        token
    );
    const mintSign = parseJSON(mb, "mint-sign");
    if (ms !== 200 || !mintSign.success) throw new Error(`Mint-sign failed: ${mintSign.error || mb}`);
    console.log("        ✓ Signature received\n");

    // ------------------------------------------------------------------
    // Step 6: Call mintWithAuthorization on TYI_MOCK_USD contract
    // ------------------------------------------------------------------
    console.log("[Step 6/6] Minting TYI_MOCK_USD to your wallet...");
    const tyiWithSigner = new ethers.Contract(TYI_USD_ADDRESS, TYI_ABI, wallet);
    const mintTx = await tyiWithSigner.mintWithAuthorization(
        wallet.address,
        BigInt(quote.mint_amount),
        mintSign.nonce,     // bytes32 nonce from mint-sign response
        mintSign.signature  // server-signed authorization
    );
    console.log(`        Mint tx: ${mintTx.hash}`);
    const mintReceipt = await mintTx.wait(1);
    if (!mintReceipt || mintReceipt.status !== 1) {
        throw new Error(`Mint tx failed: ${mintTx.hash}`);
    }
    console.log(`        ✓ Minted in block ${mintReceipt.blockNumber}\n`);

    // ------------------------------------------------------------------
    // Show final balance
    // ------------------------------------------------------------------
    const newTyiBal = await tyi.balanceOf(wallet.address);
    console.log("=".repeat(50));
    console.log("Done!");
    console.log(`TYI_MOCK_USD balance: ${ethers.formatUnits(newTyiBal, 6)} TYI`);
    console.log(`Minted: +${mintAmountHuman} TYI_MOCK_USD`);
    console.log("=".repeat(50));
}

main().catch((err) => {
    console.error("\nFailed:", err.message);
    process.exit(1);
});
