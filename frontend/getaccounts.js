import { Connection, PublicKey } from '@solana/web3.js';

async function getProgramAccounts(connection, programId) {
  const accounts = await connection.getProgramAccounts(programId);
  return accounts;
}

//const connection = new Connection('https://api.devnet.solana.com');
const connection = new Connection('http://localhost:8899');
const programId = new PublicKey('GGpt3q7Ntk2PbKVrqwUTB7GHc1entFRoaCeyqgtBxEoM');
const accounts = await getProgramAccounts(connection, programId);

console.log(accounts);
