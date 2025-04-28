import React, { useState } from 'react';

// Simple debug component to view data structures
const DebugView = ({ data, title = 'Debug Info' }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!data) return null;

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-md my-2 p-2 text-sm">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="font-bold text-gray-700">{title}</h4>
                <span>{isOpen ? '▼' : '▶'}</span>
            </div>

            {isOpen && (
                <pre className="mt-2 p-2 bg-white overflow-auto max-h-96 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
            )}
        </div>
    );
};

export default DebugView;