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
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={name}
          className="text-xs font-semibold text-foreground/70 px-0.5"
        >
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          name={name}
          className="py-2.5 px-3.5 text-sm border border-white/10 rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/30 hover:border-white/20"
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
