import "./App.css";
import React from "react";
import BlockchainAnimation from "./components/BlockchainAnimation";
import AccountDetailFeature from "./components/account/index";
import { UiLayout } from "./components/ui/ui-layout";

function App() {
  return (
    <>
      <BlockchainAnimation />
      <AccountDetailFeature />
    </>
  );
}

export default App;
