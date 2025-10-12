import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "viem/chains";

export const config = getDefaultConfig({
    appName: 'rock-paper-scissors-lizard-spock',
    chains: [sepolia],
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
})
