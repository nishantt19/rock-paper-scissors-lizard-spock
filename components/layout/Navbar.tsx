import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const Navbar = () => {
  return (
    <div className="w-full mx-auto py-6 px-12 flex justify-end items-center">
      {/* <h1 className="text-2xl font-bold">RPSLS Game</h1> */}
      <ConnectButton />
    </div>
  );
};

export default Navbar;
