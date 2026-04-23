/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Trash2, 
  Delete, 
  Percent, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal,
  RotateCcw,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { cn } from './lib/utils';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

type ButtonType = 'number' | 'operator' | 'action';

interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  icon?: ReactNode;
  span?: number;
  glowColor?: 'blue' | 'purple' | 'orange' | 'white';
}

const BUTTONS: CalcButton[] = [
  { label: 'AC', value: 'clear', type: 'action', icon: <RotateCcw className="w-5 h-5" />, glowColor: 'orange' },
  { label: 'DEL', value: 'delete', type: 'action', icon: <Delete className="w-5 h-5" />, glowColor: 'orange' },
  { label: '%', value: '%', type: 'operator', icon: <Percent className="w-5 h-5" />, glowColor: 'purple' },
  { label: '÷', value: '/', type: 'operator', icon: <Divide className="w-5 h-5" />, glowColor: 'purple' },
  
  { label: '7', value: '7', type: 'number', glowColor: 'white' },
  { label: '8', value: '8', type: 'number', glowColor: 'white' },
  { label: '9', value: '9', type: 'number', glowColor: 'white' },
  { label: '×', value: '*', type: 'operator', icon: <X className="w-5 h-5" />, glowColor: 'purple' },
  
  { label: '4', value: '4', type: 'number', glowColor: 'white' },
  { label: '5', value: '5', type: 'number', glowColor: 'white' },
  { label: '6', value: '6', type: 'number', glowColor: 'white' },
  { label: '−', value: '-', type: 'operator', icon: <Minus className="w-5 h-5" />, glowColor: 'purple' },
  
  { label: '1', value: '1', type: 'number', glowColor: 'white' },
  { label: '2', value: '2', type: 'number', glowColor: 'white' },
  { label: '3', value: '3', type: 'number', glowColor: 'white' },
  { label: '+', value: '+', type: 'operator', icon: <Plus className="w-5 h-5" />, glowColor: 'purple' },
  
  { label: '0', value: '0', type: 'number', span: 2, glowColor: 'white' },
  { label: '.', value: '.', type: 'number', glowColor: 'white' },
  { label: '=', value: '=', type: 'operator', icon: <Equal className="w-5 h-5" />, glowColor: 'blue' },
];

export default function App() {
  const [input, setInput] = useState('0');
  const [prevInput, setPrevInput] = useState('');
  const [operation, setOperation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Background blobs from Frosted Glass theme
  const blobs = [
    { id: 'cyan', color: 'bg-[#22d3ee]', pos: 'top-[100px] left-[100px]' },
    { id: 'purple', color: 'bg-[#c084fc]', pos: 'bottom-[100px] right-[100px]' },
  ];

  const handleNumber = useCallback((num: string) => {
    setInput(prev => {
      if (prev === '0' && num !== '.') return num;
      if (num === '.' && prev.includes('.')) return prev;
      return prev + num;
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    if (input === '0' && !prevInput) return;
    
    if (prevInput && operation) {
      calculate();
    }
    
    setOperation(op);
    setPrevInput(input);
    setInput('0');
  }, [input, prevInput, operation]);

  const calculate = useCallback(() => {
    if (!operation || !prevInput) return;

    const current = parseFloat(input);
    const previous = parseFloat(prevInput);
    let result = 0;

    switch (operation) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '*': result = previous * current; break;
      case '/': 
        if (current === 0) {
          setInput('Error');
          setTimeout(() => setInput('0'), 1500);
          return;
        }
        result = previous / current; 
        break;
      case '%': result = (previous * current) / 100; break;
      default: return;
    }

    const formattedResult = Number(result.toFixed(8)).toString();
    const expression = `${prevInput} ${operation} ${input}`;
    
    const newHistoryItem: HistoryItem = {
      id: crypto.randomUUID(),
      expression,
      result: formattedResult,
      timestamp: Date.now(),
    };

    setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
    setInput(formattedResult);
    setPrevInput('');
    setOperation('');
  }, [input, prevInput, operation]);

  const clear = useCallback(() => {
    setInput('0');
    setPrevInput('');
    setOperation('');
  }, []);

  const deleteLast = useCallback(() => {
    setInput(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, []);

  const handleAction = useCallback((action: string) => {
    if (action === 'clear') clear();
    if (action === 'delete') deleteLast();
  }, [clear, deleteLast]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleNumber('.');
      if (['+', '-', '*', '/', '%'].includes(e.key)) handleOperator(e.key);
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') deleteLast();
      if (e.key === 'Escape') clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, deleteLast, clear]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 font-sans frosted-bg">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {blobs.map((blob) => (
          <div
            key={blob.id}
            className={cn(
              "absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 z-0",
              blob.color,
              blob.pos
            )}
          />
        ))}
      </div>

      {/* Status Bar */}
      <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
        <div className="w-2 h-2 bg-[#22d3ee] rounded-full shadow-[0_0_10px_#22d3ee]" />
        <span className="text-sm font-semibold tracking-[3px] uppercase text-white/60">Lumina Calc v2.0</span>
      </div>

      {/* Main Layout Containers */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center lg:items-start max-w-7xl">
        
        {/* Calculator Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px] glass-main rounded-[48px] overflow-hidden p-8 flex flex-col"
        >
          {/* Header Controls (Minimalized for theme) */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Moon className="w-5 h-5 text-[#22d3ee]" />
            </button>
            <div className="flex gap-4">
              <button onClick={() => setShowInfo(true)} className="opacity-40 hover:opacity-100 transition-opacity">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Display Section */}
          <div className="text-right mb-8 px-2 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={prevInput + operation}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg text-white/40 font-light mb-1 h-7"
              >
                {prevInput} {operation && (operation === '*' ? '×' : operation === '/' ? '÷' : operation)}
              </motion.div>
            </AnimatePresence>
            <motion.div 
              key={input}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "text-[72px] font-extralight tracking-[-2px] leading-tight truncate",
                input.length > 8 && "text-5xl",
                input.length > 12 && "text-4xl"
              )}
            >
              {input}
            </motion.div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-4">
            {BUTTONS.map((btn) => (
              <motion.button
                key={btn.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (btn.type === 'number') handleNumber(btn.value);
                  if (btn.type === 'operator') {
                    if (btn.value === '=') calculate();
                    else handleOperator(btn.value);
                  }
                  if (btn.type === 'action') handleAction(btn.value);
                }}
                className={cn(
                  "calc-btn-standard",
                  btn.span === 2 && "col-span-2 aspect-auto rounded-[50px]",
                  btn.type === 'operator' && btn.value !== '=' && "calc-btn-op",
                  btn.value === '=' && "calc-btn-accent",
                  btn.type === 'action' && "calc-btn-op opacity-80"
                )}
              >
                {btn.icon || btn.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* History Card (Sideboard) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-[280px] p-6 glass-main/80 rounded-[32px] lg:mt-10 backdrop-blur-2xl border-white/5"
        >
          <div className="text-[12px] uppercase tracking-[2px] text-white/30 font-semibold mb-5 flex justify-between items-center">
            Recent Activity
            <button onClick={() => setHistory([])} className="hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/20 italic">No activity recorded</div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="group cursor-pointer"
                  onClick={() => setInput(item.result)}
                >
                  <div className="text-sm text-white/40 mb-1 group-hover:text-[#22d3ee] transition-colors">{item.expression}</div>
                  <div className="text-lg font-light">= {item.result}</div>
                  <div className="h-[1px] w-full bg-white/5 mt-4" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
