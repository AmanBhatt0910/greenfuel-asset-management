// components/FormSelectSearchable.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export default function FormSelectSearchable({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to always have { value, label } structure
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the label for the current value
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: "" } });
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-secondary">{label}</label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm text-left
            surface border border-default
            focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40
            transition-all hover:border-[color:var(--border)]
            flex items-center justify-between gap-2
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${!displayValue ? "text-secondary" : "text-primary"}
          `}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <div className="flex items-center gap-1">
            {value && !disabled && (
              <X
                size={16}
                className="text-secondary hover:text-primary transition-colors"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              size={16}
              className={`text-secondary transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="
              absolute z-50 w-full mt-2
              surface border border-default rounded-xl
              shadow-xl
              max-h-80 overflow-hidden
              flex flex-col
            "
          >
            {/* Search Input */}
            <div className="p-3 border-b border-default">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full pl-9 pr-3 py-2 rounded-lg
                    surface-muted border border-default
                    text-sm text-primary placeholder:text-secondary
                    focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40
                    transition-all
                  "
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-secondary text-sm">
                  No options found
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        transition-colors
                        ${
                          opt.value === value
                            ? "accent-bg accent font-medium"
                            : "text-primary hover:surface-muted"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}