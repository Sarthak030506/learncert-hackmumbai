import dotenv from 'dotenv';
dotenv.config();

export interface EnvConfig {
  PORT: number;
  UGF_PRIVATE_KEY: string;
  CONTRACT_ADDRESS: string;
  BASE_SEPOLIA_RPC: string;
}

export const config: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  UGF_PRIVATE_KEY: process.env.UGF_PRIVATE_KEY || '',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
  BASE_SEPOLIA_RPC: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
};
