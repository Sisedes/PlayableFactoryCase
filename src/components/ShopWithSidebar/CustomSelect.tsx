import React, { useState, useEffect, useRef } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  onChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  onChange,
  defaultValue,
  value 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === (value || defaultValue)) || options[0]
  );
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const newSelectedOption = options.find(opt => opt.value === value);
      if (newSelectedOption) {
        setSelectedOption(newSelectedOption);
      }
    }
  }, [value, options]);

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: SelectOption) => {
    setSelectedOption(option);
    toggleDropdown();
    
    if (onChange) {
      onChange(option.value);
    }
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => {
          if (option.value === selectedOption.value) return null;
          
          return (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
              className="select-item hover:bg-gray-100 cursor-pointer"
          >
            {option.label}
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomSelect;
