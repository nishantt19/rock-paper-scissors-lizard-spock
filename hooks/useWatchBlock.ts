import { useWatchBlocks } from "wagmi";
import {
  decodeDeployData,
  getContractAddress,
  zeroAddress,
  type Address,
} from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";
import { toast } from "sonner";

type UseWatchBlockProps = {
  address: Address | undefined;
  currentGame: string;
  onWatchBlock: (currentAddress: string) => void;
};

export function useWatchBlock({
  address,
  currentGame,
  onWatchBlock,
}: UseWatchBlockProps) {
  useWatchBlocks({
    enabled: !!address && currentGame === zeroAddress,
    includeTransactions: true,
    onBlock: async (block) => {
      if (!address) return;

      for (const tx of block.transactions) {
        try {
          if (!tx.to) {
            if (
              !tx.input.startsWith(
                (RPS.bytecode.object as `0x${string}`).slice(0, 20)
              )
            ) {
              continue;
            }

            const decoded = decodeDeployData({
              bytecode: RPS.bytecode.object as `0x${string}`,
              abi: RPS.abi,
              data: tx.input as `0x${string}`,
            });

            const [, _j2] = decoded.args as readonly [
              `0x${string}`,
              `0x${string}`
            ];

            if (_j2.toLowerCase() === address.toLowerCase()) {
              const txReceipt = await waitForTransactionReceipt(config, {
                hash: tx.hash,
                confirmations: 1,
              });

              if (txReceipt.status === "success") {
                const contractAddress = getContractAddress({
                  from: tx.from as `0x${string}`,
                  nonce: BigInt(tx.nonce),
                });
                onWatchBlock(contractAddress);
              }
            }
          }
        } catch (error: any) {
          console.error("Error scanning the transaction", error);
          toast.error(`Error: ${error?.details}`);
        }
      }
    },
  });
}
