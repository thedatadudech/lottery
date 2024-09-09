import { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "./App.css";
import BalanceDisplay from "./components/BalanceDisplay";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import BlockchainAnimation from "./components/BlockchainAnimation";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import TransferForm from "./components/TransferForm";

function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      // if desired, manually define specific/custom wallets here (normally not required)
      // otherwise, the wallet-adapter will auto detect the wallets a user's browser has available
    ],
    [network],
  );

  return (
    <ChakraProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="app-container">
              <div>
                <h1 className="animated-title">
                  Solana Bootcamp Project : Lottery
                </h1>
              </div>
              <div className="transfer-box">
                <TransferForm />
              </div>
            </div>

            <div className="wallet-container">
              <WalletMultiButton />
              <div className="neon-text">
                <BalanceDisplay />
              </div>
            </div>
            <BlockchainAnimation />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
}

export default App;
