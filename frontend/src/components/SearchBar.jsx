import React from 'react';

const SearchBar = ({ placeholder }) => {
    return (
        <div className="relative w-5/6 text-center">
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full py-2.5 pl-10 pr-4 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg" // Increased padding and font size
                />
                <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-4.35-4.35M16.5 10.5A6 6 0 1110.5 4.5a6 6 0 016 6z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;