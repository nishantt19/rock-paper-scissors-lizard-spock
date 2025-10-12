import { type Address } from "viem";

export enum Move {
  Null,
  Rock,
  Paper,
  Scissors,
  Spock,
  Lizard,
}

export type MoveValue = Move;

export function getPlayableMoves(): [string, Move][] {
  return Object.entries(Move)
    .filter(([, value]) => typeof value === "number" && value !== Move.Null)
    .map(([key, value]) => [key, value as Move]);
}

export const LOCALE_STORAGE_KEY = "RPSLS-GAME";

export type StoredGame = {
    contractAddress: Address;
    move: string;
    salt: string;
}