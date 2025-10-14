import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  name?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder = "...", type = "text", name, ...rest }, ref) => {
    return (
      <div className="flex flex-col static">
        <label
          htmlFor={name}
          className="text-xs text-[#2F64FF] font-bold relative top-2 mx-0 my-0 ml-[7px] px-[3px] py-0 bg-[#0a0a0a] w-fit"
        >
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          name={name}
          className="py-2 px-2.5 text-xs border border-[#2F64FF] rounded-[5px] bg-[#0a0a0a] focus:outline-none"
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
