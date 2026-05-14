import React, { useState, useEffect, useRef } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { Save, X, Info, AlertCircle, Minimize2, BookOpen } from 'lucide-react';
import { CNAB_RULES } from '../utils/cnab/rules';
import { SuggestionField } from './SuggestionField';

export const EditorPanel = ({ onMinimize }) => {
  const rawLines = useCnabStore(state => state.rawLines);
  const selectedLineIndex = useCnabStore(state => state.selectedLineIndex);
  const selectLine = useCnabStore(state => state.selectLine);
  const updateLine = useCnabStore(state => state.updateLine);
  const activeRules = useCnabStore(state => state.activeRules);
  const focusedField = useCnabStore(state => state.focusedField);
  const setFocusedField = useCnabStore(state => state.setFocusedField);

  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState(null);
  const inputRefs = useRef({});

  useEffect(() => {
    if (selectedLineIndex !== null) {
      const line = rawLines[selectedLineIndex];
      if (!line) return;
      
      // Só recarrega se for uma linha diferente ou se houver mudança externa significativa
      if (line !== formData._raw) {
        const s = cnabEngine.getSchema(line);
        const parsed = cnabEngine.parseLine(line, { activeRules, rawLines, index: selectedLineIndex });
        setSchema(s);
        setFormData(parsed);
      }
    } else {
      setSchema(null);
      setFormData({});
    }
  }, [selectedLineIndex, rawLines[selectedLineIndex], activeRules]);

  useEffect(() => {
    if (focusedField && inputRefs.current[focusedField]) {
      const input = inputRefs.current[focusedField];
      const timer = setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [focusedField, schema]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRawLineChange = (value) => {
    const parsed = cnabEngine.parseLine(value, { activeRules, rawLines, index: selectedLineIndex });
    setFormData({ ...parsed, _raw: value });
  };

  const setCursorOffset = useCnabStore(state => state.setCursorOffset);

  const handleCursorMove = (e) => {
    const codeUnitPos = e.target.selectionStart;
    const text = e.target.value || "";
    
    // Converte para grafemas para a StatusBar
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
  };

  const handleSave = () => {
    updateLine(selectedLineIndex, formData);
  };

  const errors = formData._metadata?.errors || {};
  const errorCount = Object.keys(errors).length;

  return (
    <div className="w-full h-full bg-slate-900/50 flex flex-col overflow-hidden" data-editor-panel="true">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {selectedLineIndex !== null ? (schema ? schema.label : 'Segmento Desconhecido') : 'Painel de Edição'}
          </h2>
          {selectedLineIndex !== null && (
            <p className="text-[10px] text-slate-500 font-mono">LINHA {String(selectedLineIndex + 1).padStart(5, '0')}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onMinimize}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => selectLine(null)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedLineIndex === null ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative text-slate-500">
                <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium text-slate-400">Nenhum registro selecionado</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">Selecione uma linha no explorador para editar seus campos individualmente.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Edição Raw (Linha Completa)</label>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${(formData._raw ?? rawLines[selectedLineIndex] ?? "").length === 240 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {(formData._raw ?? rawLines[selectedLineIndex] ?? "").length}/240
                </span>
              </div>
              <textarea 
                value={formData._raw ?? rawLines[selectedLineIndex]}
                onFocus={(e) => {
                  setFocusedField(null);
                  handleCursorMove(e);
                }}
                onChange={(e) => {
                  handleRawLineChange(e.target.value);
                  handleCursorMove(e);
                }}
                onClick={handleCursorMove}
                onKeyUp={handleCursorMove}
                className="w-full h-20 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {errorCount > 0 && (
              <div className="bg-red-900/10 border border-red-500/20 rounded-lg overflow-hidden">
                <div className="bg-red-500/10 px-3 py-2 flex items-center gap-2 border-b border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase">Inconsistências ({errorCount})</span>
                </div>
                <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(errors).map(([key, msg]) => (
                    <button 
                      key={key}
                      onClick={() => key !== '_line' && setFocusedField(key)}
                      className="w-full text-left p-1.5 hover:bg-red-500/5 rounded transition-colors group flex items-start gap-2"
                    >
                      <span className="text-[10px] font-bold text-red-500/60 mt-0.5 uppercase flex-shrink-0">
                        {key === '_line' ? 'Tamanho' : key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-[11px] text-red-300 leading-tight">{msg}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Campos Estruturados</h3>
              {schema ? schema.fields.map((field) => {
                const hasError = errors[field.name];
                const isFocused = focusedField === field.name;
                const isReserved = field.name.includes('uso_exclusivo') || field.name === 'filler';
                const rule = CNAB_RULES[field.rule || field.ruleId];
                const options = field.options || rule?.options;

                return (
                  <div key={field.name} className={`group space-y-1.5 p-2 rounded-lg transition-all ${isFocused ? 'bg-blue-500/5' : 'hover:bg-slate-800/30'} ${isReserved ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${isFocused ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                        {field.label}
                        {rule?.id && (
                          <span className="bg-slate-800 text-slate-500 px-1 rounded-[2px] font-mono text-[8px]">{rule.id}</span>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-mono text-[9px]">{field.start}-{field.end}</span>
                        {field.ruleId && (
                          <button 
                            onClick={() => useCnabStore.getState().openDoc(field.ruleId)}
                            className="text-slate-600 hover:text-blue-400 transition-colors"
                            title="Ver documentação"
                          >
                            <BookOpen className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isFocused && rule?.desc && (
                      <div className="bg-blue-500/10 border-l-2 border-blue-500/50 p-2 rounded-r animate-in fade-in slide-in-from-left-1 duration-200">
                        <p className="text-[10px] text-blue-200/80 leading-snug">{rule.desc}</p>
                      </div>
                    )}

                    {options && options.length > 0 ? (
                      <SuggestionField
                        options={options}
                        value={formData[field.name] || ''}
                        onChange={(val) => handleChange(field.name, val)}
                        onFocus={() => {
                          setFocusedField(field.name);
                        }}
                        onBlur={handleSave}
                        error={hasError}
                        isFocused={isFocused}
                      />
                    ) : (
                      <input 
                        ref={el => inputRefs.current[field.name] = el}
                        type="text"
                        value={formData[field.name] || ''}
                        onFocus={() => {
                          setFocusedField(field.name);
                        }}
                        onBlur={handleSave}
                        onChange={(e) => {
                          handleChange(field.name, e.target.value);
                          handleCursorMove(e);
                        }}
                        onClick={handleCursorMove}
                        onKeyUp={handleCursorMove}
                        className={`w-full bg-slate-900 border ${isFocused ? 'border-blue-500 ring-1 ring-blue-500/20' : hasError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono`}
                      />
                    )}
                  </div>
                );
              }) : (
                <p className="text-xs text-slate-500 italic">Estrutura não identificada para esta linha.</p>
              )}

              {(formData._raw || rawLines[selectedLineIndex] || "").length > (schema?.fields[schema?.fields.length - 1]?.end || 0) && (
                <div className="space-y-1 pt-4 border-t border-red-500/20">
                  <label className={`text-[10px] font-bold uppercase flex items-center justify-between ${focusedField === '_extra' ? 'text-red-400' : 'text-red-500/50'}`}>
                    <span>Território Inválido (Excesso)</span>
                    <AlertCircle className="w-3 h-3" />
                  </label>
                  <input 
                    type="text"
                    value={(formData._raw || rawLines[selectedLineIndex] || "").substring(schema?.fields[schema?.fields.length - 1]?.end || 0)}
                    onFocus={() => setFocusedField('_extra')}
                    onChange={(e) => {
                      const prefix = (formData._raw || rawLines[selectedLineIndex] || "").substring(0, schema?.fields[schema?.fields.length - 1]?.end || 0);
                      handleRawLineChange(prefix + e.target.value);
                    }}
                    className={`w-full bg-red-500/5 border ${focusedField === '_extra' ? 'border-red-500 ring-1 ring-red-500/20' : 'border-red-500/20'} rounded px-3 py-1.5 text-xs text-red-300 outline-none transition-all font-mono`}
                  />
                  <p className="text-[9px] text-red-500/60 italic">Estes caracteres excedem o limite de 240 posições.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};
