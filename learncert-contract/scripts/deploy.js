/**
 * deploy.js — Deploys LearnCert.sol to Base Sepolia via Hardhat.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network baseSepolia
 *
 * After deploy: copy the printed CONTRACT_ADDRESS into your .env file.
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LearnCert to Base Sepolia...\n");

  // Get deployer wallet from PRIVATE_KEY in .env
  const [deployer] = await ethers.getSigners();
  console.log("Deployer wallet:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const LearnCert = await ethers.getContractFactory("LearnCert");
  const contract = await LearnCert.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("==========================================");
  console.log("LearnCert deployed successfully!");
  console.log("CONTRACT_ADDRESS =", address);
  console.log("==========================================");
  console.log("\nBaseScan URL:");
  console.log("https://sepolia.basescan.org/address/" + address);
  console.log("\nNext: Add CONTRACT_ADDRESS to your .env file.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
