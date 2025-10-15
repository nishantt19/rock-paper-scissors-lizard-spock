import { toast } from "sonner";
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

export type Winner = 'player1' | 'player2' | 'draw' | null; 

export const getWinner = (move1: number, move2: number): Winner => {
    if (move1 === move2) return 'draw';

    const sameParity = (move1 % 2) === (move2 % 2);
    const move1Wins = (move1 < move2) === sameParity;

    return move1Wins ? 'player1' : 'player2';
}

export const getWinnerDisplay = (
  winner: Winner,
  currentPlayer: "player1" | "player2"
) => {
  const isWinner = winner === currentPlayer;
  const isDraw = winner === "draw";

  return {
    variant: isDraw ? "warning" : isWinner ? "success" : "error",
    message: isDraw
      ? "It's a tie!"
      : isWinner
      ? "🎉 You won the game!"
      : winner === "player1"
      ? "You lost this round."
      : "You lost this round.",
  } as const;
};
