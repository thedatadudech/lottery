# <div style="background-color:#000000; padding:10px;">
 <img src="app/assets/solanaLogo.png" alt="Folder Structure" width="250" height="50">  

<img src="app/assets/projectpic.png" alt="Folder Structure" width="800" height="600">

Welcome to the Solana Lottery Project! This decentralized lottery system is built on the Solana blockchain, leveraging the power of Rust, Solana CLI, Anchor, and Vite for the frontend. It's designed to provide a secure, transparent, and fun experience for all participants. Whether you're a developer or a lottery enthusiast, dive in and explore the future of decentralized gaming!

## ✨ Features

Decentralized Lottery: All transactions are transparent and verifiable on the Solana blockchain.
Fast and Scalable: Powered by Solana's high-speed, low-cost blockchain.
Secure: Built with Rust and Anchor, ensuring reliability and security.
Easy-to-use Interface: The frontend is developed using Vite, providing a fast and modern UI.

## 🛠️ Tech Stack

Solana CLI: Command-line interface for interacting with the Solana network.
Anchor: A framework for Solana’s Sealevel runtime, providing tools for developing and deploying smart contracts.
Rust: The programming language used for writing smart contracts.
Vite: Frontend tooling for modern web projects, ensuring fast and responsive UI.

## 🚀 Getting Started

Follow these steps to set up and run the Solana Lottery Project on your local machine.

Prerequisites
Make sure you have the following installed:

- Rust
- Solana CLI
- Anchor
- Node.js
  and
- Yarn

## Installation Guide

### 1. Install Rust

Rust is essential for building the smart contracts.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup update
rustup component add rustfmt
```

### 2. Install Solana CLI

The Solana CLI is necessary for interacting with the Solana blockchain.

Go to
https://github.com/anza-xyz/agave/releases , then e.g. for mac intel and version v.1.18.22 download

```bash
wget https://github.com/anza-xyz/agave/releases/download/v1.18.22/solana-release-x86_64-apple-darwin.tar.bz2
tar jxf solana-release-x86_64-apple-darwin.tar.bz2
cd solana-release
export PATH=$PWD/bin:$PATH >.bashrc or .zshrc

source .bashrc or .zshrc
solana --version

#solana-cli 1.18.22 (src:9efdd74b; feat:4215500110, client:Agave)
```

### 3. Install Anchor

Anchor is a crucial framework for developing Solana programs.

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli
avm --version
anchor --version
```

### 4. Install Node.js and Yarn

For the frontend, ensure you have Node.js and Yarn installed.

#### Install Node.js

```bash
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.16.0`

# verifies the right npm version is in the environment
npm -v # should print `10.8.1`
```

#### Install Yarn

```bash
sudo npm install --global yarn
```

### 5. Clone the Repository

```bash
https://github.com/TheDataDudeDE/lottery.git
cd lottery
```

### Finally check versions

```bash
solana --version; node -v; yarn --version; anchor --version
solana-cli 1.18.22 (src:9efdd74b; feat:4215500110, client:Agave)
v20.16.0
1.22.22
anchor-cli 0.30.1
```

### 6. Build and Deploy

Compile and deploy the Solana smart contract using Anchor.

```bash
anchor build
anchor test --skip-local-validator
```

### 7. Run the Frontend

Navigate to the frontend directory and start the Vite development server.

```bash
cd frontend
yarn install
yarn dev
```

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

🤝 Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

📧 Contact
For any inquiries, please reach out to us at your-email@example.com.
