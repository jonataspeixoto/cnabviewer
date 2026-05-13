import React, { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
import { BookOpen } from 'lucide-react';
import { useCnabStore } from '../store/useCnabStore';
import { CNAB_RULES } from '../utils/cnab/rules';
import { cnabEngine } from '../utils/cnab/engine';

const CnabLineComponent = ({ index, raw, isSelected, focusedField, cursorOffset, onSelect }) => {
  const activeRules = useCnabStore(state => state.activeRules);
  const showWhitespace = useCnabStore(state => state.visualSettings.showWhitespace);
  const isContinuous = useCnabStore(state => state.visualSettings.isContinuous);
  const updateLine = useCnabStore(state => state.updateLine);
  const undo = useCnabStore(state => state.undo);
  const redo = useCnabStore(state => state.redo);
  const focusFieldAction = useCnabStore(state => state.focusField);
  
  // console.log(`[RENDER] CnabLine index=${index} isSelected=${isSelected} focusedField=${focusedField}`);
  const [localVal, setLocalVal] = useState(null);
  const inputRef = useRef(null);
  const rawRef = useRef(raw);
  
  // Atualiza o ref sempre que raw mudar, sem disparar o useEffect do cursor
  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  useEffect(() => {
    if (focusedField && isSelected && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          // Só rouba o foco se o foco atual NÃO estiver no painel de edição
          const isFocusInEditor = document.activeElement?.closest('[data-editor-panel="true"]');
          if (!isFocusInEditor) {
            inputRef.current.focus();
          }
          // Mapeia o offset de grafemas para o offset de code units da string
          const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
          const segments = Array.from(segmenter.segment(rawRef.current || ''));
          let codeUnitPos = 0;
          for (let i = 0; i < Math.min(cursorOffset || 0, segments.length); i++) {
            codeUnitPos += segments[i].segment.length;
          }
          inputRef.current.setSelectionRange(codeUnitPos, codeUnitPos);
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [focusedField, isSelected, cursorOffset]);
  
  const parsed = useMemo(() => {
    const lines = useCnabStore.getState().rawLines;
    return cnabEngine.parseLine(raw, { activeRules, rawLines: lines, index });
  }, [raw, activeRules, index]);

  const schema = useMemo(() => {
    const lines = useCnabStore.getState().rawLines;
    const s = cnabEngine.getSchema(raw, lines, index);
    if (s) return s;
    return {
      label: "Registro Desconhecido",
      fields: [
        { name: "raw_data", start: 1, end: Math.max(raw.length, 240), type: "A", label: "Dados Brutos" }
      ]
    };
  }, [raw, index]);

  const lastFieldEnd = useMemo(() => {
    const fields = schema.fields;
    return fields.length > 0 ? fields[fields.length - 1].end : 0;
  }, [schema]);

  const commitChange = useCallback((valueToCommit) => {
    const val = valueToCommit !== undefined ? valueToCommit : localVal;
    if (val === null) return;
    
    const fields = schema.fields;
    const field = fields.find(f => f.name === focusedField);
    
    if (!field && focusedField !== '_extra') return;

    let fullLine = raw;
    let finalVal = val !== undefined ? val : (localVal || "");

    if (focusedField === '_extra') {
      fullLine = raw.substring(0, lastFieldEnd) + finalVal;
      lastCommittedValue.current = finalVal;
    } else {
      const charCount = field.end - field.start + 1;
      const paddedVal = finalVal.padEnd(charCount, ' ').substring(0, charCount);
      fullLine = raw.substring(0, field.start - 1) + paddedVal + raw.substring(field.end);
      lastCommittedValue.current = paddedVal;
    }
    
    if (fullLine !== raw) {
      updateLine(index, fullLine);
    }
  }, [focusedField, localVal, raw, schema.fields, lastFieldEnd, updateLine, index]);

  const cursorRef = useRef({ start: 0, end: 0 });

  const lastCommittedValue = useRef(null);

  // Sincroniza localVal se o raw mudar externamente (Undo/Redo)
  useEffect(() => {
    if (focusedField && isSelected && localVal !== null) {
      const field = schema.fields.find(f => f.name === focusedField);
      let externalVal = "";
      if (focusedField === '_extra') {
        externalVal = raw.substring(lastFieldEnd);
      } else if (field) {
        externalVal = raw.substring(field.start - 1, field.end);
      }

      // IMPORTANTE: Só sincronizamos se o valor no store for DIFERENTE do que nós mesmos enviamos.
      // Isso evita o loop de feedback que estava 'bugando' a escrita.
      if (externalVal !== localVal && externalVal !== lastCommittedValue.current) {
        setLocalVal(externalVal);
        lastCommittedValue.current = externalVal;
      }
    }
  }, [raw, focusedField, isSelected]);

  // Preserva a posição do cursor ao atualizar o valor local
  useEffect(() => {
    if (inputRef.current && focusedField && document.activeElement === inputRef.current) {
      try {
        inputRef.current.setSelectionRange(cursorRef.current.start, cursorRef.current.end);
      } catch (e) {
        // Ignora erros em tipos de input que não suportam seleção
      }
    }
  }, [localVal, focusedField]);

  // Limpa o estado local se a linha perder a seleção
  useEffect(() => {
    if (!isSelected) {
      setLocalVal(null);
    }
  }, [isSelected]);

  const handleFieldClick = useCallback((e, fieldName, currentVal) => {
    e.stopPropagation();
    
    // Se já estivermos editando ESTE campo, não fazemos nada (deixamos o handleCursorMove agir)
    if (isSelected && focusedField === fieldName && localVal !== null) {
      return;
    }

    onSelect(index);
    
    let charElement = e.target.closest('.cnab-char');
    
    // Fallback: se não clicou diretamente no caractere (ex: clicou no padding do campo), 
    // procura qual filho está sob a coordenada X do mouse
    if (!charElement) {
      const children = Array.from(e.currentTarget.querySelectorAll('.cnab-char'));
      charElement = children.find(child => {
        const r = child.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right;
      }) || children[children.length - 1];
    }

    if (!charElement) return;

    const allChars = Array.from(e.currentTarget.querySelectorAll('.cnab-char'));
    const clickOffset = allChars.indexOf(charElement);
    
    if (focusedField && localVal !== null) {
      commitChange();
    }
    
    focusFieldAction(index, fieldName, clickOffset);
    setLocalVal(currentVal);
  }, [index, onSelect, focusFieldAction, focusedField, localVal, commitChange]);

  const setCursorOffset = useCnabStore(state => state.setCursorOffset);
  
  const handleCursorMove = useCallback((e) => {
    e.stopPropagation(); // Evita que o clique no input suba para o container do campo
    const codeUnitPos = e.target.selectionStart;
    const text = e.target.value;
    
    // Converte code units (browser) para contagem de grafemas (StatusBar/CNAB)
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text));
    
    let graphemeCount = 0;
    let currentCodeUnit = 0;
    for (const segment of segments) {
      if (currentCodeUnit >= codeUnitPos) break;
      currentCodeUnit += segment.segment.length;
      graphemeCount++;
    }
    
    setCursorOffset(graphemeCount);
  }, [setCursorOffset]);

  const handleInputChange = useCallback((e) => {
    e.stopPropagation();
    const val = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    cursorRef.current = { start, end };
    setLocalVal(val);
    handleCursorMove(e);
  }, [handleCursorMove]);


  const handleKeyDown = useCallback((e, idx, fields) => {
    // Intercepta Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      commitChange();
      
      const isShift = e.shiftKey;
      let nextFieldName = null;
      let nextVal = "";

      if (!isShift) {
        if (idx < fields.length - 1) {
          const f = fields[idx + 1];
          nextFieldName = f.name;
          nextVal = raw.substring(f.start - 1, f.end);
        } else if (focusedField !== '_extra') {
          nextFieldName = '_extra';
          nextVal = raw.substring(lastFieldEnd);
        }
      } else {
        if (focusedField === '_extra') {
          const f = fields[fields.length - 1];
          nextFieldName = f.name;
          nextVal = raw.substring(f.start - 1, f.end);
        } else if (idx > 0) {
          const f = fields[idx - 1];
          nextFieldName = f.name;
          nextVal = raw.substring(f.start - 1, f.end);
        }
      }

      if (nextFieldName) {
        focusFieldAction(index, nextFieldName);
        setLocalVal(nextVal);
      }
    }
    if (e.key === 'Enter') {
      commitChange();
      focusFieldAction(index, null);
      setLocalVal(null);
    }
    if (e.key === 'Escape') {
      focusFieldAction(index, null);
      setLocalVal(null);
    }
  }, [commitChange, focusedField, lastFieldEnd, raw, index, focusFieldAction]);

  const renderTextWithHighlights = (text) => {
    if (!text) return null;
    
    // Usa Intl.Segmenter para lidar corretamente com emojis complexos (corações, bandeiras, etc)
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text)).map(s => s.segment);

    return segments.map((char, i) => {
      const isCursor = isSelected && fieldName === focusedField && i === cursorOffset;
      return (
        <span 
          key={i} 
          className={`cnab-char ${char === ' ' ? 'opacity-20' : ''} ${isCursor ? 'bg-blue-500 text-white ring-1 ring-blue-400 z-10' : ''}`}
        >
          {char === ' ' && showWhitespace ? '·' : (char === ' ' ? '\u00A0' : char)}
        </span>
      );
    });
  };

  const getBgColor = (type) => {
    if (type === 'N') return 'text-blue-400/90';
    if (type === 'A') return 'text-emerald-400/90';
    return 'text-slate-300';
  };

  const errors = parsed._metadata?.errors || {};

  const renderFields = () => {
    const fields = schema.fields;
    
    const renderedFields = fields.map((field, idx) => {
      const isFocused = isSelected && focusedField === field.name;
      const val = raw.substring(field.start - 1, field.end);
      const isReserved = field.name.includes('uso_exclusivo') || field.name === 'filler';
      const hasError = errors[field.name];
      const charCount = field.end - field.start + 1;
      
      const rule = CNAB_RULES[field.rule || field.ruleId];
      const options = field.options || rule?.options;
      const optionsText = options ? `\n\nValores Válidos:\n${options.map(o => `• ${o.value}: ${o.label}`).join('\n')}` : '';

      const isDynamic = field.isDynamic;

      return (
        <div
          key={`${field.name}-${idx}`}
          onClick={(e) => handleFieldClick(e, field.name, val)}
          style={{ 
            width: `${charCount}ch`, 
            fontSize: '14px',
            boxShadow: isContinuous ? 'none' : 'inset -1px 0 0 0 rgba(100, 116, 139, 0.3)'
          }}
          className={`
            relative flex-shrink-0 font-cnab transition-all h-7 flex items-center overflow-hidden cursor-text
            ${isFocused ? 'bg-blue-600/40 z-20 ring-2 ring-blue-400 shadow-xl' : 'hover:bg-slate-700/30'}
            ${isReserved ? 'bg-slate-800/20' : ''}
            ${hasError && !isFocused ? 'bg-red-500/20 ring-1 ring-red-500/50 animate-pulse' : ''}
            ${isDynamic ? 'bg-indigo-500/10 border-x border-dashed border-indigo-500/30' : ''}
          `}
          title={`${isDynamic ? '[CAMPO DINÂMICO] ' : ''}${field.label} (${field.start}-${field.end})${rule?.desc ? '\n' + rule.desc : ''}${optionsText}${hasError ? '\n\nERRO: ' + hasError : ''}`}
        >
          {isFocused ? (
            <div className="relative w-full h-full overflow-hidden">
              {/* Mirror Div: Mostra o texto com espaços visíveis por baixo do input */}
              <div 
                className="absolute inset-0 flex items-center justify-start whitespace-pre leading-none pointer-events-none select-none"
                style={{ fontSize: '14px', letterSpacing: '0px' }}
              >
                {renderTextWithHighlights((localVal !== null ? localVal : val).padEnd(charCount, ' '))}
              </div>
              
              <input
                ref={inputRef}
                className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-left font-cnab p-0 m-0 z-30"
                style={{ 
                  fontSize: '14px', 
                  letterSpacing: '0px',
                  color: 'transparent',
                  caretColor: 'white',
                  appearance: 'none',
                  paddingLeft: '0px',
                  paddingRight: '0px'
                }}
                autoComplete="off"
                spellCheck="false"
                maxLength={charCount}
                value={localVal !== null ? localVal : val}
                onChange={handleInputChange}
                onClick={handleCursorMove}
                onKeyUp={handleCursorMove}
                onBlur={() => {
                  commitChange();
                  setLocalVal(null);
                  focusFieldAction(index, null);
                }}
                onKeyDown={(e) => handleKeyDown(e, idx, fields)}
              />

              {/* Suggestions Popover */}
              {options && options.length > 0 && (
                <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl z-50 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sugestões de Valores</span>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        useCnabStore.getState().openDoc(field.rule || field.ruleId);
                      }}
                      className="p-1 hover:bg-blue-500/10 rounded text-blue-400/60 hover:text-blue-400 transition-colors"
                      title="Ver no Manual"
                    >
                      <BookOpen className="w-3 h-3" />
                    </button>
                  </div>
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Evita perder o foco do input
                        setLocalVal(opt.value);
                        // Força o commit imediato ou deixa para o blur
                      }}
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
              <div 
                className={`w-full flex items-center justify-start whitespace-pre leading-none pointer-events-none h-full ${getBgColor(field.type)}`}
              >
                {renderTextWithHighlights(val)}
              </div>
              {hasError && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></span>}
            </>
          )}
        </div>
      );
    });

    const extraVal = raw.substring(lastFieldEnd);
    const isFocused = isSelected && focusedField === '_extra';
    const hasExcess = raw.length > 240;
    
    renderedFields.push(
      <div
        key="extra-territory"
        onClick={(e) => handleFieldClick(e, '_extra', extraVal)}
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
            {/* Mirror Div: Extra Zone */}
            <div 
              className="absolute inset-0 flex items-center justify-start whitespace-pre leading-none pointer-events-none select-none text-[14px]"
              style={{ letterSpacing: '0px' }}
            >
              {renderTextWithHighlights(localVal !== null ? localVal : extraVal)}
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
              onChange={handleInputChange}
              onClick={handleCursorMove}
              onKeyUp={handleCursorMove}
              onBlur={() => {
                commitChange();
                setLocalVal(null);
                focusFieldAction(index, null);
              }}
              onKeyDown={(e) => handleKeyDown(e, fields.length, fields)}
              placeholder="Extras..."
            />
          </div>
        ) : (
          <div className="w-full flex items-center justify-start whitespace-pre leading-none pointer-events-none text-[10px] font-black uppercase tracking-tighter opacity-70 h-full">
            {extraVal.length > 0 ? renderTextWithHighlights(extraVal) : '+ EXTRA'}
          </div>
        )}
      </div>
    );

    return renderedFields;
  };

  const isWrongLength = raw.length !== 240;

  return (
    <div 
      className={`group flex items-center h-8 transition-colors border-b border-slate-800/30 ${isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-800/30'}`}
      onClick={() => onSelect(index)}
    >
      <span className="w-12 text-slate-500 text-[10px] font-mono flex-shrink-0 select-none opacity-40 group-hover:opacity-100 flex items-center justify-center border-r border-slate-800/50 h-full bg-slate-900/20">
        {String(index + 1).padStart(5, '0')}
      </span>
      <div className="flex items-center gap-0 overflow-x-visible h-full flex-1">
        <div className="flex items-center gap-0 h-full">
          {renderFields()}
        </div>
        {isWrongLength && (
          <div className="flex-shrink-0 ml-auto mr-4 px-2 py-0.5 bg-red-500/30 text-red-300 text-[9px] font-bold rounded border border-red-500/50 whitespace-nowrap">
            {raw.length} posições
          </div>
        )}
      </div>
    </div>
  );
};

export const CnabLine = memo(CnabLineComponent);
