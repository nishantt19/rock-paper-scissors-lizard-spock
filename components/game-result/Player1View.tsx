import React, { memo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Select from "@/components/shared/Select";
import Input from "@/components/shared/Input";
import {
  getPlayableMoves,
  Move,
  type Winner,
  type MoveValue,
} from "@/utils/constant";
import { solveGameSchema, type SolveGameFormValues } from "@/utils/gameSchema";
import { GameData } from "@/hooks/useGameData";

type Player1ViewProps = {
  currentGame: string;
  gameData: GameData;
  isLocalStorageEmpty: boolean;
  p1Move: MoveValue;
  p1Secret: string;
  setP1Move: (m: MoveValue) => void;
  setP1Secret: (s: string) => void;
  isTimeoutAvailable: boolean;
  formatTime: (ms: number) => string;
  p1Timeout: boolean;
  p2Timeout: boolean;
  isP2TimeoutLoading: boolean;
  onTimeout: () => Promise<void> | void;
  onSolve: (move: MoveValue, secret: string) => Promise<void> | void;
  winner: Winner;
};

const Player1View: React.FC<Player1ViewProps> = ({
  currentGame,
  gameData,
  isLocalStorageEmpty,
  p1Move,
  p1Secret,
  setP1Move,
  setP1Secret,
  isTimeoutAvailable,
  formatTime,
  p1Timeout,
  p2Timeout,
  isP2TimeoutLoading,
  onTimeout,
  onSolve,
  winner,
}) => {
  const showPlayWaitState = gameData.player2Move === 0;

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SolveGameFormValues>({
    resolver: zodResolver(solveGameSchema),
    defaultValues: {
      p1Move: p1Move ?? Move.Null,
      p1Secret: p1Secret ?? "",
    },
    mode: "all",
    values: isLocalStorageEmpty
      ? undefined
      : {
          p1Move,
          p1Secret,
        },
  });

  const onSubmit = async (data: SolveGameFormValues) => {
    const finalMove = isLocalStorageEmpty ? (data.p1Move as MoveValue) : p1Move;
    const finalSecret = isLocalStorageEmpty ? data.p1Secret : p1Secret;

    try {
      await onSolve(finalMove, finalSecret);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to solve");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">Your Game</h2>
        <p className="text-sm text-gray-400">Player 1</p>
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
          <p className="text-sm font-mono break-all">{gameData.player2}</p>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(gameData.player2)
                .then(() => toast.success("Opponent address copied"))
                .catch(() => toast.error("Failed to copy"))
            }
            className="text-xs px-2 py-1 bg-primary/20 border border-primary/30 rounded hover:bg-primary/30 transition"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Either show inputs (local storage empty) or static values */}
      {isLocalStorageEmpty ? (
        <>
          <div className="py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <p className="text-xs font-semibold">
              Local storage is empty, please enter the move you made and your
              secret salt.
            </p>
          </div>

          <Select
            label="Your Move"
            options={getPlayableMoves().map(([label, value]) => ({
              label,
              value: value.toString(),
            }))}
            value={String(p1Move ?? Move.Null)}
            onChange={(val) => {
              const mv = Number(val) as MoveValue;
              setP1Move(mv);
              setValue("p1Move", mv, { shouldValidate: true });
            }}
            placeholder="Select your move"
            name="p1Move"
          />
          {errors.p1Move && (
            <p className="text-red-500 text-xs mt-2 ml-0.5">
              {errors.p1Move.message as string}
            </p>
          )}

          <Input
            type="text"
            label="Your Secret Salt"
            placeholder="0x..."
            value={p1Secret}
            onChange={(e) => {
              setP1Secret(e.target.value);
              setValue("p1Secret", e.target.value, { shouldValidate: true });
            }}
            name="p1Secret"
          />
          {errors.p1Secret && (
            <p className="text-red-500 text-xs mt-2 ml-0.5">
              {errors.p1Secret.message as string}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Your Move</label>
              <p className="text-sm">{Move[p1Move]}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Your Secret Salt</label>
              <p className="text-sm font-mono break-all">{p1Secret}</p>
            </div>
          </div>
        </>
      )}

      <div className="border-t border-gray-800 my-2"></div>

      {/* Timeout / Solve states */}
      {showPlayWaitState ? (
        <div className="flex flex-col gap-3">
          {p2Timeout ? (
            <div className="py-2 px-3 text-center rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
              <p className="font-bold">You Called the Timeout!</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-300">
                {isTimeoutAvailable ? (
                  <span>You can call timeout now.</span>
                ) : (
                  <span>
                    Waiting for Player 2 to play. You can call timeout in{" "}
                    <strong>{formatTime(Number(gameData?.lastAction))}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onTimeout}
                disabled={!isTimeoutAvailable || isP2TimeoutLoading}
                className={`px-4 py-2 rounded-lg border w-full md:w-auto ${
                  !isTimeoutAvailable || isP2TimeoutLoading
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                } text-white`}
              >
                {isP2TimeoutLoading ? (
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
          )}
        </div>
      ) : (
        <>
          {p1Timeout ? (
            <div className="py-2 px-3 text-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <p className="font-bold">
                Player 2 called the timeout because you haven&apos;t solved.
              </p>
            </div>
          ) : winner === null ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <div className="py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                <p className="text-sm font-semibold">
                  Player 2 has played, you need to solve now.
                </p>
              </div>

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
                    Solving...
                  </>
                ) : (
                  "Solve"
                )}
              </button>
            </form>
          ) : (
            <div
              className={`text-center py-2 px-3 rounded-lg ${
                winner === "draw"
                  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                  : winner === "player1"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              <p className="font-bold text-lg">
                {winner === "draw"
                  ? "It's a tie!"
                  : winner === "player1"
                  ? "🎉 You won the game!"
                  : "You lost this round."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(Player1View);
