import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { CnabLine } from './CnabLine';
import { Dropzone } from './Dropzone';
import { cnabEngine } from '../utils/cnab/engine';
import { ContextBar } from './ContextBar';

const ROW_HEIGHT = 32; // h-8 = 32px
const BUFFER_SIZE = 10;

export const CnabExplorer = () => {
  const { rawLines, activeRules, selectedLineIndex, selectLine, visualSettings, toggleVisualSetting } = useCnabStore();
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rawLines]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Cálculo das linhas visíveis
  const { startIndex, endIndex, translateY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      rawLines.length,
      Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_SIZE
    );
    return {
      startIndex: start,
      endIndex: end,
      translateY: start * ROW_HEIGHT
    };
  }, [scrollTop, containerHeight, rawLines.length]);

  if (rawLines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900/50">
        <Dropzone />
      </div>
    );
  }

  const visibleLines = rawLines.slice(startIndex, endIndex);

  return (
    <div className="flex-1 flex flex-col bg-cnab-bg overflow-hidden relative">
      <ContextBar />
      
      <div className="h-10 border-b border-slate-800 bg-slate-900/40 px-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={visualSettings.isContinuous} 
            onChange={() => toggleVisualSetting('isContinuous')}
            className="hidden"
          />
          <div className={`w-8 h-4 rounded-full transition-colors relative ${visualSettings.isContinuous ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${visualSettings.isContinuous ? 'left-4.5' : 'left-0.5'}`} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest">Modo Contínuo</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={visualSettings.showLimitLine} 
            onChange={() => toggleVisualSetting('showLimitLine')}
            className="hidden"
          />
          <div className={`w-8 h-4 rounded-full transition-colors relative ${visualSettings.showLimitLine ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${visualSettings.showLimitLine ? 'left-4.5' : 'left-0.5'}`} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest">Linha Limite (240)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={visualSettings.showWhitespace} 
            onChange={() => toggleVisualSetting('showWhitespace')}
            className="hidden"
          />
          <div className={`w-8 h-4 rounded-full transition-colors relative ${visualSettings.showWhitespace ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${visualSettings.showWhitespace ? 'left-4.5' : 'left-0.5'}`} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest">Espaços Visíveis</span>
        </label>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto custom-scrollbar p-6 relative font-cnab text-[14px]"
      >
        {/* Espaçador para manter o scrollbar correto */}
        <div style={{ height: `${rawLines.length * ROW_HEIGHT}px`, width: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />

        {/* Linha Demarcadora de 240 posições */}
        {visualSettings.showLimitLine && (
          <div 
            className="absolute top-0 bottom-0 border-r border-dashed border-red-500/50 z-0 pointer-events-none"
            style={{ left: `calc(24px + 48px + 240ch)` }} 
          />
        )}

        <div 
          className="flex flex-col gap-0 min-w-max relative z-10"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {visibleLines.map((line, i) => (
            <CnabLine 
              key={startIndex + i}
              index={startIndex + i}
              raw={line}
              isSelected={selectedLineIndex === startIndex + i}
              onSelect={selectLine}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
