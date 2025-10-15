import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { Gamepad2 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-white/10 backdrop-blur-sm bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">RPSLS Game</h1>
            <p className="text-[10px] text-foreground/60">Rock Paper Scissors Lizard Spock</p>
          </div>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;
