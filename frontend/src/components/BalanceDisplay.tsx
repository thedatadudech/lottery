import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchAccountInfo } from "../solana-connection";

const BalanceDisplay: React.FC = () => {
  // `balance` will store the SOL balance, initialized to null (no data yet)
  const [balance, setBalance] = useState<number | null>(null);

  // `useWallet` provides the public key of the connected wallet
  const { publicKey } = useWallet();

  useEffect(() => {
    // This effect runs whenever `publicKey` changes (i.e., when a wallet connects or changes)
    if (publicKey) {
      // Fetch account info from Solana blockchain using the public key
      fetchAccountInfo(publicKey).then((accountInfo: any) => {
        if (accountInfo) {
          // Convert lamports to SOL (1 SOL = 1e9 lamports) and update `balance`
          setBalance(accountInfo.lamports / 1e9);
        }
      });
    }
  }, [publicKey]); // Dependency array: effect runs when `publicKey` changes

  // Display the SOL balance or a "Loading..." message if balance is still null
  return <p>Your SOL balance: {balance !== null ? balance : "Loading..."}</p>;
};

export default BalanceDisplay;
