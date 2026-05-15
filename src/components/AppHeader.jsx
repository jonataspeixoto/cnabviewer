import React from 'react';
import { Undo2, Redo2, Download, FileJson, X, BookOpen } from 'lucide-react';
import { useCnabStore } from '../store/useCnabStore';

export const AppHeader = ({ handleNewFile }) => {
  const fileName = useCnabStore(state => state.fileName);
  const historyLen = useCnabStore(state => state.history.length);
  const futureLen = useCnabStore(state => state.future.length);
  const linesCount = useCnabStore(state => state.rawLines.length);
  const openDoc = useCnabStore(state => state.openDoc);
  const undo = useCnabStore(state => state.undo);
  const redo = useCnabStore(state => state.redo);
  const exportToRem = useCnabStore(state => state.exportToRem);
  const exportToJson = useCnabStore(state => state.exportToJson);

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-30 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">C</div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">CNAB Viewer</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Processamento Local</span>
            </div>
          </div>
        </div>

        {fileName && (
          <div className="h-10 px-4 flex items-center border-l border-slate-800 gap-4">
            <div className="flex flex-col justify-center">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mb-0.5">Arquivo Atual</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300 truncate max-w-[240px]">{fileName}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-bold text-blue-400 border border-blue-500/20">{linesCount} REGISTROS</span>
              </div>
            </div>
            <button 
              onClick={handleNewFile}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
              title="Fechar arquivo e iniciar novo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => openDoc()}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 text-[10px] font-bold uppercase tracking-wider group"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          Manual
        </button>

        <div className="flex items-center bg-slate-950/50 p-1 rounded-lg border border-slate-800 mr-2">
          <button 
            onClick={() => undo()}
            disabled={historyLen === 0}
            title="Desfazer (Ctrl+Z)"
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-20 transition-all hover:text-blue-400"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800 mx-1" />
          <button 
            onClick={() => redo()}
            disabled={futureLen === 0}
            title="Refazer (Ctrl+Y)"
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-20 transition-all hover:text-blue-400"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => exportToRem()}
            disabled={linesCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-all shadow-lg shadow-blue-600/10 active:scale-95 text-[10px] font-bold uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            Remessa
          </button>
          <button 
            onClick={() => exportToJson()}
            disabled={linesCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-all border border-slate-700 active:scale-95 text-[10px] font-bold uppercase tracking-wider"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            JSON
          </button>
        </div>
      </div>
    </header>
  );
};
