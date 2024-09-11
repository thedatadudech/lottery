import React, { useState, useMemo } from "react";
// import { useWallet } from "@solana/wallet-adapter-react"; // TODO: Uncomment when integrating
// import { PublicKey } from "@solana/web3.js"; // TODO: Uncomment when integrating
import { ExplorerLink } from "../cluster/cluster-ui";
// import { useLotteryProgram, useGetProgramAccounts } from './account-data-access'; // TODO: Uncomment when integrating
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Demo Data (to be removed once integrated)
const demoLotteries = [
  {
    pubkey: "DemoLottery1",
    account: {
      ticket_price: 0.1 * LAMPORTS_PER_SOL, // Ticket price in SOL
    },
  },
  {
    pubkey: "DemoLottery2",
    account: {
      ticket_price: 0.25 * LAMPORTS_PER_SOL, // Ticket price in SOL
    },
  },
  {
    pubkey: "DemoLottery3",
    account: {
      ticket_price: 0.5 * LAMPORTS_PER_SOL, // Ticket price in SOL
    },
  },
];

// Mock function for ellipsifying strings (already included in your code)
function ellipsify(str: string) {
  return str.length > 10 ? `${str.slice(0, 5)}...${str.slice(-5)}` : str;
}

// LotteryCard Component
export function LotteryCard({ lottery }: { lottery: any }) {
  // const { publicKey } = useWallet(); // TODO: Uncomment when integrating
  // const { createTicketAccount, buyTicket } = useLotteryProgram(); // TODO: Uncomment when integrating
  const [ticketAccount, setTicketAccount] = useState<string | null>(null); // Using string for demo

  const handleCreateTicketAccount = async () => {
    // TODO: Replace with real createTicketAccount logic
    // Example: const ticketAccountPublicKey = await createTicketAccount.mutateAsync({
    // if (publicKey) {
    //   const ticketAccountPublicKey = await createTicketAccount.mutateAsync({
    //     lotteryPubkey: lottery.pubkey,
    //     userPubkey: publicKey,
    //   });
    setTicketAccount("DemoTicketAccount1"); // Mocking a successful ticket account creation
    // }
  };

  const handleBuyTicket = async () => {
    // TODO: Replace with real buyTicket logic
    // Example: await buyTicket.mutateAsync({
    if (ticketAccount) {
      console.log(`Buying a ticket for lottery ${lottery.pubkey}`);
      alert(`Ticket bought for lottery: ${lottery.pubkey}`);
    }
  };

  return (
    <div className="card shadow-md p-4 space-y-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Lottery
          {/* Lottery - {ellipsify(lottery.pubkey.toString())} */}
        </h2>
        {/* <ExplorerLink
          label={ellipsify(lottery.pubkey.toString())}
          path={`account/${lottery.pubkey.toString()}`}
        /> */}
      </div>
      <div>
        <p className="text-gray-500">
          Ticket Price:  SOL
        </p>
      </div>
      <div className="flex space-x-4">
        {!ticketAccount ? (
          <button
            className="btn btn-primary"
            onClick={handleCreateTicketAccount}
          >
            Create Ticket Account
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleBuyTicket}>
            Buy Ticket
          </button>
        )}
      </div>
    </div>
  );
}

// LotteryList Component with demo data
export function LotteryList() {
  // const { publicKey } = useWallet(); // TODO: Uncomment when integrating
  // const query = useGetProgramAccounts({ address: publicKey }); // TODO: Uncomment when integrating

  // Mocking the query for demo purposes
  const query = {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: demoLotteries, // Replace with actual data from useGetProgramAccounts when integrating
  };

  return (
    <div className="space-y-4">
      {query.isLoading && <div>Loading...</div>}
      {query.isError && <div>Error loading lotteries.</div>}
      {query.isSuccess && query.data.length === 0 && (
        <div>No lotteries found.</div>
      )}
      {query.isSuccess && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {query.data.map((lottery) => (
            <LotteryCard key={lottery.pubkey.toString()} lottery={lottery} />
          ))}
        </div>
      )}
    </div>
  );
}
