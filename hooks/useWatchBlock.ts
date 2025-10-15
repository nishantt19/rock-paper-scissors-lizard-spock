import { useWatchBlocks } from "wagmi";
import {
  getContractAddress,
  zeroAddress,
  type Address,
} from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";
import { toast } from "sonner";

type UseWatchBlockProps = {
  address: Address | undefined;
  currentGame: string;
  onWatchBlock: (currentAddress: string) => void;
};

async function scanBlockTx(
  tx: any,
  address: Address,
  onGameCreation: (contractAddress: string) => void
) {
  if (!tx.to) {
    if (!tx.input.startsWith((RPS.bytecode.object as `0x${string}`).slice(0, 20))) {
      return;
    }

    try {
      const contractAddress = getContractAddress({
        from: tx.from as `0x${string}`,
        nonce: BigInt(tx.nonce),
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx.hash,
        confirmations: 1,
      });

      if (receipt.status === "success") {
        const j2 = (await readContract(config, {
          address: contractAddress,
          abi: RPS.abi,
          functionName: "j2",
        })) as `0x${string}`;

        if (
          tx.from.toLowerCase() === address.toLowerCase() ||
          j2.toLowerCase() === address.toLowerCase()
        ) {
          onGameCreation(contractAddress);
        }
      }
    } catch (error: any) {
      console.error("Error scanning transaction", error);
      toast.error(`Error: ${error?.details}`);
    }
  }
}

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

      block.transactions.forEach((tx)=> scanBlockTx(tx, address, onWatchBlock))
    },
  });
}
