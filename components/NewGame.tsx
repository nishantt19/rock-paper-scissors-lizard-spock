"use client";
import React, { useState } from "react";
import { useAccount, useDeployContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { isAddress, keccak256, encodePacked, parseEther } from "viem";
import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";
import {
  LOCALE_STORAGE_KEY,
  type MoveValue,
  type StoredGame,
  Move,
  getPlayableMoves,
} from "@/utils/constant";
import Input from "./shared/Input";
import Select from "./shared/Select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGameContext } from "@/context/GameContext";

const NewGame = () => {
  const { isConnected } = useAccount();
  const { deployContractAsync } = useDeployContract();
  const { setCurrentGame } = useGameContext();

  const [move, setMove] = useState<MoveValue>(Move.Null);
  const [amount, setAmount] = useState("");
  const [opponentAddress, setOpponentAddress] = useState("");
  const [salt, setSalt] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const generateSalt = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const salt = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    setSalt(`0x${salt}`);
  };

  const handleNewGame = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first to create a game.");
      return;
    }

    if (move === Move.Null) {
      toast.error("Please select a valid move.");
      return;
    }

    if (amount === "" || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid ETH amount greater than 0.");
      return;
    }

    if (!isAddress(opponentAddress)) {
      toast.error("Please enter a valid opponent address.");
      return;
    }

    if (!salt || !salt.startsWith("0x")) {
      toast.error("Please enter a valid salt in hexadecimal format (0x...).");
      return;
    }

    try {
      const p1moveHash = keccak256(
        encodePacked(["uint8", "uint256"], [move, BigInt(salt)])
      );

      setIsCreatingGame(true);

      // Deploy the contract
      const contract = await deployContractAsync({
        abi: RPS.abi,
        bytecode: RPS.bytecode.object as `0x${string}`,
        args: [p1moveHash, opponentAddress],
        value: parseEther(amount),
      });

      const txReceipt = await waitForTransactionReceipt(config, {
        hash: contract,
      });

      setIsCreatingGame(false);

      if (!txReceipt.contractAddress) {
        toast.error("Failed to retrieve contract address from receipt.");
        return;
      }

      setCurrentGame?.(txReceipt.contractAddress);

      const newGame: StoredGame = {
        contractAddress: txReceipt.contractAddress,
        move: move.toString(),
        salt,
      };

      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(newGame));

      toast.success("Game created successfully!");
      // Reset form
      setMove(Move.Null);
      setAmount("");
      setOpponentAddress("");
      setSalt("");
    } catch (error) {
      setIsCreatingGame(false);
      console.error("Error creating game:", error);
      toast.error("Failed to create game, Check console for further details.");
    }
  };

  return (
    <div className="flex flex-col gap-y-3 mt-2 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 justify-center items-center gap-4 w-full">
        <Select
          label="Your Move"
          options={getPlayableMoves().map(([label, value]) => ({
            label,
            value: value.toString(),
          }))}
          value={move.toString()}
          onChange={(val) => setMove(Number(val) as MoveValue)}
          placeholder="Select your move"
          name="move"
        />
        <Input
          label="ETH Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          type="number"
          name="amount"
        />
      </div>
      <Input
        label="Opponent Address"
        value={opponentAddress}
        onChange={(e) => setOpponentAddress(e.target.value)}
        placeholder="0x..."
        type="text"
        name="opponentAddress"
      />
      <div className="grid grid-cols-[4fr_2fr] justify-center items-end gap-4 w-full">
        <Input
          type="text"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          label="Salt (Hex)"
          placeholder="0x..."
          name="salt"
        />
        <button
          onClick={generateSalt}
          className="w-full py-[9px] text-white text-xs font-bold rounded-[5px] bg-[#2F64FF] hover:bg-[#1d4ed8] cursor-pointer transition-colors"
        >
          Generate Salt
        </button>
      </div>
      <div className="pt-3">
        <button
          disabled={isCreatingGame}
          className={`w-full py-3 text-white text-xs font-bold rounded-[5px] ${
            isCreatingGame
              ? "bg-[#2f64ff] opacity-30 cursor-not-allowed"
              : "bg-[#2F64FF] hover:bg-[#1d4ed8] cursor-pointer"
          } transition-colors`}
          onClick={handleNewGame}
        >
          {isCreatingGame ? (
            <>
              <Loader2 className="animate-spin mr-2 inline-block" size={16} />{" "}
              Creating Game...
            </>
          ) : (
            "Create Game"
          )}
        </button>
      </div>
    </div>
  );
};

export default NewGame;
