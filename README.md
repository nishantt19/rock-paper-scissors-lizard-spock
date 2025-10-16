# RPSLS Game - Decentralized Rock Paper Scissors Lizard Spock

A fully decentralized, on-chain implementation of Rock Paper Scissors Lizard Spock with cryptographic commitments, timeout mechanisms, and real-time blockchain state tracking.

## Network

**Blockchain:** Ethereum Sepolia Testnet

## Requirements

- **Wallet:** MetaMask or any RainbowKit-supported wallet
- **Network:** Connected to Sepolia testnet
- **Test ETH:** Sepolia ETH for staking and gas fees

## Game Rules

![Rock-Paper-Scissors-Lizard-Spock Diagram](https://static.wikia.nocookie.net/bigbangtheory/images/7/7d/RPSLS.png/revision/latest?cb=20120822205915)

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Web3:** Wagmi, Viem, RainbowKit
- **Smart Contracts:** Solidity ^0.4.26
- **Forms:** React Hook Form, Zod validation
- **Linting:** Biome
- **Notifications:** Sonner (Toast notifications)

## Architecture Overview

### Context Layer

#### GameContext

Manages global game state across the application. Tracks the currently active game contract address and provides methods to switch between games or reset to the initial state.

### Custom Hooks

The application uses a modular hook-based architecture for separation of concerns:

#### useGameData

Fetches game state from the RPSLS contract using batch reads. Retrieves player addresses, stake amount, moves, commitment hash, and last action timestamp. Polls every 5 seconds to keep data fresh.

#### useGameActions

Provides action handlers for game interactions:

- `handleSolveGame` - Player 1 reveals their move with the secret salt
- `handlePlayGame` - Player 2 submits their move
- `handleTimeout` - Either player claims timeout after 5 minutes of inactivity

Validates commitments and manages loading states.

#### useWatchBlock

Watches new blocks to auto-detect RPSLS game deployments. Scans transactions for contract deployments involving the connected user (as Player 1 or Player 2). Only runs when no game is currently loaded.

#### useWatchGameBlocks

Monitors blockchain for game-ending events on the active game contract. Detects `solve`, `j1Timeout`, and `j2Timeout` transactions. Automatically determines the winner or timeout status.

#### useGameTimer

Manages the 5-minute timeout countdown. Calculates remaining time from the last action timestamp and provides formatted display. Returns a flag indicating when timeout can be claimed.

#### useLocalStorage

Manages Player 1's local storage for move and salt. Retrieves stored commitment data needed to reveal moves later. Only runs for Player 1 and validates that stored data matches the current game.

#### useWriteContract

Utility wrapper for writing to RPSLS contracts. Automatically waits for transaction receipts before resolving, simplifying error handling in action handlers.

#### useGameReset

Handles automatic game reset after a winner is determined or timeout occurs. Manages a countdown timer for visual feedback, clears all game state (winner, moves, timeouts), and removes Player 1's local storage when applicable. Prevents race conditions by blocking concurrent reset attempts.

### Components

#### CreateGame

Form for creating a new RPSLS game contract. Player 1 selects their move, enters stake amount, and opponent address. Auto-generates a cryptographic salt for the commitment. Deploys the contract with a hashed commitment (move + salt). Stores move and salt in local storage for the reveal phase.

#### LoadGame

Form for loading an existing game by contract address. Validates the address format and sets it as the active game in the global context. Prevents loading a new game if one is already active.

#### GameResult

Main game orchestrator that handles all in-game interactions. Manages winner states, timeout tracking, and automatic game resets. Renders different views based on whether the user is Player 1 or Player 2.

**Key Features:**

- Real-time game state updates via block watching
- 10-second countdown and auto-reset after game ends
- Error handling and loading states
- Automatically clears local storage after Player 1's game concludes

#### Player1View

Player 1's game interface showing:

- Game and opponent addresses
- Player 1's move and salt (retrieved from local storage or manual entry)
- Timeout section (when waiting for Player 2 to play)
- Solve button (when Player 2 has played)
- Winner display (after game resolution)

Handles form validation and submission for the reveal phase.

#### Player2View

Player 2's game interface showing:

- Game and creator addresses
- Move selection form (before playing)
- Timeout section (when waiting for Player 1 to solve)
- Winner display (after game resolution)

### Shared UI Components

- **Input** - Styled text input with label support
- **Select** - Dropdown selector for moves
- **Display** - Read-only field display
- **CopyableDisplay** - Display with copy-to-clipboard functionality
- **TimeoutSection** - Reusable timeout countdown and Call Timeout button
- **StatusMessage** - Colored alert boxes (info, warning, error, success)

## Acknowledgment

The smart contract used for this project was created by **Clément Lesaege**, CTO of Kleros. I do not take any credit for the creation of this smart contract and am merely deploying and interacting with it.
