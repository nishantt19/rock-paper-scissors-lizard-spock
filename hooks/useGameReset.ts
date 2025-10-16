/**
 * Handles game reset logic after a winner is determined or timeout occurs.
 * Manages countdown timer, clears game state, and removes Player 1's local storage.
 * Prevents race conditions by blocking concurrent reset attempts.
 */

import { useState, useCallback, useEffect } from "react";
import { GAME_RESET_COUNTDOWN_SECONDS, LOCALE_STORAGE_KEY, Move} from "@/utils/constant";
import { UseGameResetProps } from "@/types/hooks.interface";

export const useGameReset = ({
  winner,
  p1Timeout,
  p2Timeout,
  address,
  player1Address,
  isLocalStorageEmpty,
  resetGame,
  setWinner,
  setP1Move,
  setP1Secret,
  setP1Timeout,
  setP2Timeout,
}: UseGameResetProps) => {
  const [resetTimer, setResetTimer] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);

  const resetGameData = useCallback(() => {
    if (isResetting) return;

    setIsResetting(true);
    setResetTimer(GAME_RESET_COUNTDOWN_SECONDS);

    // Countdown timer for visual feedback
    const interval = setInterval(() => {
      setResetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear all game state after countdown
    setTimeout(() => {
      setWinner(null);
      setP1Move(Move.Null);
      setP1Secret("");
      setP1Timeout(false);
      setP2Timeout(false);
      if (address === player1Address && !isLocalStorageEmpty) {
        localStorage.removeItem(LOCALE_STORAGE_KEY);
      }
      resetGame?.();
      setIsResetting(false);
    }, GAME_RESET_COUNTDOWN_SECONDS * 1000);
  }, [
    isResetting,
    address,
    player1Address,
    isLocalStorageEmpty,
    resetGame,
    setWinner,
    setP1Move,
    setP1Secret,
    setP1Timeout,
    setP2Timeout,
  ]);

  // Auto-trigger reset when game ends
  useEffect(() => {
    if ((winner !== null || p1Timeout || p2Timeout) && !isResetting) {
      resetGameData();
    }
  }, [winner, p1Timeout, p2Timeout, isResetting, resetGameData]);

  return {
    resetTimer,
    isResetting,
    resetGameData,
  };
};
