import { create } from 'zustand';
import { cnabEngine } from '../utils/cnab/engine';

export const useCnabStore = create((set, get) => ({
  rawLines: [],
  fileName: '',
  selectedLineIndex: null,
  focusedField: null,
  cursorOffset: 0,
  history: [], 
  future: [],
  activeRules: {
    isNumeric: true,
    validateDate: true,
    validateInscricaoTipo: true,
    validateCNPJ_CPF: true,
    validateUF: true,
    validateCurrency: true,
  },
  visualSettings: {
    isContinuous: false,
    showLimitLine: true,
    isEditorCollapsed: false,
    isAuditCollapsed: false,
    autoExpandOnFocus: false,
    showWhitespace: true,
  },

  // Actions
  setRawLines: (lines, name) => {
    const filteredLines = Array.isArray(lines) ? lines.filter(l => typeof l === 'string') : [];
    set({ rawLines: filteredLines, fileName: name, selectedLineIndex: null, history: [], future: [] });
  },

  selectLine: (index) => set((state) => ({ 
    selectedLineIndex: index, 
    focusedField: null, 
    cursorOffset: 0,
    visualSettings: { 
      ...state.visualSettings, 
      isEditorCollapsed: state.visualSettings.autoExpandOnFocus ? false : state.visualSettings.isEditorCollapsed 
    }
  })),

  setFocusedField: (fieldName, offset = 0) => set((state) => ({ 
    focusedField: fieldName, 
    cursorOffset: offset,
    visualSettings: { 
      ...state.visualSettings, 
      isEditorCollapsed: state.visualSettings.autoExpandOnFocus ? false : state.visualSettings.isEditorCollapsed 
    }
  })),
  
  // updateLine ultra-rápida (não salva histórico se silent=true)
  updateLine: (index, newData, silent = false) => set((state) => {
    if (index < 0 || index >= state.rawLines.length) return state;
    
    const oldLine = state.rawLines[index] || "";
    let newLine = typeof newData === 'string' ? newData : cnabEngine.generateLine(newData, cnabEngine.getSchema(oldLine));
    
    if (newLine === oldLine) return state;

    const newLines = [...state.rawLines];
    newLines[index] = newLine;

    // Histórico Delta: Muito mais leve que clonar o array todo
    let newHistory = state.history;
    if (!silent) {
      newHistory = [...state.history, { 
        type: 'line_edit', 
        index, 
        oldLine, 
        newLine,
        fileName: state.fileName 
      }].slice(-1000);
    }
    
    return { 
      rawLines: newLines, 
      history: newHistory,
      future: []
    };
  }),

  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    
    const lastChange = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    
    // Aplica o inverso da mudança
    const newLines = [...state.rawLines];
    if (lastChange.type === 'line_edit') {
      newLines[lastChange.index] = lastChange.oldLine;
    }
    
    return {
      rawLines: newLines,
      history: newHistory,
      future: [lastChange, ...state.future].slice(0, 500)
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    
    const nextChange = state.future[0];
    const newFuture = state.future.slice(1);
    
    const newLines = [...state.rawLines];
    if (nextChange.type === 'line_edit') {
      newLines[nextChange.index] = nextChange.newLine;
    }
    
    return {
      rawLines: newLines,
      future: newFuture,
      history: [...state.history, nextChange].slice(-1000)
    };
  }),

  toggleRule: (ruleId) => set((state) => ({
    activeRules: { ...state.activeRules, [ruleId]: !state.activeRules[ruleId] }
  })),

  addLine: (template = ' '.repeat(240)) => {
    const state = get();
    const insertIndex = state.selectedLineIndex !== null ? state.selectedLineIndex + 1 : state.rawLines.length;
    
    let lineToAdd = template;
    if (state.selectedLineIndex !== null) {
      const currentLine = state.rawLines[state.selectedLineIndex];
      const lote = cnabEngine.getLoteNumber(currentLine);
      lineToAdd = template.substring(0, 3) + lote + template.substring(7);
    }

    const newLines = [...state.rawLines];
    newLines.splice(insertIndex, 0, lineToAdd);
    
    set({
      rawLines: newLines,
      selectedLineIndex: insertIndex,
      history: [...state.history, { type: 'line_add', index: insertIndex, line: lineToAdd }].slice(-1000),
      future: []
    });
  },

  removeLine: (index) => {
    const state = get();
    const lineToRemove = state.rawLines[index];
    const newLines = state.rawLines.filter((_, i) => i !== index);
    
    set({
      rawLines: newLines,
      selectedLineIndex: null,
      history: [...state.history, { type: 'line_remove', index, line: lineToRemove }].slice(-1000),
      future: []
    });
  },

  toggleVisualSetting: (key) => set((state) => ({
    visualSettings: { ...state.visualSettings, [key]: !state.visualSettings[key] }
  })),

  exportToRem: () => {
    const { rawLines, fileName } = get();
    const content = rawLines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'arquivo.rem';
    a.click();
    URL.revokeObjectURL(url);
  }
}));
