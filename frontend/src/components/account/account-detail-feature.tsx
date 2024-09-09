import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { fetchAccountInfo } from "../../solana-connection";
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountTransactions,
} from "./account-ui";
import NftDex from "../NftDex";

export default function AccountDetailFeature() {
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
  }, [publicKey]); // D

  if (!publicKey) {
    return <div>Error loading account</div>;
  }

  return (
    <div>
      <AppHero
        title={<AccountBalance address={publicKey} />}
        subtitle={<div className="my-4">100</div>}
      >
        <div className="my-4">
          <AccountButtons address={publicKey} />
        </div>
        <div>
          <NftDex />
        </div>
      </AppHero>
      <div className="space-y-8">
        <AccountTokens address={publicKey} />
        <AccountTransactions address={publicKey} />
      </div>
    </div>
  );
}
