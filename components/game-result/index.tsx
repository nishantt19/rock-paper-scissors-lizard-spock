import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { zeroAddress, type Address } from "viem";
import { type WriteContractErrorType } from "wagmi/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  LOCALE_STORAGE_KEY,
  Move,
  getWinner,
  type MoveValue,
  type Winner,
} from "@/utils/constant";
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

const GameResult = () => {
  const { address } = useAccount();
  const { resetGame, currentGame } = useGameContext();
  const { writeContractUtil } = useWriteContract(currentGame as Address);
  const {
    gameData,
    isLoading: isContractLoading,
    error: contractError,
  } = useGameData(currentGame as Address);
  const { formatTime, isTimeoutAvailable } = useGameTimer(gameData?.lastAction);
  const { p1Move, p1Secret, isLocalStorageEmpty, setP1Move, setP1Secret } =
    useLocalStorage(gameData, address);

  const [resetTimer, setResetTimer] = useState<number>(0);
  const [winner, setWinner] = useState<Winner>(null);

  const [p1Timeout, setP1Timeout] = useState(false);
  const [p2Timeout, setP2Timeout] = useState(false);
  const [isP1TimeoutLoading, setIsP1TimeoutLoading] = useState(false);
  const [isP2TimeoutLoading, setIsP2TimeoutLoading] = useState(false);

  const resetGameData = () => {
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
    }, 10000);
  };

  useWatchGameBlocks({
    currentGame,
    gameData,
    winner,
    p1Timeout,
    p2Timeout,
    setWinner,
    setP1Timeout,
    setP2Timeout,
    resetGameData,
  });

  useEffect(() => {
    if (winner !== null) {
      const t = setTimeout(() => resetGameData(), 0);
      return () => clearTimeout(t);
    }
  }, [winner]);

  const handleSolveGame = async (finalMove: MoveValue, finalSecret: string) => {
    if (!gameData) {
      toast.error("Game State is null");
      return;
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
      console.log("Solve failed: ", err);
      toast.error(`${err.name}: ${err.message}`);
    }
  };

  const handlePlayGame = async (move: MoveValue) => {
    if (!gameData) {
      toast.error("Game State is null");
      return;
    }

    try {
      await writeContractUtil("play", gameData.stakeAmount, [move]);
    } catch (error: any) {
      const err = error as WriteContractErrorType;
      console.log("Error while playing: ", err);
      toast.error(`${err.name}: ${error?.message}`);
    }
  };

  const handleTimeout = async () => {
    const isPlayer1 = address === gameData?.player1;
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
      console.log("Error while doing timeout", err);
      toast.error(`${err.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 shadow-2xl hover:border-gray-700 transition-all duration-300 hover:shadow-purple-500/10">
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
            p2Timeout={p2Timeout}
            isP2TimeoutLoading={isP2TimeoutLoading}
            onTimeout={handleTimeout}
            onSolve={handleSolveGame}
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
            isP1TimeoutLoading={isP1TimeoutLoading}
            onTimeout={handleTimeout}
            onPlay={handlePlayGame}
            winner={winner}
          />
        )}
      </div>
    </div>
  );
};

export default GameResult;
