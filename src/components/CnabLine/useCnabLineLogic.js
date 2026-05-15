import { useState, useCallback, useEffect, useRef } from 'react';
import { useCnabStore } from '../../store/useCnabStore';
import { cnabEngine } from '../../utils/cnab/engine';

export const useCnabLineLogic = (index, raw, isSelected, focusedField, cursorOffset, onSelect) => {
  const activeRules = useCnabStore(state => state.activeRules);
  const updateLine = useCnabStore(state => state.updateLine);
  const undo = useCnabStore(state => state.undo);
  const redo = useCnabStore(state => state.redo);
  const focusFieldAction = useCnabStore(state => state.focusField);
  const setCursorOffset = useCnabStore(state => state.setCursorOffset);

  const [localVal, setLocalVal] = useState(null);
  const inputRef = useRef(null);
  const rawRef = useRef(raw);
  const cursorRef = useRef({ start: 0, end: 0 });
  const lastCommittedValue = useRef(null);

  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  // Lógica de Foco e Cursor
  useEffect(() => {
    if (focusedField && isSelected && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          const isFocusInEditor = document.activeElement?.closest('[data-editor-panel="true"]');
          if (!isFocusInEditor) {
            inputRef.current.focus();
          }

          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) return;

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

  const parsed = useCnabStore.getState().rawLines; // Para o useMemo no componente principal

  const schema = cnabEngine.getSchema(raw, useCnabStore.getState().rawLines, index) || {
    label: "Registro Desconhecido",
    fields: [{ name: "raw_data", start: 1, end: Math.max(raw.length, 240), type: "A", label: "Dados Brutos" }]
  };

  const lastFieldEnd = schema.fields.length > 0 ? schema.fields[schema.fields.length - 1].end : 0;

  const commitChange = useCallback((valueToCommit) => {
    const val = valueToCommit !== undefined ? valueToCommit : localVal;
    if (val === null) return;

    const field = schema.fields.find(f => f.name === focusedField);
    if (!field && focusedField !== '_extra') return;

    let fullLine = raw;
    let finalVal = val;

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

  // Sincronização Undo/Redo
  useEffect(() => {
    if (focusedField && isSelected && localVal !== null) {
      const field = schema.fields.find(f => f.name === focusedField);
      let externalVal = "";
      if (focusedField === '_extra') {
        externalVal = raw.substring(lastFieldEnd);
      } else if (field) {
        externalVal = raw.substring(field.start - 1, field.end);
      }

      if (externalVal !== localVal && externalVal !== lastCommittedValue.current) {
        setLocalVal(externalVal);
        lastCommittedValue.current = externalVal;
      }
    }
  }, [raw, focusedField, isSelected, schema.fields, lastFieldEnd]);

  useEffect(() => {
    if (!isSelected) setLocalVal(null);
  }, [isSelected]);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    cursorRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
    setLocalVal(val);
    
    // Atualiza cursor no store
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(val));
    let graphemeCount = 0;
    let currentCodeUnit = 0;
    for (const segment of segments) {
      if (currentCodeUnit >= e.target.selectionStart) break;
      currentCodeUnit += segment.segment.length;
      graphemeCount++;
    }
    setCursorOffset(graphemeCount);
  }, [setCursorOffset]);

  const handleKeyDown = useCallback((e, fieldIdx, fields) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
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
        if (fieldIdx < fields.length - 1) {
          const f = fields[fieldIdx + 1];
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
        } else if (fieldIdx > 0) {
          const f = fields[fieldIdx - 1];
          nextFieldName = f.name;
          nextVal = raw.substring(f.start - 1, f.end);
        }
      }

      if (nextFieldName) {
        focusFieldAction(index, nextFieldName);
        setLocalVal(nextVal);
      }
    }

    if (e.key === 'Enter' || e.key === 'Escape') {
      commitChange();
      focusFieldAction(index, null);
      setLocalVal(null);
    }
  }, [commitChange, redo, undo, raw, index, focusedField, lastFieldEnd, focusFieldAction]);

  const handleFieldClick = useCallback((e, fieldName, currentVal) => {
    e.stopPropagation();
    if (isSelected && focusedField === fieldName && localVal !== null) return;

    onSelect(index);
    let charElement = e.target.closest('.cnab-char');
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

    if (focusedField && localVal !== null) commitChange();

    focusFieldAction(index, fieldName, clickOffset);
    setLocalVal(currentVal);
  }, [index, onSelect, focusedField, localVal, commitChange, focusFieldAction]);

  return {
    localVal,
    setLocalVal,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleFieldClick,
    commitChange,
    schema,
    lastFieldEnd
  };
};
