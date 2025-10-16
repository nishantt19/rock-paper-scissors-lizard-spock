/**
 * Watches new blocks to auto-detect RPSLS game deployments.
 * Only runs when no game is loaded. Useful for automatically loading games
 * where the connected user is either the creator or opponent.
 */

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

// Scans tx to detect RPS contract deployments involving the user
async function scanBlockTx(
  tx: any,
  address: Address,
  onGameCreation: (contractAddress: string) => void
) {
  // Checking for contract deployments only
  if (!tx.to) {
    // Skip if bytecode does not match with the RPS contract
    if (!tx.input.startsWith((RPS.bytecode.object as `0x${string}`).slice(0, 20))) {
      return;
    }

    try {
      // Get deployed contract address
      const contractAddress = getContractAddress({
        from: tx.from as `0x${string}`,
        nonce: BigInt(tx.nonce),
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx.hash,
        confirmations: 1,
      });

      if (receipt.status === "success") {
        // Check if user is involved
        const j2 = (await readContract(config, {
          address: contractAddress,
          abi: RPS.abi,
          functionName: "j2",
        })) as `0x${string}`;

        // Create the game only if the address matches player 1 or player 2
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

      if (!block || !Array.isArray(block.transactions)) return;

        block.transactions.forEach((tx)=> {
          if(typeof tx === 'string') return;
          scanBlockTx(tx, address, onWatchBlock)
        })
    },
  });
}
