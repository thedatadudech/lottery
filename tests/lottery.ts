import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey, Connection} from '@solana/web3.js';
import { Lottery } from "../target/types/lottery";
const { SystemProgram} = anchor.web3;

describe("Lottery test", () => {

  const LAMPORTS_PER_SOL = 1000000000;

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Local wallet
  const wallet = provider.wallet;

  const program = anchor.workspace.Lottery as anchor.Program<Lottery>;

  // Account address generated here
  const lottery = anchor.web3.Keypair.generate();
  const lottery_admin = anchor.web3.Keypair.generate();
  const player1 = anchor.web3.Keypair.generate();
  const oracle = anchor.web3.Keypair.generate();
  const connection = new Connection(provider.connection.rpcEndpoint);

  before(async () => {
    // Top up all acounts that will need lamports for account creation
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        lottery_admin.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player1.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
  });

  it("Creates a lottery account, buy ticket and mint ticket NFT", async () => {
    
    console.log("Creating lottery account ...");
    let tx = await program.methods
      .initialiseLottery(new anchor.BN(LAMPORTS_PER_SOL), oracle.publicKey)
      .accounts({
        lottery: lottery.publicKey,
        admin: lottery_admin.publicKey,
        //systemProgram: SystemProgram.programId,
      })
      .signers([lottery, lottery_admin])
      .rpc();
    console.log("Create lottery account tx signature", tx);


    console.log("Buying lottery ticket ...");
    let lotteryState = await program.account.lottery.fetch(lottery.publicKey);

    // Get starting balances for player1 and lottery account
    let startBalancePlayer: number = await provider.connection.getBalance(
      wallet.publicKey
    );
    let startBalanceLottery: number = await provider.connection.getBalance(
      lottery.publicKey
    );

    // Get lottery index
    let idx: number = (await program.account.lottery.fetch(lottery.publicKey))
      .count;

    // Consutruct buffer containing latest index
    const buf1 = Buffer.alloc(4);
    buf1.writeUIntBE(idx, 0, 4);

    // Create Ticket account PDA
    const [ticket_account_address, bumpPDA] = await PublicKey.findProgramAddressSync(
      [buf1, lottery.publicKey.toBytes()],
      program.programId
    );

    // Get lottery ticket
    const tx1 = await program.methods
      .buyTicket()
      .accounts({
        lottery: lottery.publicKey,
        buyer: player1.publicKey,
        ticket: ticket_account_address,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();
    console.log("Buy ticket tx signature ", tx1);

    // Get ending balances for player and lottery
    let endBalanacePlayer: number = await provider.connection.getBalance(
      player1.publicKey
    );
    let endBalanceLottery: number = await provider.connection.getBalance(
      lottery.publicKey
    );

    // Setup of the numbers and NFT ticket mint
    const numbersArray = [7, 4, 4, 4, 5, 6]; // Use a regular array of numbers
    console.log("Creating lottery ticket NFT ...");
    console.log(`Numbers: ${numbersArray.join(",")}`);

    // Derive the PDA for your ticket account using the seed and program ID
    const [ticketPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from(new Uint8Array(numbersArray))],
      program.programId
    );
    const tokenAddress = anchor.utils.token.associatedAddress({
      mint: ticketPda,
      owner: player1.publicKey
    });
    
    // Check if the PDA already exists
    const accountInfo = await connection.getAccountInfo(ticketPda);
    if (accountInfo) {
      console.log(`Ticket with numbers: ${numbersArray.join(",")} already exists.`);
      console.log("Choose other numbers...");
      return;
    }

    let ticketAccount = await program.account.ticket.fetch(ticket_account_address);

    // Mint the ticket
    const tx2 = await program.methods.mintTicket(numbersArray, bump)
      .accounts({
        mintAccount: ticketPda,
        payer: player1.publicKey,
        tokenAccount: tokenAddress,
        ticket: ticket_account_address,
      })
      .signers([player1])
      .rpc();
    console.log("Mint NFT tx signature ", tx2);


  });
});
