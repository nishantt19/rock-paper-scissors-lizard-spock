import { type MoveValue } from "@/utils/constant";
import { type Winner, type GameData } from "./game.types";

export type Player1ViewProps = {
  currentGame: string;
  gameData: GameData;
  isLocalStorageEmpty: boolean;
  p1Move: MoveValue;
  p1Secret: string;
  setP1Move: (m: MoveValue) => void;
  setP1Secret: (s: string) => void;
  isTimeoutAvailable: boolean;
  formatTime: () => string;
  p1Timeout: boolean;
  p2Timeout: boolean;
  isP2TimeoutLoading: boolean;
  onTimeout: () => Promise<void> | void;
  onSolve: (move: MoveValue, secret: string) => Promise<void> | void;
  winner: Winner;
};

export type Player2ViewProps = {
  currentGame: string;
  gameData: GameData;
  isTimeoutAvailable: boolean;
  formatTime: () => string;
  p1Timeout: boolean;
  p2Timeout: boolean;
  isP1TimeoutLoading: boolean;
  onTimeout: () => Promise<void> | void;
  onPlay: (move: MoveValue) => Promise<void> | void;
  winner: Winner;
  p1Move: MoveValue;
};