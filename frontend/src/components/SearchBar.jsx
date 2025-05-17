import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const navigate = useNavigate();
  const location = useLocation();

  // Update local value when the passed value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (onChange) {
      onChange(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(localValue);
    } else {
      // Default behavior: navigate to all-services with query param
      navigate(`/all-services?query=${encodeURIComponent(localValue)}`);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      // Create a synthetic event to match the onChange interface
      const syntheticEvent = { target: { value: '' } };
      onChange(syntheticEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={localValue || value}
          onChange={handleChange}
          className="w-full py-3 pl-12 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {(localValue || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 bg-gray-400 text-white p-1 rounded-full hover:bg-gray-600"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
