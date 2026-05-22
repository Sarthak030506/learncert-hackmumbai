import { sessionService } from "./session.service";
import { scoringService } from "./scoring.service";
import { mockUgfService } from "./ugf.service";
import crypto from "crypto";
import { ethers } from "ethers";

export const certificateService = {
  certificates: new Map<string, any[]>(),

  mintCertificate: async (userId: string, sessionId: string, walletAddress: string) => {
    // 1. Get session and check eligibility
    const session = sessionService.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const eligibility = scoringService.checkEligibility(session);
    if (!eligibility.eligible) {
      throw new Error("Session is not eligible for minting");
    }

    // 2. Generate Session Hash
    const sessionDataString = JSON.stringify({
      userId,
      videoId: session.video.videoId,
      score: eligibility.score.finalScore,
      timestamp: Date.now()
    });
    const sessionHash = crypto.createHash("sha256").update(sessionDataString).digest("hex");
    const bytes32SessionHash = "0x" + sessionHash;

    // 3. Encode Contract Call
    // function mint(address to, string memory videoTitle, string memory videoId, uint256 credibilityScore, uint256 completionPercentage, bytes32 sessionHash)
    const iface = new ethers.Interface([
      "function mint(address to, string videoTitle, string videoId, uint256 credibilityScore, uint256 completionPercentage, bytes32 sessionHash)"
    ]);
    
    const encodedData = iface.encodeFunctionData("mint", [
      walletAddress,
      session.video.title,
      session.video.videoId,
      Math.floor(eligibility.score.finalScore),
      Math.floor(eligibility.score.completion),
      bytes32SessionHash
    ]);

    // 4. Send via UGF (Using mock for now if no env vars)
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
    
    const receipt = await mockUgfService.mintGasless(contractAddress, encodedData);

    if (receipt.status !== 1) {
      throw new Error("Gasless transaction failed");
    }

    // 5. Store certificate
    const cert = {
      id: crypto.randomUUID(),
      userId,
      sessionId,
      videoTitle: session.video.title,
      videoId: session.video.videoId,
      transactionHash: receipt.transactionHash,
      issuedAt: Date.now()
    };

    const userCerts = certificateService.certificates.get(userId) || [];
    userCerts.push(cert);
    certificateService.certificates.set(userId, userCerts);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      certificate: cert
    };
  },

  getUserCertificates: (userId: string) => {
    return certificateService.certificates.get(userId) || [];
  }
};
