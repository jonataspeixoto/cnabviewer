import React from 'react';
import { useCnabStore } from '../../store/useCnabStore';

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

export const CnabExtraField = ({
  raw,
  extraVal,
  isFocused,
  localVal,
  isContinuous,
  onFieldClick,
  inputRef,
  onChange,
  onKeyDown,
  onBlur,
  fieldCount
}) => {
  const showWhitespace = useCnabStore(state => state.visualSettings.showWhitespace);
  const hasExcess = raw.length > 240;

  return (
    <div
      onClick={(e) => onFieldClick(e, '_extra', extraVal)}
      style={{
        width: isFocused ? '40ch' : `${Math.max(extraVal.length, 6)}ch`,
        fontSize: '14px',
        boxShadow: isContinuous ? 'none' : 'inset 1px 0 0 0 rgba(100, 116, 139, 0.3)'
      }}
      className={`
        relative flex-shrink-0 font-cnab transition-all h-7 flex items-center overflow-hidden cursor-text
        ${hasExcess ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/30 text-slate-500'}
        ${isFocused ? 'bg-blue-600/40 z-20 ring-2 ring-blue-400 shadow-xl' : 'hover:bg-slate-700/30'}
      `}
      title={hasExcess ? `Território Inválido (Excesso: ${raw.length - 240} pos.)` : 'Zona de Expansão (Pós-240)'}
    >
      {isFocused ? (
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-start whitespace-pre leading-none pointer-events-none select-none text-[14px]"
            style={{ letterSpacing: '0px' }}
          >
            {renderTextWithHighlights(localVal !== null ? localVal : extraVal, showWhitespace)}
          </div>

          <input
            ref={inputRef}
            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-left font-cnab p-0 m-0 z-30"
            style={{
              fontSize: '14px',
              letterSpacing: '0px',
              color: 'transparent',
              caretColor: 'white'
            }}
            autoComplete="off"
            spellCheck="false"
            value={localVal !== null ? localVal : extraVal}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={(e) => onKeyDown(e, fieldCount, [])}
            placeholder="Extras..."
          />
        </div>
      ) : (
        <div className="w-full flex items-center justify-start whitespace-pre leading-none pointer-events-none text-[10px] font-black uppercase tracking-tighter opacity-70 h-full">
          {extraVal.length > 0 ? renderTextWithHighlights(extraVal, showWhitespace) : '+ EXTRA'}
        </div>
      )}
    </div>
  );
};
