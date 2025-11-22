# Liib Vault - Encrypted Reading Preference System

A decentralized application for storing and managing encrypted reading preferences using Fully Homomorphic Encryption (FHE) on the blockchain.

## Features

- **Encrypted Category Storage**: Users can select reading categories that are encrypted using FHE
- **Private Preference Tracking**: Reading preferences are stored encrypted on-chain
- **Encrypted Statistics**: System can count preferences without decrypting individual data (e.g., "Encrypted Count: Science Fiction = 5 books")
- **User Decryption**: Users can decrypt and view their own preference scores
- **Rainbow Wallet Integration**: Seamless wallet connection using RainbowKit
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## ⚠️ Known Issues

### COOP/COEP Header Conflict

**Current Status**: FHEVM functionality is temporarily disabled due to a browser security header conflict.

**Problem**: FHEVM requires specific Cross-Origin headers that conflict with Coinbase Base Account SDK used by RainbowKit:
- FHEVM needs: `COOP: same-origin`, `COEP: require-corp`
- Coinbase Base SDK requires: `COOP ≠ same-origin`

**Impact**: Encryption/decryption features are currently disabled. Users can still connect wallets and view the UI, but FHE operations are not functional.

**Solution**: Working on a solution to resolve this header conflict. Possible approaches:
1. Lazy-load FHEVM SDK after wallet connection
2. Use separate browser contexts for wallet and FHE operations
3. Coordinate with wallet SDK providers for header compatibility

**Status**: FHEVM SDK loads successfully but is disabled in the UI. Contract deployment and testing work correctly.

## Technology Stack

- **Smart Contracts**: Solidity 0.8.27 with FHEVM
- **Frontend**: React 18 + TypeScript + Vite
- **Wallet**: RainbowKit + Wagmi
- **UI Components**: Radix UI + Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet / Local Hardhat)

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Rainbow Wallet browser extension (for frontend)

### Installation

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Quick Start (Local Development)

1. **Start Hardhat Node** (in a separate terminal):
   ```bash
   npx hardhat node
   ```

2. **Deploy Contracts**:
   ```bash
   npx hardhat deploy --network hardhat
   ```
   Note the contract address from the output.

3. **Configure Frontend**:
   Create `frontend/.env.local`:
   ```env
   VITE_CONTRACT_ADDRESS=<contract_address_from_step_2>
   ```

4. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Browser**:
   Navigate to `http://localhost:3000` and connect your wallet.

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Local tests (requires Hardhat node running)
npm test

# Sepolia tests (requires deployment to Sepolia first)
npm run test:sepolia
```

### Deploy to Sepolia

1. Set up environment variables:
   ```bash
   npx hardhat vars setup
   ```

2. Deploy:
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. Update `frontend/.env.local` with the Sepolia contract address.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
liib-vault/
├── contracts/              # Smart contracts
│   └── EncryptedReadingPreference.sol
├── test/                   # Test files
│   ├── EncryptedReadingPreference.ts
│   └── EncryptedReadingPreferenceSepolia.ts
├── deploy/                 # Deployment scripts
│   └── 001_deploy_EncryptedReadingPreference.ts
├── tasks/                  # Hardhat tasks
│   ├── accounts.ts
│   └── EncryptedReadingPreference.ts
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── PreferenceLogger.tsx
│   │   │   ├── PreferenceViewer.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   └── ui/          # UI components
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useReadingPreference.tsx
│   │   ├── fhevm/           # FHEVM integration
│   │   └── lib/             # Utilities
│   └── public/             # Static assets (logo, favicon)
└── types/                  # TypeScript types (generated)
```

## Usage

### Adding Reading Preferences

1. Connect your wallet using the Rainbow button in the top right
2. Select a reading category from the dropdown
3. Enter the count (number of books)
4. Click "Add Preference" to encrypt and submit to blockchain

### Viewing and Decrypting Preferences

1. Your encrypted preferences will appear in the "Your Reading Preferences" section
2. Click "Decrypt" on any category to view your decrypted count
3. The system shows encrypted counts without revealing individual book details

## Reading Categories

The system supports the following reading categories:
- Science Fiction
- Mystery
- Romance
- Fantasy
- Thriller
- Non-Fiction
- Biography
- History

## License

BSD-3-Clause-Clear
