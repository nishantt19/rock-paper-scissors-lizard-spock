import React from "react";

interface DividerProps {
  text?: string;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center w-full mt-6 mb-2">
      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-gray-300 dark:via-gray-800 dark:to-gray-700"></div>
      {text && (
        <span className="px-6 text-sm font-medium text-gray-400 dark:text-gray-500">
          {text}
        </span>
      )}
      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-gray-200 to-gray-300 dark:via-gray-800 dark:to-gray-700"></div>
    </div>
  );
};

export default Divider;
