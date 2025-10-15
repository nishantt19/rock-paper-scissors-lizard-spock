"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="flex flex-col gap-1.5 relative">
      <label
        htmlFor={name}
        className="text-xs font-semibold text-foreground/70 px-0.5"
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="py-2.5 px-3.5 text-sm border border-white/10 rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-left cursor-pointer flex justify-between items-center transition-all hover:border-white/20"
      >
        <span className={!displayValue ? "text-foreground/30" : ""}>
          {displayValue || placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-primary ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-white/10 rounded-lg z-20 max-h-60 overflow-y-auto shadow-xl">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`py-2.5 px-3.5 text-sm cursor-pointer hover:bg-primary/20 transition-colors ${
                option.value === value ? "bg-primary/20 text-primary font-medium" : ""
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
