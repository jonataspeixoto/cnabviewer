import React from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { ChevronRight, FileCode, Box, Layers, MousePointer2, ExternalLink, Plus, Trash2 } from 'lucide-react';

export const ContextBar = () => {
  const { rawLines, selectedLineIndex, focusedField, activeRules } = useCnabStore();

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

  return (
    <div className="h-12 bg-slate-900/90 border-b border-slate-800 flex items-center px-6 gap-2 text-[11px] font-medium backdrop-blur-md sticky top-0 z-20 overflow-x-auto no-scrollbar shadow-lg">
      <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
        <FileCode className="w-3.5 h-3.5 text-blue-400" />
        <span>Arquivo</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
      
      <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
        <Box className="w-3.5 h-3.5 text-emerald-400" />
        <span>Lote {lote}</span>
      </div>

      <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />

      <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span>{schema?.label || 'Segmento Desconhecido'}</span>
      </div>

      {field && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 whitespace-nowrap">
            <span className="text-blue-400 font-bold uppercase tracking-wider">{field.label}</span>
            <div className="flex items-center gap-2 border-l border-blue-500/30 pl-2 ml-1 text-[10px]">
              <span className="text-slate-400">TAM: <b className="text-slate-200">{field.end - field.start + 1}</b></span>
              <span className="text-slate-400">TIPO: <b className="text-slate-200">{field.type === 'N' ? 'NUMÉRICO' : 'ALFANUMÉRICO'}</b></span>
              <a 
                href="#" 
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Ver Documentação FEBRABAN"
                onClick={(e) => e.preventDefault()}
              >
                <ExternalLink className="w-3 h-3" />
                DOC
              </a>
            </div>
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button 
          onClick={() => useCnabStore.getState().addLine()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase">Novo Registro</span>
        </button>
        <button 
          onClick={() => useCnabStore.getState().removeLine(selectedLineIndex)}
          className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700"
          title="Remover Registro Selecionado"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
