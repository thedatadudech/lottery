import { WalletButton } from "../solana/solana-provider";

export default function AccountListFeature() {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <WalletButton />
      </div>
    </div>
  );
}
