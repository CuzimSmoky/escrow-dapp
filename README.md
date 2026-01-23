
# Solana Escrow dApp

This repository contains a full-stack decentralized escrow application built on Solana. It features:

- **Anchor smart contract** for secure escrow logic on-chain
- **Next.js frontend** for a modern, responsive UI
- **Tailwind CSS & Shadcn UI** for Apple-inspired design and theme support (light/dark mode)
- **Gill Solana SDK** for seamless blockchain integration
- **Wallet UI** for easy wallet connection and transaction signing
- **Codama** for auto-generating TypeScript/JS client SDKs from Anchor IDL

## Features

- Create new escrow accounts on Solana
- View all active escrows with details (address, payer, recipient, amount, status)
- Withdraw funds (payer)
- Close escrow accounts (payer)
- Real-time UI updates and transaction feedback
- Fully themeable (light/dark mode)

## Getting Started

## Getting Started

### Installation

#### Download the template

```shell
npx create-solana-dapp@latest -t gh:solana-foundation/templates/gill/escrow
```

#### Install Dependencies

```shell
npm install
```


## Structure

- `anchor/` — Rust smart contract (Anchor)
- `src/` — Next.js React frontend
- `public/` — Static assets
- `test-ledger/` — Local validator/test data

## Anchor Program

The escrow logic is implemented in Rust using Anchor. You can build, test, and deploy using standard Anchor commands (see below).

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the
Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program. This will also update
the constant in `anchor/src/basic-exports.ts` file.

```shell
npm run setup
```

#### Build the program:

```shell
npm run anchor-build
```

#### Start the test validator with the program deployed:

```shell
npm run anchor-localnet
```

#### Run the tests

```shell
npm run anchor-test
```

#### Deploy to Devnet

```shell
npm run anchor deploy --provider.cluster devnet
```


## Frontend (Next.js)

The web app uses the Anchor-generated client to interact with the Solana escrow program. It provides a user-friendly interface for managing escrows.

#### Commands

Start the app

```shell
npm run dev
```


Build the app

```shell
npm run build
```
