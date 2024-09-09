import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

const TransferForm: React.FC = () => {
  const { publicKey } = useWallet();

  const connection = new Connection(
    "https://api.testnet.solana.com",
    "confirmed",
  );
  if (publicKey) {
    const account = connection.getAccountInfo(publicKey);
    console.log(account);
  }

  return (
    <div>
      <h3>Transfer SOL</h3>
    </div>
  );
};

export default TransferForm;
