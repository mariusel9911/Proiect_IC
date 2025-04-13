import { Plus, Minus } from 'lucide-react';

const CleaningOption = ({ option, quantity, onIncrement, onDecrement }) => {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center mr-4">
                    <span className="text-xl">{option.icon}</span>
                </div>
                <span className="text-lg text-gray-700">{option.name}</span>
            </div>

            <div className="flex items-center">
                <span className="mr-4 text-lg font-medium">{option.price}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDecrement}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        disabled={quantity <= 0}
                    >
                        <Minus size={18} className={quantity <= 0 ? "text-gray-400" : "text-gray-700"} />
                    </button>
                    <span className="w-6 text-center">{quantity}</span>
                    <button
                        onClick={onIncrement}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CleaningOption;