import { useState, useRef } from 'react';
import { Calculator } from 'lucide-react';

type CalculatorScreenProps = {
  onExit: () => void;
};

export default function CalculatorScreen({ onExit }: CalculatorScreenProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleIconClick = () => {
    tapCountRef.current += 1;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    if (tapCountRef.current === 3) {
      onExit();
      tapCountRef.current = 0;
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 500);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 text-gray-900 font-mono flex flex-col max-w-sm mx-auto shadow-xl overflow-hidden relative"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Hidden exit mechanism - triple tap on calculator icon */}
      <div className="flex items-center justify-center p-4 bg-white border-b border-gray-200">
        <Calculator
          className="w-8 h-8 text-gray-600 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>

      {/* Display */}
      <div className="flex-1 flex items-end justify-end p-6 bg-white">
        <div className="text-right">
          <div className="text-4xl font-light text-gray-900 overflow-hidden">
            {display}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1 p-4 bg-gray-200">
        <button
          onClick={clear}
          className="col-span-2 bg-red-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-red-600 active:bg-red-700"
        >
          Clear
        </button>
        <button
          onClick={() => inputOperation('/')}
          className="bg-orange-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-orange-600 active:bg-orange-700"
        >
          ÷
        </button>
        <button
          onClick={() => inputOperation('*')}
          className="bg-orange-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-orange-600 active:bg-orange-700"
        >
          ×
        </button>

        <button
          onClick={() => inputNumber('7')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          7
        </button>
        <button
          onClick={() => inputNumber('8')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          8
        </button>
        <button
          onClick={() => inputNumber('9')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          9
        </button>
        <button
          onClick={() => inputOperation('-')}
          className="bg-orange-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-orange-600 active:bg-orange-700"
        >
          −
        </button>

        <button
          onClick={() => inputNumber('4')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          4
        </button>
        <button
          onClick={() => inputNumber('5')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          5
        </button>
        <button
          onClick={() => inputNumber('6')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          6
        </button>
        <button
          onClick={() => inputOperation('+')}
          className="bg-orange-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-orange-600 active:bg-orange-700"
        >
          +
        </button>

        <button
          onClick={() => inputNumber('1')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          1
        </button>
        <button
          onClick={() => inputNumber('2')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          2
        </button>
        <button
          onClick={() => inputNumber('3')}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          3
        </button>
        <button
          onClick={() => performCalculation()}
          className="row-span-2 bg-green-500 text-white rounded-lg py-4 text-xl font-semibold hover:bg-green-600 active:bg-green-700"
        >
          =
        </button>

        <button
          onClick={() => inputNumber('0')}
          className="col-span-2 bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          0
        </button>
        <button
          onClick={inputDot}
          className="bg-gray-300 text-gray-900 rounded-lg py-4 text-xl font-semibold hover:bg-gray-400 active:bg-gray-500"
        >
          .
        </button>
      </div>
    </div>
  );
}