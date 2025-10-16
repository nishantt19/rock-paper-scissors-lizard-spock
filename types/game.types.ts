import { type Address, type Hash } from "viem";

export type Winner = 'player1' | 'player2' | 'draw' | null;

export type GameData = {
  player1: Address;
  player2: Address;
  stakeAmount: bigint;
  lastAction: bigint;
  player2Move: number;
  commitmentHash: Hash
};