import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { zeroAddress, type Address } from "viem";
import { Loader2 } from "lucide-react";

import { LOCALE_STORAGE_KEY, Move, type Winner } from "@/utils/constant";
import {
  useWriteContract,
  useGameData,
  useLocalStorage,
  useGameTimer,
  useWatchGameBlocks,
} from "@/hooks";
import { useGameContext } from "@/context/GameContext";
import Player1View from "./Player1View";
import Player2View from "./Player2View";
import { useGameActions } from "@/hooks/useGameActions";

/**
 * Component to handle different player views
 * Hanldes winner states, timeout tracking and automatic game resets
 */
const GameResult = () => {
  const { address } = useAccount();
  const { resetGame, currentGame } = useGameContext();
  // Initializing the hook to get the write contract util
  const { writeContractUtil } = useWriteContract(currentGame as Address);
  // Fetch game data from the contract
  const {
    gameData,
    isLoading: isContractLoading,
    error: contractError,
  } = useGameData(currentGame as Address);
  // Hook to handle the timeouts and formatting the time
  const { formatTime, isTimeoutAvailable } = useGameTimer(gameData?.lastAction);
  // Hook to handle the local storage for player 1's move and secret
  const { p1Move, p1Secret, isLocalStorageEmpty, setP1Move, setP1Secret } =
    useLocalStorage(gameData, address);

  const [resetTimer, setResetTimer] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);
  const [winner, setWinner] = useState<Winner>(null);
  const [p1Timeout, setP1Timeout] = useState(false);
  const [p2Timeout, setP2Timeout] = useState(false);

  // Resets all game data and states once the game ends
  const resetGameData = () => {
    if (isResetting) return;

    setIsResetting(true);
    setResetTimer(10);

    const interval = setInterval(() => {
      setResetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setWinner(null);
      setP1Move(Move.Null);
      setP1Secret("");
      setP1Timeout(false);
      setP2Timeout(false);
      if (address === gameData?.player1 && !isLocalStorageEmpty) {
        localStorage.removeItem(LOCALE_STORAGE_KEY);
      }
      resetGame?.();
      setIsResetting(false);
    }, 10000);
  };

  // Watching the block for game state changes like winner determination or timeout
  useWatchGameBlocks({
    currentGame,
    gameData,
    winner,
    p1Timeout,
    p2Timeout,
    setWinner,
    setP1Timeout,
    setP2Timeout,
  });

  // Trigger reset countdown when game ends (winner declared or timeout)
  useEffect(() => {
    if ((winner !== null || p1Timeout || p2Timeout) && !isResetting) {
      resetGameData();
    }
  }, [winner, p1Timeout, p2Timeout, isResetting]);

  // Provide handlers like handleSolve, handlePlay and handleTimeout
  const actions = useGameActions({
    gameData,
    writeContractUtil,
    resetGameData,
    setWinner,
    setP1Timeout,
    setP2Timeout,
  });

  if (currentGame === zeroAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <p className="text-lg font-bold text-[#2F64FF]">
          Ready to play? Create a new RPSLS game on-chain!
        </p>
      </div>
    );
  }

  if (contractError) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-center py-4 px-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 max-w-md">
          <p className="font-bold mb-2">Error Loading Game Data</p>
          <p className="text-sm">
            Failed to load game contract data. Please check your connection and
            try again.
          </p>
        </div>
      </div>
    );
  }

  if (isContractLoading || !gameData) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Loader2 className="animate-spin text-[#2F64FF]" size={32} />
        <p className="text-sm text-gray-400 mt-4">Loading game data...</p>
      </div>
    );
  }

  const isPlayer1 = address === gameData.player1;
  const isPlayer2 = address === gameData.player2;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex flex-col gap-6 p-6 rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm">
        {resetTimer > 0 && (
          <div className="mb-6 text-center py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            <p className="font-semibold">
              Resetting game in {resetTimer} second{resetTimer > 1 ? "s" : ""}
              ...
            </p>
          </div>
        )}

        {isPlayer1 && (
          <Player1View
            currentGame={currentGame as string}
            gameData={gameData}
            isLocalStorageEmpty={isLocalStorageEmpty}
            p1Move={p1Move}
            p1Secret={p1Secret}
            setP1Move={setP1Move}
            setP1Secret={setP1Secret}
            isTimeoutAvailable={isTimeoutAvailable}
            formatTime={formatTime}
            p1Timeout={p1Timeout}
            p2Timeout={p2Timeout}
            isP2TimeoutLoading={actions.isP2TimeoutLoading}
            onTimeout={actions.handleTimeout}
            onSolve={actions.handleSolveGame}
            winner={winner}
          />
        )}

        {isPlayer2 && (
          <Player2View
            currentGame={currentGame as string}
            gameData={gameData}
            isTimeoutAvailable={isTimeoutAvailable}
            formatTime={formatTime}
            p1Timeout={p1Timeout}
            p2Timeout={p2Timeout}
            isP1TimeoutLoading={actions.isP1TimeoutLoading}
            onTimeout={actions.handleTimeout}
            onPlay={actions.handlePlayGame}
            winner={winner}
          />
        )}
      </div>
    </div>
  );
};

export default GameResult;
