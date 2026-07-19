"use client";

import { useMemo, useState } from "react";

interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  defaultValue?: string;
  disabled?: boolean;
  name: string;
  options: CustomSelectOption[];
  required?: boolean;
}

export function CustomSelect({
  defaultValue,
  disabled = false,
  name,
  options,
  required = false,
}: CustomSelectProps) {
  const fallbackValue = defaultValue || options[0]?.value || "";
  const [value, setValue] = useState(fallbackValue);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  return (
    <span className="custom-select">
      <input name={name} required={required} type="hidden" value={value} />
      <button
        aria-expanded={isOpen}
        className="custom-select-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{selectedOption?.label ?? "Pilih"}</span>
        <span className="custom-select-caret">⌄</span>
      </button>
      {isOpen && !disabled && (
        <span className="custom-select-menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={option.value === value ? "active" : ""}
              key={option.value}
              onClick={() => {
                setValue(option.value);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.value === value && <span>✓</span>}
              {option.label}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
