import { type Address } from "viem";
import { type GameData, type Winner } from "./game.types";
import { type MoveValue } from "@/utils/constant";

export interface UseGameActionsProps {
  gameData: GameData | null;
  writeContractUtil: (...args: any[]) => Promise<any>;
  resetGameData: () => void;
  setWinner: (w: Winner) => void;
  setP1Timeout: (b: boolean) => void;
  setP2Timeout: (b: boolean) => void;
}

export interface UseWatchBlockProps {
  address: Address | undefined;
  currentGame: string;
  onWatchBlock: (currentAddress: string) => void;
};

export interface UseWatchGameBlocksProps {
  currentGame: string;
  gameData: GameData | null;
  winner: Winner;
  p1Timeout: boolean;
  p2Timeout: boolean;
  setWinner: (w: Winner) => void;
  setP1Timeout: (v: boolean) => void;
  setP2Timeout: (v: boolean) => void;
  setBlockchainP1Move: (m: MoveValue) => void;
}

export interface GameContextProps {
  currentGame: string;
  setCurrentGame?: (address: string) => void;
  resetGame?: () => void;
}

export interface UseGameResetProps {
  winner: Winner;
  p1Timeout: boolean;
  p2Timeout: boolean;
  address: Address | undefined;
  player1Address: Address | undefined;
  isLocalStorageEmpty: boolean;
  resetGame?: () => void;
  setWinner: (w: Winner) => void;
  setP1Move: (m: MoveValue) => void;
  setP1Secret: (s: string) => void;
  setP1Timeout: (b: boolean) => void;
  setP2Timeout: (b: boolean) => void;
}