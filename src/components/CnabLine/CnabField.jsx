import React from 'react';
import { BookOpen } from 'lucide-react';
import { useCnabStore } from '../../store/useCnabStore';
import { CNAB_RULES } from '../../utils/cnab/rules';

const renderTextWithHighlights = (text, showWhitespace) => {
  if (!text) return null;
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text)).map(s => s.segment);

  return segments.map((char, i) => (
    <span key={i} className={`cnab-char ${char === ' ' ? 'opacity-20' : ''}`}>
      {char === ' ' && showWhitespace ? '·' : (char === ' ' ? '\u00A0' : char)}
    </span>
  ));
};

const getTextColor = (type) => {
  if (type === 'N') return 'text-blue-400/90';
  if (type === 'A') return 'text-emerald-400/90';
  return 'text-slate-300';
};

export const CnabField = ({ 
  field, 
  idx, 
  val, 
  isFocused, 
  localVal, 
  errorInfo, 
  isContinuous, 
  onFieldClick,
  inputRef,
  onChange,
  onKeyDown,
  onBlur,
  fields,
  groupInfo
}) => {
  const showWhitespace = useCnabStore(state => state.visualSettings.showWhitespace);
  const openDoc = useCnabStore(state => state.openDoc);
  
  const isReserved = field.name.includes('uso_exclusivo') || field.name === 'filler';
  const charCount = field.end - field.start + 1;
  const rule = CNAB_RULES[field.rule || field.ruleId];
  const options = field.options || rule?.options;
  const optionsText = options ? `\n\nValores Válidos:\n${options.map(o => `• ${o.value}: ${o.label}`).join('\n')}` : '';

  return (
    <div
      onClick={(e) => onFieldClick(e, field.name, val)}
      style={{
        width: `${charCount}ch`,
        fontSize: '14px',
        boxShadow: isContinuous ? 'none' : 'inset -1px 0 0 0 rgba(100, 116, 139, 0.3)'
      }}
      className={`
        relative flex-shrink-0 font-cnab transition-all h-7 flex items-center overflow-visible cursor-text
        ${isFocused ? 'bg-blue-600/40 z-20 ring-2 ring-blue-400 shadow-xl' : 'hover:bg-slate-700/30'}
        ${isReserved ? 'bg-slate-800/20' : ''}
        ${errorInfo && !isFocused ? (
          errorInfo.type === 'critical' 
            ? 'bg-red-600/40 border-x border-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.4)]' 
            : 'bg-orange-500/20 border-x border-orange-500/40'
        ) : ''}
      `}
      title={`${groupInfo ? '[CAMPO DINÂMICO/ESPECIAL] ' : ''}${field.label} (${field.start}-${field.end})${rule?.desc ? '\n' + rule.desc : ''}${optionsText}${errorInfo ? '\n\nERRO: ' + errorInfo.message : ''}`}
    >
      {groupInfo && (
        <div 
          className={`
            absolute inset-y-0 pointer-events-none border-y border-dashed z-0
            ${groupInfo.colorClass}
            ${groupInfo.isStart ? 'border-l left-[-2px] rounded-l-[4px]' : 'left-0'}
            ${groupInfo.isEnd ? 'border-r right-[-2px] rounded-r-[4px]' : 'right-0'}
          `}
        />
      )}

      <div className="relative z-10 w-full h-full flex items-center">
        {isFocused ? (
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="absolute inset-0 flex items-center justify-start whitespace-pre leading-none pointer-events-none select-none"
              style={{ fontSize: '14px', letterSpacing: '0px' }}
            >
              {renderTextWithHighlights(localVal !== null ? localVal : val, showWhitespace)}
            </div>

            <input
              ref={inputRef}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-left font-cnab p-0 m-0 z-30"
              style={{
                fontSize: '14px',
                letterSpacing: '0px',
                color: 'transparent',
                caretColor: 'white',
                appearance: 'none'
              }}
              autoComplete="off"
              spellCheck="false"
              maxLength={charCount}
              value={localVal !== null ? localVal : val}
              onChange={onChange}
              onBlur={onBlur}
              onKeyDown={(e) => onKeyDown(e, idx, fields)}
            />

            {options && options.length > 0 && (
              <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl z-50 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-2 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sugestões</span>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); openDoc(field.rule || field.ruleId); }}
                    className="p-1 hover:bg-blue-500/10 rounded text-blue-400/60 hover:text-blue-400 transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                  </button>
                </div>
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onMouseDown={(e) => { e.preventDefault(); onChange({ target: { value: opt.value } }); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-blue-600/20 rounded flex flex-col gap-0.5 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300 font-mono">{opt.value}</span>
                      {String(localVal || val).trim() === String(opt.value) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`w-full flex items-center justify-start whitespace-pre leading-none pointer-events-none h-full ${getTextColor(field.type)}`}>
              {renderTextWithHighlights(val, showWhitespace)}
            </div>
            {errorInfo && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm animate-pulse
                ${errorInfo.type === 'critical' ? 'bg-red-500 shadow-red-500/50' : 'bg-orange-500 shadow-orange-500/50'}`} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
