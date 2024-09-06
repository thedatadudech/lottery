import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { extendBaseTheme, theme as chakraTheme } from "@chakra-ui/react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "./App.css";
import BalanceDisplay from "./components/BalanceDisplay";
import NftDex from "./components/NftDex";
import BuyTicker from "./components/BuyTicket";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import BlockchainAnimation from "./components/BlockchainAnimation";

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

   // Function to handle Buy Ticket button click
  const handleBuyTicketClick = () => {
    BuyTicket(); // Call the BuyTicket function
  };
 

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app-container">
            <h1 className="animated-title">
              Solana Bootcamp Project : Lottery
            </h1>
            <NftDex />
          </div>
          <div className="wallet-container">
            <WalletMultiButton />
            <div className="neon-text">
              <BalanceDisplay />
            </div>
          </div>
          <BlockchainAnimation />
          <div className="buy-ticket-container">
            <button className="buy-ticket-button" onClick={handleBuyTicketClick}>
              Buy Ticket
            </button>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
