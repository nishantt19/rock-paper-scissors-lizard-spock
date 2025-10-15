import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { webSocket } from "@wagmi/core";
import { sepolia } from "viem/chains";

export const config = getDefaultConfig({
    appName: 'rock-paper-scissors-lizard-spock',
    chains: [sepolia],
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    transports: {
        [sepolia.id]: webSocket('wss://eth-sepolia.g.alchemy.com/v2/' + process.env.NEXT_PUBLIC_ALCHEMY_KEY!)
    }
})
