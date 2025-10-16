/**
 * Provides action handlers for RPSLS game interactions.
 * Handles Player 1's solve (reveal), Player 2's play, and timeout claims.
 * Validates commitments and manages loading states for timeouts.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { type WriteContractErrorType } from "wagmi/actions";
import { getWinner, type MoveValue, type Winner } from "@/utils/constant";
import { useAccount } from "wagmi";
import { encodePacked, keccak256 } from "viem";
import { useLocalStorage } from "./useLocalStorage";
import { GameData } from "./useGameData";

interface UseGameActionsProps {
  gameData: GameData | null;
  writeContractUtil: (...args: any[]) => Promise<any>;
  resetGameData: () => void;
  setWinner: (w: Winner) => void;
  setP1Timeout: (b: boolean) => void;
  setP2Timeout: (b: boolean) => void;
}

export const useGameActions = ({
  gameData,
  writeContractUtil,
  resetGameData,
  setWinner,
  setP1Timeout,
  setP2Timeout,
}: UseGameActionsProps) => {
  const { address } = useAccount();
  const { isLocalStorageEmpty } = useLocalStorage(gameData, address);
  const [isP1TimeoutLoading, setIsP1TimeoutLoading] = useState(false);
  const [isP2TimeoutLoading, setIsP2TimeoutLoading] = useState(false);

  // Player 1 reveals their move and secret to solve the game
  const handleSolveGame = useCallback(
    async (finalMove: MoveValue, finalSecret: string) => {
      if (!gameData) {
        toast.error("Game State is null");
        return;
      }

      if (isLocalStorageEmpty) {
        // If local storage is empty, Recalculate commitment hash from manually entered move/salt
        const moveHash = keccak256(
          encodePacked(["uint8", "uint256"], [finalMove, BigInt(finalSecret)])
        );
        // Verify if new move + salt matches the original commitment
        if (moveHash !== gameData.commitmentHash) {
          toast.error(
            "Incorrect move or salt. Make sure you enter the same values you used when creating the game."
          );
          return;
        }
      }

      try {
        await writeContractUtil("solve", undefined, [
          finalMove,
          BigInt(finalSecret),
        ]);
        setWinner(getWinner(finalMove, gameData.player2Move));
        resetGameData();
      } catch (error: any) {
        const err = error as WriteContractErrorType;
        toast.error(`${err.name}: ${error?.details}`);
      }
    },
    [gameData, writeContractUtil, resetGameData, setWinner]
  );

  // Player 2 makes their move
  const handlePlayGame = useCallback(
    async (move: MoveValue) => {
      if (!gameData) {
        toast.error("Game State is null");
        return;
      }

      try {
        await writeContractUtil("play", gameData.stakeAmount, [move]);
      } catch (error: any) {
        const err = error as WriteContractErrorType;
        toast.error(`${err.name}: ${error?.details}`);
      }
    },
    [gameData, writeContractUtil]
  );

  // Claim timeout - function called depends on who's claiming
  const handleTimeout = useCallback(async () => {
    if (!gameData) return;

    const isPlayer1 = address === gameData.player1;
    const setLoading = isPlayer1
      ? setIsP2TimeoutLoading
      : setIsP1TimeoutLoading;
    const functionName = isPlayer1 ? "j2Timeout" : "j1Timeout";
    const setTimeoutFlag = isPlayer1 ? setP2Timeout : setP1Timeout;

    try {
      setLoading(true);
      await writeContractUtil(functionName);
      setTimeoutFlag(true);
      resetGameData();
    } catch (error: any) {
      const err = error as WriteContractErrorType;
      toast.error(`${err.name}: ${error?.details}`);
    } finally {
      setLoading(false);
    }
  }, [
    gameData,
    address,
    writeContractUtil,
    resetGameData,
    setP1Timeout,
    setP2Timeout,
  ]);

  return {
    handleSolveGame,
    handlePlayGame,
    handleTimeout,
    isP1TimeoutLoading,
    isP2TimeoutLoading,
  };
};
