# Project Blueprint: Application Overview and Architecture

## 1. Project Structure

The project is a full-stack application with both on-chain (Solana Anchor) and off-chain (Next.js/TypeScript) components. The workspace is organized as follows:

- **anchor/**: Contains Solana Anchor smart contracts, configuration, and related scripts.
- **src/**: Main Next.js frontend application, with modular features and UI components.
- **public/**: Static assets for the frontend.
- **test-ledger/**: Local Solana ledger state and keypairs for development/testing.
- **Config files**: Project-wide configuration for TypeScript, ESLint, PostCSS, etc.


## 2. On-Chain (Solana Anchor)

### Location: `anchor/`
- **Anchor.toml, Cargo.toml**: Anchor and Rust configuration for Solana programs.
- **programs/escrow/**: Rust source code for the escrow smart contract.
- **src/**: TypeScript/JS scripts for Anchor program interaction and configuration.
- **tests/**: Anchor Mocha/TypeScript tests for the escrow program.
- **target/**: Build artifacts for Solana programs.

### Escrow Program (IDL Overview)
The Anchor IDL (see `anchor/target/idl/escrow.json`) defines the program interface:

- **Instructions:**
	- `initialize`: Creates a new escrow vault with a payer, recipient, amount, and payment ID. Derives PDAs for vault and token vault.
	- `payout`: Allows the payer to release funds to the recipient, updating the escrow status.
	- `close`: Allows the payer to close the escrow account after payout is complete.

- **Accounts:**
	- `Vault`: Stores escrow state. Fields:
		- `payment_id` (u64): Unique identifier for the escrow
		- `payer` (pubkey): Initiator of the escrow
		- `amount_in_lamports` (u64): Amount locked
		- `recipient` (pubkey): Counterparty
		- `status` (u8): Escrow status (e.g., 0 = open, 1 = paid out)
		- `bump`, `token_vault_bump` (u8): PDA bump seeds

- **Errors:**
	- `InsufficientFunds`, `AlreadyFinalized`, `UnauthorizedRefund`, `InvalidStatus`, `Unauthorized`, `InvalidRecipient`, `InvalidClose`

- **Types:**
	- `Vault` struct as above

### Scripts and Exports
- `escrow-exports.ts`: Exports the IDL and generated TypeScript types for use in the frontend.
- `client/js/generated/`: Codama-generated client code for program instructions, accounts, and errors.

### How the Frontend Uses the IDL
- The frontend imports the IDL and generated types to build and decode transactions, derive PDAs, and parse account data.
- All on-chain interactions (initialize, payout, close) are constructed using the IDL definitions and sent via Solana web3.js and Anchor-compatible clients.


## 3. Off-Chain (Frontend: Next.js)

### Location: `src/`
- **app/**: Next.js app directory (routing, layouts, pages, feature entrypoints).
- **components/**: Reusable UI components (alerts, modals, headers, etc.).
- **features/**: Feature-specific logic (account, cluster, dashboard, escrow, etc.).
- **lib/**: Shared utilities (e.g., Solana connection, formatting helpers).

### Escrow Feature: Component and Data Flow

#### Main Components
- **EscrowFeature** (`src/components/escrow/escrow-feature.tsx`):
	- Entry point for the escrow UI. Shows wallet connect if not connected, otherwise renders the escrow registry and list.
- **EscrowProgram** (`src/components/escrow/escrow-ui.tsx`):
	- Renders the registry, explorer link, create escrow modal, and the list of escrows.
- **CreateEscrow** (`src/components/escrow/escrow-ui.tsx`):
	- Modal form to initialize a new escrow. Collects recipient, amount, and payment ID, then calls the Anchor `initialize` instruction using the IDL.
- **EscrowList** (`src/components/escrow/escrow-ui.tsx`):
	- Fetches all escrow accounts from the blockchain, decodes them using the IDL, and displays them. Each escrow shows parsed fields and action buttons.
- **Payout** and **CloseEscrow** (`src/components/escrow/escrow-ui.tsx`):
	- Buttons to trigger the `payout` and `close` instructions for a given escrow. Only enabled for the payer and when status allows.

#### Data Access and Hooks
- **getEscrowAccounts** (`src/features/escrow/data-access/getEscrowAccounts.ts`):
	- Fetches all program accounts, filters by the escrow discriminator, and decodes account data using the IDL.
- **useInitializeEscrowMutation** (`src/features/escrow/data-access/use-initialize-escrow-mutation.ts`):
	- React Query mutation to create a new escrow. Handles transaction construction, PDA derivation, and error/success toasts.
- **usePayoutEscrowMutation** (`src/components/escrow/escrow-data-access.tsx`):
	- Handles payout (withdraw) transactions for the payer.
- **useCloseEscrowMutation** (`src/components/escrow/useCloseEscrowMutation.ts`):
	- Handles closing the escrow account after payout.

#### UI/UX Details
- **escrow-component-styles.css**: Custom styles for the escrow registry, list, and modal.
- **escrow-ui-list.tsx**: Advanced list with parsed fields, status, and conditional action buttons (withdraw, close) based on account and escrow state.
- **escrow-ui-create.tsx**: Form for initializing escrow, with validation and mutation feedback.

#### Transaction Flow
1. **Create Escrow**: User fills the form, frontend derives PDAs, builds the `initialize` instruction using the IDL, and sends the transaction.
2. **Payout**: Payer triggers payout, which builds the `payout` instruction and sends the transaction. Status is updated on-chain.
3. **Close**: After payout, payer can close the escrow account, reclaiming rent and cleaning up state.
4. **List/Decode**: All escrow accounts are fetched, filtered, and decoded using the IDL struct layout. UI parses and displays all fields.

#### Error Handling
- All errors from the Anchor program (as defined in the IDL) are surfaced in the UI via toast notifications and status messages.

#### Extending the Escrow Feature
- Add new instructions to the Anchor program and regenerate the IDL/types.
- Update or add new React components and data-access hooks to support new flows.

## 4. Testing & Local Development

- **test-ledger/**: Contains a local Solana ledger snapshot and keypairs for running a local validator.
- **anchor/tests/**: TypeScript tests for the escrow program, run with Anchor test suite.
- **Frontend**: Uses Vitest for unit/integration tests (see `vitest.config.ts`).

## 5. Configuration & Tooling

- **TypeScript**: Strict typing across frontend and scripts.
- **ESLint**: Linting for code quality.
- **PostCSS**: CSS processing for frontend styles.
- **Codama**: Integration for code generation or automation (see `codama.json`).

## 6. Application Flow

1. **User connects wallet** via the frontend (Phantom, Solflare, etc.).
2. **User creates an escrow**: Frontend calls Anchor program to initialize escrow account.
3. **Counterparty funds escrow**: Second party deposits assets into the escrow account.
4. **Settlement**: Upon conditions met, program releases assets to the appropriate parties.
5. **Frontend updates**: React Query fetches on-chain state and updates UI in real time.

## 7. Extensibility

- **Modular features**: New Solana programs or UI features can be added under `anchor/programs/` and `src/features/`.
- **Reusable components**: UI and logic are componentized for easy extension.
- **Config-driven**: Many behaviors are controlled via config files for flexibility.

## 8. How to Use/Extend

- **To add a new Solana program**: Add to `anchor/programs/`, update Anchor/Cargo configs, and expose via TypeScript exports.
- **To add a new frontend feature**: Add to `src/features/` and create UI in `src/components/`.
- **To test**: Use Anchor CLI for on-chain, Vitest for frontend.

---

This blueprint provides a detailed map for another LLM or developer to understand, extend, or automate work in this project. For further details, see inline comments in code and configuration files.

---

## Appendix: Component/Module Functionality Reference

### IDL and Type Exports
- `anchor/target/idl/escrow.json`: Canonical Anchor IDL for the escrow program.
- `anchor/target/types/escrow.ts`: TypeScript type helper for the IDL.
- `anchor/src/escrow-exports.ts`: Exports the IDL and all generated client code for use in the frontend.

### Main Escrow Components (Frontend)
- **EscrowFeature**: Entry point, handles wallet connection and renders the escrow UI.
- **EscrowProgram**: Registry and explorer link, wraps create and list components.
- **CreateEscrow**: Modal form for initializing a new escrow, calls the Anchor `initialize` instruction.
- **EscrowList**: Fetches and displays all escrow accounts, decodes using the IDL, and renders parsed fields.
- **Payout/CloseEscrow**: Buttons to trigger payout and close instructions, with logic to enable/disable based on user and status.
- **escrow-ui-list.tsx**: Advanced list with parsed fields, status, and conditional action buttons (withdraw, close) based on account and escrow state.
- **escrow-ui-create.tsx**: Form for initializing escrow, with validation and mutation feedback.

### Data Access and Hooks
- **getEscrowAccounts**: Fetches and decodes escrow accounts from the blockchain.
- **useInitializeEscrowMutation**: Handles escrow creation transactions.
- **usePayoutEscrowMutation**: Handles payout transactions.
- **useCloseEscrowMutation**: Handles close transactions.

### How Decoding Works
- The frontend uses the IDL struct layout to parse raw account data (Buffer/Uint8Array) into fields: paymentId, payer, amount, recipient, status, etc.
- Parsing logic is found in `escrow-ui-list.tsx` and related data-access files.

### Error Handling
- All Anchor program errors are mapped to user-friendly messages in the UI.

---

This document is intended as a technical blueprint for LLMs and developers to understand the full stack, from on-chain IDL to frontend component logic and data flow.