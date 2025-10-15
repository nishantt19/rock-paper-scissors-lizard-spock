import React from "react";

interface DisplayProps {
  label: string;
  value: string;
  name?: string;
}

const Display: React.FC<DisplayProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <p className="text-sm text-gray-100 font-mono break-all">
        {value || "—"}
      </p>
    </div>
  );
};

export default Display;
