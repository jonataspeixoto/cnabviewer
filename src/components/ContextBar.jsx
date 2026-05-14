import React from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { ChevronRight, FileCode, Box, Layers, MousePointer2, Plus, Trash2, BookOpen } from 'lucide-react';

export const ContextBar = () => {
  const rawLines = useCnabStore(state => state.rawLines);
  const selectedLineIndex = useCnabStore(state => state.selectedLineIndex);
  const focusedField = useCnabStore(state => state.focusedField);
  const jumpToLine = useCnabStore(state => state.jumpToLine);
  const openDoc = useCnabStore(state => state.openDoc);
  const addLine = useCnabStore(state => state.addLine);
  const removeLine = useCnabStore(state => state.removeLine);

  if (selectedLineIndex === null) {
    return (
      <div className="h-10 bg-slate-900/80 border-b border-slate-800 flex items-center px-6 gap-4 text-slate-500 text-[11px] font-medium backdrop-blur-sm sticky top-0 z-20">
        <MousePointer2 className="w-3.5 h-3.5 opacity-50" />
        <span>Selecione um campo para ver a estrutura detalhada</span>
      </div>
    );
  }

  const line = rawLines[selectedLineIndex];
  if (!line) return null;
  
  const schema = cnabEngine.getSchema(line);
  const lote = cnabEngine.getLoteNumber(line);
  const field = schema?.fields?.find(f => f.name === focusedField);

  const handleJumpToFileHeader = () => jumpToLine(0);
  const handleJumpToLoteHeader = () => {
    const targetLote = cnabEngine.getLoteNumber(line);
    for (let i = selectedLineIndex; i >= 0; i--) {
      const l = rawLines[i];
      if (cnabEngine.getLoteNumber(l) === targetLote && l.substring(7, 8) === '1') {
        jumpToLine(i);
        break;
      }
    }
  };

  return (
    <div className="h-12 bg-slate-900/90 border-b border-slate-800 flex items-center px-6 gap-2 text-[11px] font-medium backdrop-blur-md sticky top-0 z-20 overflow-x-auto no-scrollbar shadow-lg">
      <button 
        onClick={handleJumpToFileHeader}
        className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors whitespace-nowrap group"
      >
        <FileCode className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
        <span>Arquivo</span>
      </button>
      
      <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
      
      <button 
        onClick={handleJumpToLoteHeader}
        className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors whitespace-nowrap group"
      >
        <Box className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>Lote {lote}</span>
      </button>

      <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

      <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
        <button 
          onClick={() => useCnabStore.getState().openDoc(null, schema?.label)}
          className="flex items-center gap-1.5 text-white hover:text-blue-400 transition-colors whitespace-nowrap group"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold">{schema?.label || 'Segmento Desconhecido'}</span>
        </button>
        <div className="w-[1px] h-3 bg-slate-700 mx-1" />
        <button 
          onClick={() => openDoc(null, schema?.label)}
          className="flex items-center gap-1.5 text-blue-400/80 hover:text-blue-400 transition-colors text-[9px] font-bold uppercase tracking-tighter bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10"
          title={`Ver Manual: ${schema?.label}`}
        >
          <BookOpen className="w-2.5 h-2.5" />
          MANUAL: {schema?.label}
        </button>
      </div>

      {field && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 whitespace-nowrap">
            <span className="text-blue-400 font-bold uppercase tracking-wider">{field.label}</span>
            <div className="flex items-center gap-2 border-l border-blue-500/30 pl-2 ml-1 text-[10px]">
              <span className="text-slate-400">TAM: <b className="text-slate-200">{field.end - field.start + 1}</b></span>
              <span className="text-slate-400">TIPO: <b className="text-slate-200">{field.type === 'N' ? 'NUMÉRICO' : 'ALFANUMÉRICO'}</b></span>
              <button 
                className="flex items-center gap-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 transition-all bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30 ml-1 font-bold text-[9px] uppercase tracking-tighter cursor-pointer"
                title={`Ver Manual: ${field.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const rid = field.ruleId || field.rule;
                  console.log(`[ContextBar] Clicking field manual: label=${field.label}, ruleId=${rid}`);
                  openDoc(rid);
                }}
              >
                <BookOpen className="w-3 h-3" />
                MANUAL: {field.label}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button 
          onClick={() => addLine()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase">Novo Registro</span>
        </button>
        <button 
          onClick={() => removeLine(selectedLineIndex)}
          className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700"
          title="Remover Registro Selecionado"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
