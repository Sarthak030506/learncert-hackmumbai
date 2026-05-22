import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x0A3769Ada9cBA047678998293D3cE25f04C397DB";
const RPC_URL = "https://sepolia.base.org";

// The contract returns a struct — ABI has an outer 32-byte offset wrapper that
// ethers auto-decode can't handle. We use provider.call() + manual AbiCoder instead.
const SIMPLE_ABI = [
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getCertificate(uint256 tokenId) view returns (string, uint8, uint256, address)",
];

export interface Certificate {
  tokenId: number;
  courseName: string;
  genuinenessScore: number;
  issuedAt: number;
  studentWallet: string;
}

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, getProvider());
}

export async function getTotalSupply(): Promise<number | null> {
  try {
    const supply = await getContract().totalSupply();
    return Number(supply);
  } catch {
    return null;
  }
}

export async function getCertificate(tokenId: number): Promise<Certificate | null> {
  try {
    const provider = getProvider();
    const iface = new ethers.Interface(SIMPLE_ABI);

    // Use raw call to get bytes, then strip the outer struct offset word (first 32 bytes)
    const raw: string = await provider.call({
      to: CONTRACT_ADDRESS,
      data: iface.encodeFunctionData("getCertificate", [tokenId]),
    });

    const stripped = "0x" + raw.slice(2 + 64); // skip '0x' + 32 bytes (64 hex chars)
    const [courseName, genuinenessScore, issuedAt, studentWallet] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ["string", "uint8", "uint256", "address"],
        stripped
      );

    return {
      tokenId,
      courseName: String(courseName),
      genuinenessScore: Number(genuinenessScore),
      issuedAt: Number(issuedAt),
      studentWallet: String(studentWallet),
    };
  } catch {
    return null;
  }
}

// ownerOf loop avoids the 2000-block RPC event-log limit on Base Sepolia
export async function getCertificatesByWallet(walletAddress: string): Promise<number[]> {
  try {
    const contract = getContract();
    const total = Number(await contract.totalSupply());
    if (!total) return [];

    const normalized = walletAddress.toLowerCase();
    const results = await Promise.all(
      Array.from({ length: total }, (_, i) => i + 1).map(async (id) => {
        try {
          const owner: string = await contract.ownerOf(id);
          return owner.toLowerCase() === normalized ? id : null;
        } catch {
          return null;
        }
      })
    );
    return results.filter((id): id is number => id !== null);
  } catch {
    return [];
  }
}

export async function getAllCertificates(limit = 10): Promise<Certificate[]> {
  try {
    const total = await getTotalSupply();
    if (!total) return [];
    const start = Math.max(1, total - limit + 1);
    const tokenIds = Array.from({ length: total - start + 1 }, (_, i) => total - i);
    const certs = await Promise.all(tokenIds.map(getCertificate));
    return certs.filter((c): c is Certificate => c !== null);
  } catch {
    return [];
  }
}

export async function getWalletCertificates(walletAddress: string): Promise<Certificate[]> {
  try {
    const tokenIds = await getCertificatesByWallet(walletAddress);
    if (!tokenIds.length) return [];
    const certs = await Promise.all(tokenIds.map(getCertificate));
    const valid = certs.filter((c): c is Certificate => c !== null);
    return valid.sort((a, b) => b.issuedAt - a.issuedAt);
  } catch {
    return [];
  }
}
