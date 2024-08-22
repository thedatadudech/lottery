import { Connection, PublicKey, AccountInfo } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export const fetchAccountInfo = async (
  publicKey: PublicKey,
): Promise<AccountInfo<Buffer> | null> => {
  const accountInfo = await connection.getAccountInfo(publicKey);
  console.log("Account Info:", accountInfo);
  return accountInfo;
};
