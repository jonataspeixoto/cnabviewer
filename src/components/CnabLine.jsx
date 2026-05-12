import React, { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { logger } from '../utils/logger';

const CnabLineComponent = ({ index, raw, isSelected, onSelect }) => {
  const { focusedField, setFocusedField, activeRules, visualSettings, updateLine } = useCnabStore();
  const [localVal, setLocalVal] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (focusedField && isSelected && inputRef.current) {
      // Pequeno timeout para garantir que o DOM estabilizou após o re-render da store
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // Seleciona o texto para facilitar a edição rápida
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [focusedField, isSelected]);
  
  const parsed = useMemo(() => cnabEngine.parseLine(raw, activeRules), [raw, activeRules]);

  const schema = useMemo(() => {
    const s = cnabEngine.getSchema(raw);
    if (s) return s;
    return {
      label: "Registro Desconhecido",
      fields: [
        { name: "raw_data", start: 1, end: Math.max(raw.length, 240), type: "A", label: "Dados Brutos" }
      ]
    };
  }, [raw]);

  const lastFieldEnd = useMemo(() => {
    const fields = schema.fields;
    return fields.length > 0 ? fields[fields.length - 1].end : 0;
  }, [schema]);

  const commitChange = useCallback((valueToCommit) => {
    const val = valueToCommit !== undefined ? valueToCommit : localVal;
    if (val === null) {
      logger.debug(`[CNAB-DEBUG] commitChange abortado: localVal é null na linha ${index + 1}`);
      return;
    }
    
    const fields = schema.fields;
    const field = fields.find(f => f.name === focusedField);
    
    if (!field && focusedField !== '_extra') {
      logger.debug(`[CNAB-DEBUG] commitChange abortado: campo '${focusedField}' não encontrado na linha ${index + 1}`);
      return;
    }

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
        logger.debug(`[CNAB-DEBUG] Sincronização externa detectada (Undo/Redo): "${localVal}" -> "${externalVal}"`);
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
    logger.debug(`[CNAB-DEBUG] Clique no campo '${fieldName}' da linha ${index + 1}. Valor atual: "${currentVal}"`);
    onSelect(index);
    
    if (focusedField && localVal !== null) {
      logger.debug(`[CNAB-DEBUG] Salvando campo anterior '${focusedField}' antes de mudar foco`);
      commitChange();
    }
    
    setFocusedField(fieldName);
    setLocalVal(currentVal);
  }, [index, onSelect, focusedField, localVal, commitChange, setFocusedField]);

  const commitTimer = useRef(null);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    cursorRef.current = { start, end };
    setLocalVal(val);
    
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      commitChange(val);
    }, 100);
  }, [commitChange]);

  const { undo, redo } = useCnabStore();

  const handleKeyDown = useCallback((e, idx, fields) => {
    // Intercepta Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (commitTimer.current) clearTimeout(commitTimer.current);
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
      logger.debug(`[CNAB-DEBUG] Tecla TAB pressionada no campo '${focusedField}'`);
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
        logger.debug(`[CNAB-DEBUG] TAB navegando para '${nextFieldName}'`);
        setFocusedField(nextFieldName);
        setLocalVal(nextVal);
      }
    }
    if (e.key === 'Enter') {
      logger.debug(`[CNAB-DEBUG] Tecla ENTER pressionada. Comitando campo '${focusedField}'`);
      commitChange();
      setFocusedField(null);
      setLocalVal(null);
    }
    if (e.key === 'Escape') {
      logger.debug(`[CNAB-DEBUG] Tecla ESCAPE pressionada. Cancelando edição no campo '${focusedField}'`);
      setFocusedField(null);
      setLocalVal(null);
    }
  }, [commitChange, focusedField, lastFieldEnd, raw, setFocusedField]);

  const renderTextWithHighlights = (text) => {
    if (!text) return null;
    return text.split('').map((char, i) => (
      <span key={i} className={`cnab-char ${char === ' ' ? 'opacity-20' : ''}`}>
        {char === ' ' && visualSettings.showWhitespace ? '·' : (char === ' ' ? '\u00A0' : char)}
      </span>
    ));
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

      return (
        <div
          key={`${field.name}-${idx}`}
          onClick={(e) => handleFieldClick(e, field.name, val)}
          style={{ 
            width: `${charCount}ch`, 
            fontSize: '14px',
            boxShadow: visualSettings.isContinuous ? 'none' : 'inset -1px 0 0 0 rgba(100, 116, 139, 0.3)'
          }}
          className={`
            relative flex-shrink-0 font-cnab transition-all h-7 flex items-center overflow-hidden cursor-text
            ${isFocused ? 'bg-blue-600/40 z-20 ring-2 ring-blue-400 shadow-xl' : 'hover:bg-slate-700/30'}
            ${isReserved ? 'bg-slate-800/20' : ''}
            ${hasError && !isFocused ? 'bg-red-500/20' : ''}
          `}
          title={`${field.label} (${field.start}-${field.end})${hasError ? ': ' + hasError : ''}`}
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
                onBlur={() => {
                  logger.debug(`[CNAB-DEBUG] Campo '${focusedField}' perdeu foco (Blur).`);
                  commitChange();
                  setLocalVal(null);
                  setFocusedField(null);
                }}
                onKeyDown={(e) => handleKeyDown(e, idx, fields)}
                onClick={(e) => e.stopPropagation()}
              />
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
          boxShadow: visualSettings.isContinuous ? 'none' : 'inset 1px 0 0 0 rgba(100, 116, 139, 0.3)'
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
              onBlur={() => {
                logger.debug(`[CNAB-DEBUG] Zona EXTRA perdeu foco (Blur).`);
                commitChange();
                setLocalVal(null);
                setFocusedField(null);
              }}
              onKeyDown={(e) => handleKeyDown(e, fields.length, fields)}
              onClick={(e) => e.stopPropagation()}
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
