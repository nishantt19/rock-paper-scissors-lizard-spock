import React, { memo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Select from "@/components/shared/Select";
import {
  getPlayableMoves,
  Move,
  type Winner,
  type MoveValue,
} from "@/utils/constant";
import { playGameSchema, type PlayGameFormValues } from "@/utils/gameSchema";
import { formatEther } from "viem";
import { GameData } from "@/hooks/useGameData";

type Player2ViewProps = {
  currentGame: string;
  gameData: GameData;
  isTimeoutAvailable: boolean;
  formatTime: (ms: number) => string;
  p1Timeout: boolean;
  p2Timeout: boolean;
  isP1TimeoutLoading: boolean;
  onTimeout: () => Promise<void> | void;
  onPlay: (move: MoveValue) => Promise<void> | void;
  winner: Winner;
};

const Player2View: React.FC<Player2ViewProps> = ({
  currentGame,
  gameData,
  isTimeoutAvailable,
  formatTime,
  p1Timeout,
  p2Timeout,
  isP1TimeoutLoading,
  onTimeout,
  onPlay,
  winner,
}) => {
  const hasPlayed = gameData.player2Move !== 0;

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlayGameFormValues>({
    resolver: zodResolver(playGameSchema),
    defaultValues: { move: Move.Null },
    mode: "all",
  });

  const selectedMove = watch("move");

  const onSubmit = async (data: PlayGameFormValues) => {
    try {
      await onPlay(data.move as MoveValue);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to play");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">Your Game</h2>
        <p className="text-sm text-gray-400">Player 2</p>
      </div>

      {/* Contract Address with Copy */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Game Address</label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-mono break-all">{currentGame}</p>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(currentGame)
                .then(() => toast.success("Address copied"))
                .catch(() => toast.error("Failed to copy"))
            }
            className="text-xs px-2 py-1 bg-primary/20 border border-primary/30 rounded hover:bg-primary/30 transition"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Opponent Address</label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-mono break-all">{gameData.player1}</p>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(gameData.player1)
                .then(() => toast.success("Opponent address copied"))
                .catch(() => toast.error("Failed to copy"))
            }
            className="text-xs px-2 py-1 bg-primary/20 border border-primary/30 rounded hover:bg-primary/30 transition"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Stake */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Amount to Stake</label>
        <p className="text-sm">{formatEther(gameData.stakeAmount)} ETH</p>
      </div>

      {/* Show already chosen move if any */}
      {hasPlayed && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Your Move</label>
          <p className="text-sm">{Move[gameData.player2Move as MoveValue]}</p>
        </div>
      )}

      <div className="border-t border-gray-800 my-2"></div>

      {hasPlayed ? (
        <>
          {p1Timeout ? (
            <div className="text-center py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
              <p className="font-bold text-lg">You Called the Timeout!</p>
            </div>
          ) : winner === null ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-300">
                {isTimeoutAvailable ? (
                  <span>You can call timeout now.</span>
                ) : (
                  <span>
                    Waiting for Player 1 to solve. You can call timeout in{" "}
                    <strong>{formatTime(Number(gameData?.lastAction))}</strong>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onTimeout}
                disabled={!isTimeoutAvailable || isP1TimeoutLoading}
                className={`px-4 py-2 rounded-lg border w-full md:w-auto ${
                  !isTimeoutAvailable || isP1TimeoutLoading
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                } text-white`}
              >
                {isP1TimeoutLoading ? (
                  <>
                    <Loader2
                      className="animate-spin mr-2 inline-block"
                      size={16}
                    />
                    Calling Timeout...
                  </>
                ) : (
                  "Call Timeout"
                )}
              </button>
            </div>
          ) : (
            <div
              className={`text-center py-2 px-3 rounded-lg ${
                winner === "draw"
                  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                  : winner === "player2"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              <p className="font-bold text-lg">
                {winner === "draw"
                  ? "It's a tie!"
                  : winner === "player2"
                  ? "🎉 You won the game!"
                  : "You lost this round."}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {p2Timeout ? (
            <div className="py-2 px-3 text-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <p className="font-bold">
                Player 1 has timed out because you haven&apos;t played.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <Select
                label="Select Your Move"
                options={getPlayableMoves().map(([label, value]) => ({
                  label,
                  value: value.toString(),
                }))}
                value={String(selectedMove ?? Move.Null)}
                onChange={(val) =>
                  setValue("move", Number(val) as MoveValue, {
                    shouldValidate: true,
                  })
                }
                placeholder="Select your move"
                name="move"
              />
              {errors.move && (
                <p className="text-red-500 text-xs mt-2 ml-0.5">
                  {errors.move.message as string}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-all ${
                  isSubmitting
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="animate-spin mr-2 inline-block"
                      size={18}
                    />
                    Playing...
                  </>
                ) : (
                  "Play"
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default memo(Player2View);
