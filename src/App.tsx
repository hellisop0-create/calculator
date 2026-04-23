/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  Info,
  History,
  ChevronLeft
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    text: isDarkMode ? '#f8fafc' : '#1e293b',
    muted: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748b',
    glass: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  };

  const handleNumber = useCallback((num: string) => {
    setInput(prev => {
      if (prev === '0' && num !== '.') return num;
      if (num === '.' && prev.includes('.')) return prev;
      return prev + num;
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    if (input === '0' && !prevInput) return;
    if (prevInput && operation) calculate();
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
    setHistory(prev => [{ id: crypto.randomUUID(), expression, result: formattedResult, timestamp: Date.now() }, ...prev].slice(0, 20));
    setInput(formattedResult);
    setPrevInput('');
    setOperation('');
  }, [input, prevInput, operation]);

  const handleAction = useCallback((action: string) => {
    if (action === 'clear') { setInput('0'); setPrevInput(''); setOperation(''); }
    if (action === 'delete') setInput(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }, []);

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 transition-all duration-500 overflow-hidden"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#22d3ee] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#c084fc] rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start w-full max-w-6xl justify-center">
        
        {/* Main Calculator Card */}
        <motion.div 
          className="w-full max-w-[380px] rounded-[40px] p-6 lg:p-8 flex flex-col shadow-2xl"
          style={{ background: theme.glass, border: `1px solid ${theme.border}`, backdropFilter: 'blur(30px)' }}
        >
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#22d3ee]" />}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHistory(true)} 
                className="p-2 rounded-full opacity-60 hover:opacity-100 transition-all"
              >
                <History className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="text-right mb-8 px-2">
            <div className="text-lg font-light mb-1 h-7" style={{ color: theme.muted }}>
              {prevInput} {operation === '*' ? '×' : operation === '/' ? '÷' : operation}
            </div>
            <div className="text-5xl lg:text-7xl font-extralight tracking-tight truncate">
              {input}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 lg:gap-4">
            {BUTTONS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => {
                  if (btn.type === 'number') handleNumber(btn.value);
                  if (btn.type === 'operator') btn.value === '=' ? calculate() : handleOperator(btn.value);
                  if (btn.type === 'action') handleAction(btn.value);
                }}
                className={cn(
                  "flex items-center justify-center aspect-square rounded-2xl text-xl font-medium transition-all hover:scale-105 active:scale-95",
                  btn.span === 2 ? "col-span-2 aspect-auto rounded-[30px]" : "",
                  btn.value === '=' ? "bg-[#22d3ee] text-white shadow-lg shadow-cyan-500/20" : "bg-black/5 dark:bg-white/5"
                )}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* History Modal (Popup on Mobile / Panel on Desktop) */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 lg:relative lg:inset-auto z-50 w-full lg:w-[320px] lg:h-auto flex flex-col lg:rounded-[40px] shadow-2xl overflow-hidden"
              style={{ 
                background: theme.glass, 
                border: `1px solid ${theme.border}`, 
                backdropFilter: 'blur(40px)',
                height: typeof window !== 'undefined' && window.innerWidth < 1024 ? '100vh' : 'auto'
              }}
            >
              {/* Popup Header with Back Button */}
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: theme.border }}>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="flex items-center gap-1 text-sm font-medium opacity-60 hover:opacity-100 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> 
                  <span>Back</span>
                </button>
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: theme.muted }}>Recent Activity</span>
                <button 
                  onClick={() => setHistory([])} 
                  className="p-2 hover:text-red-500 opacity-40 hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* History Content */}
              <div className="flex-1 space-y-6 p-6 overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                  <div className="py-12 text-center text-sm italic opacity-30">No history available</div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className="cursor-pointer group" 
                      onClick={() => {
                        setInput(item.result);
                        if (window.innerWidth < 1024) setShowHistory(false);
                      }}
                    >
                      <div className="text-xs mb-1 opacity-50 group-hover:text-[#22d3ee] transition-colors">{item.expression}</div>
                      <div className="text-lg font-light">= {item.result}</div>
                      <div className="h-[1px] w-full mt-4 opacity-10" style={{ backgroundColor: theme.text }} />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155,155,155,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}