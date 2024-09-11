import { Connection, PublicKey } from '@solana/web3.js';

async function getProgramAccounts(connection, programId) {
  const accounts = await connection.getProgramAccounts(programId);
  return accounts;
}

//const connection = new Connection('https://api.devnet.solana.com');
const connection = new Connection('http://localhost:8899');
const programId = new PublicKey('ARaNLWxV2C77CXYCfK5kVa9XaougVxs6aRFshRL8QtTt');
const accounts = await getProgramAccounts(connection, programId);

console.log(accounts);
