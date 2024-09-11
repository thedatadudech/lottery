import React, { useEffect, useState } from "react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { fetchAccountInfo } from "../../solana-connection";
import {getLotteryProgram, getLotteryProgramId} from "../../lottery-exports"
import { useCluster } from '../cluster/cluster-data-access';
import { useMemo } from 'react';
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountLottery,
  AccountTransactions,
} from "./account-ui";
import NftDex from "../NftDex";

export default function AccountDetailFeature() {
  const [balance, setBalance] = useState<number | null>(null);

  const {cluster} = useCluster() 
  // `useWallet` provides the public key of the connected wallet
  const { publicKey } = useWallet();
  const programId = useMemo(
    () => getLotteryProgramId(cluster.network as Cluster),
    [cluster]
  );
  

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

  const lottery = new PublicKey("3UHTq78o9qYm5W4n1BEeLtSK8SwyHEaDUt6ipEFBgqaZ")

  return (
    <div>
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
        <AccountLottery address={programId} />
        <AccountTokens address={publicKey} />
        <AccountTransactions address={publicKey} />
      </div>      
    </div>    
  </div>
  );
}
