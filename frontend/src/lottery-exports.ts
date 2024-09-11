// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import LotteryIDL from '../../target/idl/lottery.json';
import type { Lottery } from '../../target/types/lottery';

// Re-export the generated IDL and type
export { Lottery, LotteryIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const LOTTERY_PROGRAM_ID = new PublicKey(
  '8b8fSgX4sqiW5amc6AD9sgj8NzS94N8V71ipJTPK9RPv'
);

// This is a helper function to get the Counter Anchor program.
export function getLotteryProgram(provider: AnchorProvider) {
  return new Program(LotteryIDL as Lottery, provider);
}

// This is a helper function to get the program ID for the Journal program depending on the cluster.
export function getLotteryProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return LOTTERY_PROGRAM_ID;
  }
}
