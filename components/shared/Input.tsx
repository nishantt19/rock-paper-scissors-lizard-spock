import React from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "number";
  name?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder = "...",
  type = "text",
  name,
}) => {
  return (
    <div className="flex flex-col static">
      <label
        htmlFor={name}
        className="text-xs text-[#2F64FF] font-bold relative top-2 mx-0 my-0 ml-[7px] px-[3px] py-0 bg-[#0a0a0a] w-fit"
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="p-[11px_10px] text-xs border-2 border-[#2F64FF] rounded-[5px] bg-[#0a0a0a] focus:outline-none"
      />
    </div>
  );
};

export default Input;
