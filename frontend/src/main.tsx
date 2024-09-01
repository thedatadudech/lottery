import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import { UiLayout } from "./components/ui/ui-layout";
import { ClusterProvider } from "./components/cluster/cluster-data-access";
import { SolanaProvider } from "./components/solana/solana-provider";
import { ReactQueryProvider } from "./react-query-provider";

// Polyfill Buffer for browser environments
import { Buffer } from "buffer";
window.Buffer = Buffer;

const links: { label: string; path: string }[] = [
  { label: "Account", path: "/account" },
  { label: "Clusters", path: "/clusters" },
  { label: "Journal Program", path: "/journal" },
];

createRoot(document.getElementById("root")!).render(
  <ClusterProvider>
    <SolanaProvider>
      <ReactQueryProvider>
        <UiLayout links={links}>
          <App />
        </UiLayout>
      </ReactQueryProvider>
    </SolanaProvider>
  </ClusterProvider>,
);
