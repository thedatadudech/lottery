import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { IconRefresh } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppModal, ellipsify } from "../ui/ui-layout";
import { useCluster } from "../cluster/cluster-data-access";
import { ExplorerLink } from "../cluster/cluster-ui";
import { BN, web3 } from "@coral-xyz/anchor";

import {
  useLotteryProgram,
  useGetProgramAccounts,
} from "./account-data-access";

import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
} from "./account-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { getLotteryProgram } from "../../lottery-exports";

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div>
      <h1
        className="text-5xl font-bold cursor-pointer"
        onClick={() => query.refetch()}
      >
        {query.data ? <BalanceSol balance={query.data} /> : "..."} SOL
      </h1>
    </div>
  );
}
export function AccountChecker() {
  const { publicKey } = useWallet();
  if (!publicKey) {
    return null;
  }
  return <AccountBalanceCheck address={publicKey} />;
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster();
  const mutation = useRequestAirdrop({ address });
  const query = useGetBalance({ address });

  if (query.isLoading) {
    return null;
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account
          is not found on this cluster.
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() =>
            mutation.mutateAsync(1).catch((err) => console.log(err))
          }
        >
          Request Airdrop
        </button>
      </div>
    );
  }
  return null;
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false);
  const [showCountTicketModal, setShowCountTicketModal] = useState(false);

  return (
    <div>
      <ModalAirdrop
        hide={() => setShowAirdropModal(false)}
        address={address}
        show={showAirdropModal}
      />
      <ModalReceive
        address={address}
        show={showReceiveModal}
        hide={() => setShowReceiveModal(false)}
      />
      <ModalSend
        address={address}
        show={showSendModal}
        hide={() => setShowSendModal(false)}
      />
      <ModalCreateLottery
        address={address}
        show={showCreateModal}
        hide={() => setShowCreateModal(false)}
      />
      <ModalBuyTicket
        address={address}
        show={showBuyTicketModal}
        hide={() => setShowBuyTicketModal(false)}
      />
      <ModalCountTicket
        address={address}
        show={showCountTicketModal}
        hide={() => setShowCountTicketModal(false)}
      />

      <div className="space-x-2">
        <button
          disabled={cluster.network?.includes("mainnet")}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowAirdropModal(true)}
        >
          Airdrop
        </button>
        <button
          disabled={wallet.publicKey?.toString() !== address.toString()}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowSendModal(true)}
        >
          Send
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowReceiveModal(true)}
        >
          Receive
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowCreateModal(true)}
        >
          Create Lottery
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowBuyTicketModal(true)}
        >
          Buy Ticket
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowCountTicketModal(true)}
        >
          Count Ticket
        </button>
      </div>
    </div>
  );
}

export function AccountLottery({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false);
  const query = useGetProgramAccounts({ address });

  const client = useQueryClient();
  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-2">
      <div className="justify-between">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Lottery Accounts</h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => query.refetch()}
              >
                <IconRefresh size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isError && (
        <pre className="alert alert-error">
          Error: {query.error?.message.toString()}
        </pre>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No token accounts found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Public Key</th>
                  <th>No Tickets</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {items?.map(({ account, pubkey }) => (
                  <tr key={pubkey.toString()}>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(pubkey.toString())}
                            path={`account/${pubkey.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono">{account.data.count}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-mono">
                        {account.lamports / LAMPORTS_PER_SOL} SOL
                      </span>
                    </td>
                  </tr>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Show Less" : "Show All"}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false);
  const query = useGetTokenAccounts({ address });
  const client = useQueryClient();
  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-2">
      <div className="justify-between">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Token Accounts</h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <button
                className="btn btn-sm btn-outline"
                onClick={async () => {
                  await query.refetch();
                  await client.invalidateQueries({
                    queryKey: ["getTokenAccountBalance"],
                  });
                }}
              >
                <IconRefresh size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isError && (
        <pre className="alert alert-error">
          Error: {query.error?.message.toString()}
        </pre>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No token accounts found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Public Key</th>
                  <th>Mint</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {items?.map(({ account, pubkey }) => (
                  <tr key={pubkey.toString()}>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(pubkey.toString())}
                            path={`account/${pubkey.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.data.parsed.info.mint)}
                            path={`account/${account.data.parsed.info.mint.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono">
                        {account.data.parsed.info.tokenAmount.uiAmount}
                      </span>
                    </td>
                  </tr>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Show Less" : "Show All"}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address });
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="space-x-2">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => query.refetch()}
            >
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && (
        <pre className="alert alert-error">
          Error: {query.error?.message.toString()}
        </pre>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Signature</th>
                  <th className="text-right">Slot</th>
                  <th>Block Time</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.signature}>
                    <th className="font-mono">
                      <ExplorerLink
                        path={`tx/${item.signature}`}
                        label={ellipsify(item.signature, 8)}
                      />
                    </th>
                    <td className="font-mono text-right">
                      <ExplorerLink
                        path={`block/${item.slot}`}
                        label={item.slot.toString()}
                      />
                    </td>
                    <td>
                      {new Date((item.blockTime ?? 0) * 1000).toISOString()}
                    </td>
                    <td className="text-right">
                      {item.err ? (
                        <div
                          className="badge badge-error"
                          title={JSON.stringify(item.err)}
                        >
                          Failed
                        </div>
                      ) : (
                        <div className="badge badge-success">Success</div>
                      )}
                    </td>
                  </tr>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Show Less" : "Show All"}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function BalanceSol({ balance }: { balance: number }) {
  return (
    <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
  );
}

function ModalReceive({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code>{address.toString()}</code>
    </AppModal>
  );
}

function ModalAirdrop({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const mutation = useRequestAirdrop({ address });
  const [amount, setAmount] = useState("2");

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}

function ModalCreateLottery({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { createLottery } = useLotteryProgram();
  const { publicKey } = useWallet();
  const [ticket_price, setTicket_price] = useState(0);
  const oracle = web3.Keypair.generate();

  const handleSubmit = () => {
    console.log("starting handle");
    if (publicKey) {
      console.log("Pubkey from handle", publicKey);
      createLottery
        .mutateAsync({
          ticket_price: new BN(LAMPORTS_PER_SOL * ticket_price),
          oracle_pubkey: oracle.publicKey,
          admin: publicKey,
        })
        .then(() => hide());
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Create Web3 Lottery"
      submitLabel="Create Lottery"
      submit={handleSubmit}
    >
      <input
        type="number"
        placeholder="Ticket Price"
        value={ticket_price}
        onChange={(e) => setTicket_price(parseInt(e.target.value))}
        className="input input-bordered"
      />
      <input
        type="text"
        placeholder="Oracle Public Key"
        value={oracle.publicKey.toString()}
        className="input input-bordered"
      />
    </AppModal>
  );
}
function ModalBuyTicket({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { publicKey } = useWallet();
  const [lottery_account, setLotteryAccount] = useState("");

  const { buyTicket } = useLotteryProgram();

  const handleSubmit = () => {
    console.log("Pubkey from BuyTicket handle", publicKey);
    buyTicket
      .mutateAsync({ lottery: new PublicKey(lottery_account) })
      .then(() => hide());
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Buy Tickets"
      submitLabel="Buy Ticket"
      submit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Lottery address"
        value={lottery_account}
        onChange={(e) => setLotteryAccount(e.target.value)}
        className="input input-bordered"
      />
    </AppModal>
  );
}
function ModalCountTicket({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const program = getLotteryProgram(provider);
  const [lottery_account, setLotteryAccount] = useState("");

  const handleSubmit = async () => {
    const tickets = (
      await program.account.lottery.fetch(new PublicKey(lottery_account))
    ).count;
    alert(`There are ${tickets}`);
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Number of Tickets"
      submitLabel="Count Tickets"
      submit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Lottery address"
        value={lottery_account}
        onChange={(e) => setLotteryAccount(e.target.value)}
        className="input input-bordered"
      />
    </AppModal>
  );
}

function ModalSend({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const wallet = useWallet();
  const mutation = useTransferSol({ address });
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide());
      }}
    >
      <input
        disabled={mutation.isPending}
        type="text"
        placeholder="Destination"
        className="input input-bordered w-full"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}
