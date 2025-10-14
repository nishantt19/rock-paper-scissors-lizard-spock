"use client";
import { useGameContext } from "@/context/GameContext";
import Input from "../shared/Input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoadGameFormValues, loadGameSchema } from "@/utils/gameSchema";
import { Loader2 } from "lucide-react";

const LoadGame = () => {
  const { setCurrentGame } = useGameContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoadGameFormValues>({
    resolver: zodResolver(loadGameSchema),
    defaultValues: {
      contractAddress: "",
    },
  });

  const onSubmit = (data: LoadGameFormValues) => {
    setCurrentGame?.(data.contractAddress);
    toast.success("Game Loaded Successfully");
    reset({
      contractAddress: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-[4fr_2fr] justify-center items-end gap-4 max-w-4xl mx-auto">
        <div>
          <Input
            type="text"
            label="Contract Address"
            placeholder="0x..."
            {...register("contractAddress")}
          />
          {errors.contractAddress && (
            <p className="text-red-500 text-xs mt-1">
              {errors.contractAddress.message}
            </p>
          )}
        </div>
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
              Loading Game...
            </>
          ) : (
            "Load Game"
          )}
        </button>
      </div>
    </form>
  );
};

export default LoadGame;
