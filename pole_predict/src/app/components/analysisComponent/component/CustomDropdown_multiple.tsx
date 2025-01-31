import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CustomDropdown_multiple = ({ options, selectedGroups, onChange, backgroundColor, textColor, placeHolder }: {
    options: { label: string; value: string }[];
    selectedGroups: { label: string; value: string }[];
    onChange: (selected: { label: string; value: string }[]) => void;
    backgroundColor: string;
    textColor: string;
    placeHolder: string;
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

    const handleSelect = (option: { label: string; value: string }) => {
        const isSelected = selectedGroups.some(selected => selected.value === option.value);
        if (isSelected) {
            onChange(selectedGroups.filter(selected => selected.value !== option.value));
        } else {
            onChange([...selectedGroups, option]);
        }
    };

    const handleSelectAll = () => {
        if (selectedGroups.length === options.length) {
            onChange([]); // Deselect all if all are selected
        } else {
            onChange(options); // Select all
        }
    };

    const handleDeselectAll = () => {
        onChange([]); // Deselect all
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ backgroundColor, color: textColor }}
                className="p-2 rounded-md border border-gray-500 w-full text-left flex justify-between items-center"
            >
                <span className="gradient-text">
                    {selectedGroups.length > 0 ? selectedGroups.map(group => group.label).join(', ') : placeHolder}
                </span>
                {selectedGroups.length > 0 && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown from closing
                            handleDeselectAll();
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                        &#x2715; {/* 'x' icon */}
                    </span>
                )}
            </button>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ backgroundColor, color: textColor }}
                    className="absolute z-10 mt-1 w-full rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar"
                >
                    <div
                        onClick={handleSelectAll}
                        className={`p-2 hover:bg-gray-700 cursor-pointer ${selectedGroups.length === options.length ? 'bg-gray-600' : ''}`}
                    >
                        <span className="gradient-text">
                            {selectedGroups.length === options.length ? 'Deselect All' : 'Select All'}
                        </span>
                    </div>
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`p-2 hover:bg-gray-700 cursor-pointer ${selectedGroups.some(selected => selected.value === option.value) ? 'bg-gray-600' : ''}`}
                        >
                            <span className="gradient-text">
                                {option.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default CustomDropdown_multiple;