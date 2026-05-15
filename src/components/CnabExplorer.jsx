import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { CnabLine } from './CnabLine/index';
import { Dropzone } from './Dropzone';
import { cnabEngine } from '../utils/cnab/engine';

const ROW_HEIGHT = 32; // h-8 = 32px
const BUFFER_SIZE = 10;

export const CnabExplorer = () => {
  const rawLines = useCnabStore(state => state.rawLines);
  const linesCount = rawLines.length;
  const activeRules = useCnabStore(state => state.activeRules);
  const selectedLineIndex = useCnabStore(state => state.selectedLineIndex);
  const focusedField = useCnabStore(state => state.focusedField);
  const lastJump = useCnabStore(state => state.lastJump);
  const cursorOffset = useCnabStore(state => state.cursorOffset);
  const selectLine = useCnabStore(state => state.selectLine);
  const visualSettings = useCnabStore(state => state.visualSettings);
  const toggleVisualSetting = useCnabStore(state => state.toggleVisualSetting);
  
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);

  // Auto-scroll inteligente: Centraliza em pulos (audit), mas preserva posição em cliques manuais
  const lastJumpRef = useRef(lastJump);
  
  useEffect(() => {
    if (selectedLineIndex !== null && containerRef.current) {
      const scrollContainer = containerRef.current;
      const targetScroll = selectedLineIndex * ROW_HEIGHT;
      const currentScroll = scrollContainer.scrollTop;
      const viewportHeight = scrollContainer.clientHeight;
      
      const isJump = lastJump !== lastJumpRef.current;
      lastJumpRef.current = lastJump;

      // Se for um jump (audit), sempre centraliza
      if (isJump) {
        const centerScroll = targetScroll - (viewportHeight / 2) + (ROW_HEIGHT / 2);
        scrollContainer.scrollTo({
          top: Math.max(0, centerScroll),
          behavior: 'smooth'
        });
        return;
      }

      // Se for seleção manual, só scrolla se estiver fora do viewport (com margem)
      const margin = ROW_HEIGHT * 2;
      const isAbove = targetScroll < currentScroll + margin;
      const isBelow = targetScroll > currentScroll + viewportHeight - margin;

      if (isAbove || isBelow) {
        const centerScroll = targetScroll - (viewportHeight / 2) + (ROW_HEIGHT / 2);
        scrollContainer.scrollTo({
          top: Math.max(0, centerScroll),
          behavior: 'auto'
        });
      }
    }
  }, [selectedLineIndex, lastJump]); // Removemos containerHeight para evitar jitter em resize

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rawLines.length]); // Somente recalcula se o número de linhas mudar

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const handleSelect = useCallback((idx) => {
    selectLine(idx);
    // Dá foco ao container para habilitar navegação por teclado após clique
    containerRef.current?.focus();
  }, [selectLine]);

  const handleKeyDown = (e) => {
    // Evita conflito se o usuário estiver digitando em um input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    let nextIndex = selectedLineIndex;

    switch (e.key) {
      case 'ArrowDown':
        nextIndex = selectedLineIndex === null ? 0 : Math.min(rawLines.length - 1, selectedLineIndex + 1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        nextIndex = selectedLineIndex === null ? 0 : Math.max(0, selectedLineIndex - 1);
        e.preventDefault();
        break;
      case 'PageDown':
        nextIndex = selectedLineIndex === null ? 10 : Math.min(rawLines.length - 1, selectedLineIndex + 10);
        e.preventDefault();
        break;
      case 'PageUp':
        nextIndex = selectedLineIndex === null ? 0 : Math.max(0, selectedLineIndex - 10);
        e.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = rawLines.length - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    if (nextIndex !== selectedLineIndex) {
      selectLine(nextIndex);
    }
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
    <div 
      className="flex-1 flex flex-col bg-cnab-bg overflow-hidden relative outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
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
              focusedField={selectedLineIndex === startIndex + i ? focusedField : null}
              cursorOffset={selectedLineIndex === startIndex + i ? cursorOffset : 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
