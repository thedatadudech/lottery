import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {getLotteryProgram, getLotteryProgramId} from "../../lottery-exports"
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Cluster,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionBlockhashCtor,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,  
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from "../ui/ui-layout";
import { useAnchorProvider } from '../solana/solana-provider'
import { useMemo } from 'react';
import React from "react";
import { web3 } from "@coral-xyz/anchor";

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  });
}

interface CreateLotteryArgs {
  ticket_price: bigint;
  oracle_pubkey: PublicKey; 
  admin: PublicKey;
}




export function useLotteryProgram() {
  console.log("hello from useLotteryProgram")
  const { connection } = useConnection();
  const { cluster } = useCluster();
 
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  

  const programId = useMemo(
    () => getLotteryProgramId(cluster.network as Cluster),
    [cluster]
  );
  console.log("Program_ID", programId.toString())
  const program = getLotteryProgram(provider);
 
    
  const accounts = useQuery({    
    queryKey: ['lottery', 'all', { cluster }],
    queryFn: () => program.account.lottery.all(),
  });


    const createLotteryAccount = async () => {  
      const connection = provider.connection;
      const wallet = provider.wallet;
    
      const lotteryAccount = new web3.Keypair();  // Neues Konto für die Lotterie
      
    
      // Hole den neuesten Blockhash und die dazugehörigen Daten
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
      // Transaktion erstellen, um ein neues Konto zu erstellen
      const transaction = new Transaction({
        recentBlockhash: blockhash,  // Füge den recentBlockhash hinzu
        feePayer: wallet.publicKey,  // Das Wallet des Benutzers als Payer
      } as TransactionBlockhashCtor).add(
        web3.SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,  // Payer ist das Wallet des Benutzers
          newAccountPubkey: lotteryAccount.publicKey,  // Neues Konto für die Lotterie
          lamports: await connection.getMinimumBalanceForRentExemption(180),  // Mindestmiete für das Konto
          space: 180,  // Speicherplatz für das Konto
          programId: programId,  // ID des Programms
        })
      );


      transaction.partialSign(lotteryAccount);  
    
       // Signiere die Transaktion
      const signedTransaction = await wallet.signTransaction(transaction);

      // Sende die signierte Transaktion manuell an die Solana Blockchain
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      const confirmationStrategy = {
        signature,  // Transaktionssignatur
        blockhash,  // Blockhash der Transaktion
        lastValidBlockHeight,  // Letzte gültige Blockhöhe
      };
    
      await connection.confirmTransaction(confirmationStrategy);
    
      // Rückgabe des PublicKeys des neuen Kontos
      return lotteryAccount    
   
  };


  
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });  
  
  
  const createLottery = useMutation<string, Error, CreateLotteryArgs>({
    mutationKey: ['lotteryEntry', 'create', { cluster }],
    mutationFn: async ({ ticket_price, oracle_pubkey,  }) => {    
      console.log("Hello from Lottery creation");
      const lottery = web3.Keypair.generate();
      const lottery_admin = web3.Keypair.generate();
             
      await provider.connection.requestAirdrop(
        lottery.publicKey,
        2 * LAMPORTS_PER_SOL
      )
      await provider.connection.requestAirdrop(
        lottery_admin.publicKey,
        2 * LAMPORTS_PER_SOL
      )  
      return await program.methods.initialiseLottery(ticket_price, oracle_pubkey).accounts({
        lottery: lottery.publicKey,
        admin: lottery_admin.publicKey,        
      }).signers([lottery, lottery_admin]).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);      
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });


  interface BuyTicketArgs {  
    lottery: PublicKey;    
  }
  
  const buyTicket = useMutation<string, Error, BuyTicketArgs>({
    mutationKey: ['buyticket', 'buy', { cluster }],
    mutationFn: async ({ lottery  }) => { 
      const player = web3.Keypair.generate()
      await provider.connection.requestAirdrop(
        player.publicKey,
        2 * LAMPORTS_PER_SOL
      ) 
      //const idx = (await program.account.lottery.fetch(lottery)).count
      const idx = 1
      console.log("Number of tickets", idx)
      // Consutruct buffer containing latest index
      const buf1 = Buffer.alloc(4);
      buf1.writeUIntBE(idx, 0, 4);        
    // Get lottery ticket
     return await program.methods
      .buyTicket()
      .accounts({
        lottery: lottery,
        buyer: player.publicKey,          
      })
      .signers([player])
      .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);      
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to buy ticket: ${error.message}`);
    },  
});





  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createLottery,
    buyTicket
  };
}

export function useLotteryProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
 
  const { program,  } = useLotteryProgram();

  const accountQuery = useQuery({
    queryKey: ['lottery', 'fetch', { cluster, account }],
    queryFn: () => program.account.lottery.fetch(account),
  });

    

  return {
    accountQuery,    
  };
}














export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getSignaturesForAddress(address),
  });
}



export function useGetProgramAccounts({address}: {address: PublicKey}) {
  const {connection} = useConnection()
 
  return useQuery({
    queryKey: [
      "get-program-accounts",
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      const [programAccounts,] = await Promise.all([
        connection.getProgramAccounts(address),
     
        
      ]);
      return [...programAccounts];
    },
  });
}


export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      "get-token-accounts",
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);
      return [...tokenAccounts.value, ...token2022Accounts.value];
    },
  });
}

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const wallet = useWallet();
  const client = useQueryClient();

  return useMutation({
    mutationKey: [
      "transfer-sol",
      { endpoint: connection.rpcEndpoint, address },
    ],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = "";
      try {
        const { transaction, latestBlockhash } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        });

        // Send transaction and await for signature
        signature = await wallet.sendTransaction(transaction, connection);

        // Send transaction and await for signature
        await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          "confirmed",
        );

        console.log(signature);
        return signature;
      } catch (error: unknown) {
        console.log("error", `Transaction failed! ${error}`, signature);

        return;
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        transactionToast(signature);
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["airdrop", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ]);

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return Promise.all([
        client.invalidateQueries({
          queryKey: [
            "get-balance",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            "get-signatures",
            { endpoint: connection.rpcEndpoint, address },
          ],
        }),
      ]);
    },
  });
}

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey;
  destination: PublicKey;
  amount: number;
  connection: Connection;
}): Promise<{
  transaction: VersionedTransaction;
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number };
}> {
  // Get the latest blockhash to use in our transaction
  const latestBlockhash = await connection.getLatestBlockhash();

  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  ];

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage();

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy);

  return {
    transaction,
    latestBlockhash,
  };
}


