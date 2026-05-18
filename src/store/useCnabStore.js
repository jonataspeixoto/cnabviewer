import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cnabEngine } from '../utils/cnab/engine';
import { CNAB_RULES } from '../utils/cnab/rules';
import { CNAB_SCHEMAS } from '../utils/cnab/schemas';

export const useCnabStore = create(
  persist(
    (set, get) => ({
      rawLines: [],
      fileName: '',
      selectedLineIndex: null,
      focusedField: null,
      cursorOffset: 0,
      lastJump: 0,
      auditErrors: [], // Lista flat para o painel
      auditErrorsByLine: {}, // Mapa indexado por linha para performance
      history: [], 
      future: [],
      
      activeRules: {}, // Inicialmente vazio, o motor assume true se não houver entrada explícita false

      disabledFields: [], // Armazena IDs de campos (ex: "header_arquivo:codigo_banco")

      visualSettings: {
        isContinuous: false,
        showLimitLine: true,
        isEditorCollapsed: false,
        isAuditCollapsed: false,
        autoExpandOnFocus: false,
        showWhitespace: true,
      },

      // Documentação
      isDocOpen: false,
      focusedRule: null,
      focusedSection: null,

      // Actions
      openDoc: (ruleId = null, section = null) => set({ isDocOpen: true, focusedRule: ruleId, focusedSection: section }),
      closeDoc: () => set({ isDocOpen: false, focusedRule: null, focusedSection: null }),

      setRawLines: (lines, name) => {
        const filteredLines = Array.isArray(lines) ? lines.filter(l => typeof l === 'string') : [];
        set({ rawLines: filteredLines, fileName: name, selectedLineIndex: null, history: [], future: [] });
      },

      selectLine: (index) => {
        set((state) => ({ 
          selectedLineIndex: index, 
          focusedField: null, 
          cursorOffset: 0,
          visualSettings: { 
            ...state.visualSettings, 
            isEditorCollapsed: state.visualSettings.autoExpandOnFocus ? false : state.visualSettings.isEditorCollapsed 
          }
        }));
      },

      setFocusedField: (fieldName, offset = 0) => set((state) => ({ 
        focusedField: fieldName, 
        cursorOffset: offset,
        visualSettings: { 
          ...state.visualSettings, 
          isEditorCollapsed: state.visualSettings.autoExpandOnFocus ? false : state.visualSettings.isEditorCollapsed 
        }
      })),

      setCursorOffset: (offset) => set({ cursorOffset: offset }),

      setAuditErrors: (errors, errorsByLine = {}) => set({ 
        auditErrors: errors,
        auditErrorsByLine: errorsByLine
      }),

      focusField: (lineIndex, fieldName, offset = 0) => set((state) => {
        const needsExpand = state.visualSettings.autoExpandOnFocus && state.visualSettings.isEditorCollapsed;
        return {
          selectedLineIndex: lineIndex,
          focusedField: fieldName,
          cursorOffset: offset,
          visualSettings: needsExpand ? { 
            ...state.visualSettings, 
            isEditorCollapsed: false 
          } : state.visualSettings
        };
      }),

      jumpToLine: (lineIndex, fieldName = null, offset = 0) => set((state) => {
        const needsExpand = state.visualSettings.autoExpandOnFocus && state.visualSettings.isEditorCollapsed;
        return {
          selectedLineIndex: lineIndex,
          focusedField: fieldName,
          cursorOffset: offset,
          lastJump: Date.now(),
          visualSettings: needsExpand ? { 
            ...state.visualSettings, 
            isEditorCollapsed: false 
          } : state.visualSettings
        };
      }),
      
      updateLine: (index, newData, silent = false) => set((state) => {
        if (index < 0 || index >= state.rawLines.length) return state;
        
        const oldLine = state.rawLines[index] || "";
        let newLine = typeof newData === 'string' ? newData : cnabEngine.generateLine(newData, cnabEngine.getSchema(oldLine));
        
        if (newLine === oldLine) return state;

        const newLines = [...state.rawLines];
        newLines[index] = newLine;

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

      setBulkRules: (active) => set((state) => {
        const ruleIds = Object.keys(CNAB_RULES);
        const newRules = { ...state.activeRules };
        ruleIds.forEach(id => {
          newRules[id] = active;
        });
        return { activeRules: newRules };
      }),

      toggleFieldValidation: (fieldId) => set((state) => {
        const disabled = state.disabledFields.includes(fieldId);
        return {
          disabledFields: disabled 
            ? state.disabledFields.filter(id => id !== fieldId)
            : [...state.disabledFields, fieldId]
        };
      }),

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
        const content = rawLines.join('\r\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Melhora o nome do arquivo se for um UUID ou vazio
        let name = fileName || 'arquivo';
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name.replace(/\.[^/.]+$/, ""));
        if (isUUID || !fileName) {
          name = `CNAB240_REMESSA_${new Date().toISOString().slice(0,10)}`;
        } else {
          name = name.replace(/\.[^/.]+$/, "");
        }

        a.download = `${name}.rem`;
        a.click();
        URL.revokeObjectURL(url);
      },

      exportToJson: () => {
        const { rawLines, fileName, activeRules } = get();
        // Processa todas as linhas para gerar o JSON estruturado
        const structuredData = rawLines.map((line, index) => {
          return cnabEngine.parseLine(line, { 
            activeRules, 
            rawLines, 
            index 
          });
        });

        const content = JSON.stringify(structuredData, null, 2);
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Melhora o nome do arquivo
        let name = fileName || 'arquivo';
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name.replace(/\.[^/.]+$/, ""));
        if (isUUID || !fileName) {
          name = `CNAB240_DATA_${new Date().toISOString().slice(0,10)}`;
        } else {
          name = name.replace(/\.[^/.]+$/, "");
        }

        a.download = `${name}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      resetProject: () => set({
        fileName: '',
        rawLines: [],
        selectedLineIndex: null,
        focusedField: null,
        cursorOffset: 0,
        history: [],
        future: []
      }),

      cleanupDisabledFields: () => set((state) => {
        const validFields = state.disabledFields.filter(fieldId => {
          const [schemaId, fieldName] = fieldId.split(':');
          if (!schemaId || !fieldName) return false;
          const schema = CNAB_SCHEMAS[schemaId];
          if (!schema) return false;
          return schema.fields.some(f => f.name === fieldName);
        });
        
        if (validFields.length !== state.disabledFields.length) {
          return { disabledFields: validFields };
        }
        return {};
      })
    }),
    {
      name: 'cnab-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        activeRules: state.activeRules, 
        disabledFields: state.disabledFields,
        visualSettings: state.visualSettings 
      }), // Apenas salva configurações, não os dados do arquivo
      onRehydrateStorage: () => (state, error) => {
        if (state && !error && typeof state.cleanupDisabledFields === 'function') {
          state.cleanupDisabledFields();
        }
      }
    }
  )
);
