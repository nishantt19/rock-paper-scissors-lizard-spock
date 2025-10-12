"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { zeroAddress } from "viem";

interface GameContextType {
  currentGame: string;
  setCurrentGame?: (address: string) => void;
  resetGame?: () => void;
}

const initialState: GameContextType = {
  currentGame: zeroAddress,
};

const GameContext = createContext<GameContextType>(initialState);

export const useGameContext = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }

  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentGame, setCurrentGame] = useState<string>(
    initialState.currentGame
  );

  const resetGame = () => {
    setCurrentGame(initialState.currentGame);
  };

  return (
    <GameContext.Provider value={{ currentGame, setCurrentGame, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};
