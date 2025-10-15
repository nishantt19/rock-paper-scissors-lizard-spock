import React from "react";

interface DividerProps {
  text?: string;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center w-full my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-white/5"></div>
      {text && (
        <span className="px-6 text-sm font-medium text-foreground/40">
          {text}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/10 to-white/5"></div>
    </div>
  );
};

export default Divider;
