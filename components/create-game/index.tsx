"use client";
import React from "react";
import { useAccount, useDeployContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { keccak256, encodePacked, parseEther, isAddress } from "viem";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";
import {
  LOCALE_STORAGE_KEY,
  type StoredGame,
  Move,
  getPlayableMoves,
} from "@/utils/constant";
import Input from "../shared/Input";
import Select from "../shared/Select";
import { useGameContext } from "@/context/GameContext";
import {
  createGameSchema,
  type CreateGameFormValues,
} from "@/utils/gameSchema";

const CreateGame = () => {
  const { isConnected } = useAccount();
  const { deployContractAsync } = useDeployContract();
  const { setCurrentGame } = useGameContext();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateGameFormValues>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      move: Move.Null,
      amount: "",
      opponentAddress: "",
      salt: "",
    },
    mode: "all",
  });

  const selectedMove = watch("move");

  const generateSalt = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const salt = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    setValue("salt", `0x${salt}`, { shouldValidate: true });
  };

  const handleOpponentAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const address = e.target.value;

    if (address && isAddress(address)) {
      generateSalt();
    } else {
      setValue("salt", "", { shouldValidate: false });
    }
  };

  const onSubmit = async (data: CreateGameFormValues) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first to create a game.");
      return;
    }

    try {
      const p1moveHash = keccak256(
        encodePacked(["uint8", "uint256"], [data.move, BigInt(data.salt)])
      );

      const contract = await deployContractAsync({
        abi: RPS.abi,
        bytecode: RPS.bytecode.object as `0x${string}`,
        args: [p1moveHash, data.opponentAddress],
        value: parseEther(data.amount),
      });

      const txReceipt = await waitForTransactionReceipt(config, {
        hash: contract,
      });

      if (!txReceipt.contractAddress) {
        toast.error("Failed to retrieve contract address from receipt.");
        return;
      }

      setCurrentGame?.(txReceipt.contractAddress);

      const createGame: StoredGame = {
        contractAddress: txReceipt.contractAddress,
        move: data.move.toString(),
        salt: data.salt,
      };

      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(createGame));

      toast.success("Game Created Successfully");

      reset({
        amount: "",
        move: Move.Null,
        opponentAddress: "",
        salt: "",
      });
    } catch (error: any) {
      console.error("Error creating game: ", error);
      toast.error(`Error: ${error?.details}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-3 mt-2 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-2 justify-center items-center gap-4 w-full">
        <div>
          <Select
            label="Your Move"
            options={getPlayableMoves().map(([label, value]) => ({
              label,
              value: value.toString(),
            }))}
            value={selectedMove?.toString() || ""}
            onChange={(val) =>
              setValue("move", Number(val) as Move, { shouldValidate: true })
            }
            placeholder="Select your move"
            name="move"
          />
          {errors.move && (
            <p className="text-red-500 text-xs mt-1">{errors.move.message}</p>
          )}
        </div>
        <div>
          <Input
            label="ETH Amount"
            placeholder="0.01"
            type="number"
            step={"any"}
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">
              {errors.amount?.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <Input
          label="Opponent Address"
          placeholder="0x..."
          type="text"
          {...register("opponentAddress", {
            onChange: handleOpponentAddressChange,
          })}
        />
        {errors.opponentAddress && (
          <p className="text-red-500 text-xs mt-1">
            {errors.opponentAddress.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-[4fr_2fr] justify-center items-end gap-4 w-full">
        <div>
          <Input
            type="text"
            label="Salt (Hex)"
            placeholder="0x..."
            {...register("salt")}
          />
          {errors.salt && (
            <p className="text-red-500 text-xs mt-1">{errors.salt.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={generateSalt}
          className="w-full py-[9px] text-white text-xs font-bold rounded-[5px] bg-[#2F64FF] hover:bg-[#1d4ed8] cursor-pointer transition-colors"
        >
          Generate Salt
        </button>
      </div>
      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-white text-xs font-bold rounded-[5px] ${
            isSubmitting
              ? "bg-[#2f64ff] opacity-30 cursor-not-allowed"
              : "bg-[#2F64FF] hover:bg-[#1d4ed8] cursor-pointer"
          } transition-colors`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 inline-block" size={16} />{" "}
              Creating Game...
            </>
          ) : (
            "Create Game"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateGame;
