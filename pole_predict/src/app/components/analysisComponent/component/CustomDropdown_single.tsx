import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface DropdownOption {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: DropdownOption[];
    selectedGroup: DropdownOption | null;
    onChange: (selected: DropdownOption | null) => void;
    backgroundColor: string;
    textColor: string;
    placeholder: string; // Customizable placeholder text
}

const CustomDropdown_single: React.FC<CustomDropdownProps> = ({
    options,
    selectedGroup,
    onChange,
    backgroundColor,
    textColor,
    placeholder = 'Select an option...', // Default placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle option selection
    const handleSelect = (option: DropdownOption) => {
        if (selectedGroup?.value === option.value) {
            onChange(null); // Deselect if the same option is clicked
        } else {
            onChange(option); // Select the new option
        }
        setIsOpen(false); // Close the dropdown after selection
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, option?: DropdownOption) => {
        if (event.key === 'Enter' && option) {
            handleSelect(option);
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => handleKeyDown(e)}
                style={{ backgroundColor, color: textColor }}
                className="p-2 rounded-md border border-gray-500 w-full text-left flex justify-between items-center"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="gradient-text">
                    {selectedGroup ? selectedGroup.label : placeholder}
                </span>
                {selectedGroup && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown from closing
                            onChange(null); // Deselect the current option
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.stopPropagation();
                                onChange(null);
                            }
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                        tabIndex={0} // Make the "x" icon focusable
                        aria-label="Deselect option"
                    >
                        &#x2715; {/* 'x' icon */}
                    </span>
                )}
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ backgroundColor, color: textColor }}
                    className="absolute z-10 mt-1 w-full rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar"
                    role="listbox"
                >
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                onKeyDown={(e) => handleKeyDown(e, option)}
                                className={`p-2 hover:bg-gray-700 cursor-pointer ${selectedGroup?.value === option.value ? 'bg-gray-600' : ''
                                    }`}
                                role="option"
                                aria-selected={selectedGroup?.value === option.value}
                                tabIndex={0} // Make options focusable
                            >
                                <span className="gradient-text">{option.label}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-400">No options available</div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default CustomDropdown_single;