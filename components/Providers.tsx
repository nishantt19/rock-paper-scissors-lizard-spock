"use client";
import React from "react";
import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { midnightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "@/config/wagmi";
import { GameProvider } from "@/context/GameContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={midnightTheme({
            accentColor: "#2F64FF",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          <GameProvider>
            <Toaster position="top-right" richColors />
            {children}
          </GameProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
