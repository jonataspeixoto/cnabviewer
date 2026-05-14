import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Info } from 'lucide-react';

export const SuggestionField = ({ 
  value, 
  onChange, 
  options = [], 
  onFocus, 
  onBlur,
  error,
  isFocused: externalFocused,
  placeholder = "Digite ou escolha..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.value.toLowerCase().includes((value || '').toLowerCase()) ||
    opt.label.toLowerCase().includes((value || '').toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
  };

  const currentOption = options.find(opt => opt.value === value);
  const hasOptions = options.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative group">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            onFocus?.();
          }}
          onBlur={() => {
            // Pequeno delay para permitir o clique no dropdown
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
                onBlur?.();
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full bg-slate-900 border ${externalFocused ? 'border-blue-500 ring-1 ring-blue-500/20' : error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 group-hover:border-slate-600'} rounded px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono pr-8`}
        />
        {hasOptions && (
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
          </button>
        )}
      </div>

      {isOpen && hasOptions && (
        <div className="absolute z-[100] mt-1 w-full max-w-[340px] bg-slate-950 border border-slate-700 rounded-lg shadow-2xl overflow-hidden glass animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-500/10 transition-colors flex flex-col gap-0.5 group/item ${value === opt.value ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-bold ${value === opt.value ? 'text-blue-400' : 'text-slate-300 group-hover/item:text-blue-300'}`}>
                        {opt.value}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 group-hover/item:text-slate-200">
                        {opt.label}
                      </span>
                    </div>
                    {value === opt.value && <Check className="w-3 h-3 text-blue-500" />}
                  </div>
                  {opt.description && (
                    <p className="text-[9px] text-slate-500 leading-tight">
                      {opt.description}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-[10px] text-slate-500 italic">Nenhuma sugestão para "{value}"</p>
                <p className="text-[9px] text-slate-600 mt-1">Você pode continuar digitando o valor desejado.</p>
              </div>
            )}
          </div>

          {currentOption && (
            <div className="p-2 bg-blue-500/5 border-t border-blue-500/10 flex gap-2">
              <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">Valor Selecionado: {currentOption.value}</p>
                <p className="text-[10px] text-blue-100/80 leading-tight">
                  {currentOption.label}: {currentOption.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
