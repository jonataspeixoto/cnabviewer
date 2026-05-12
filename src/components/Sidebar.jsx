import React from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { Settings, Download, FileJson, CheckCircle2, AlertTriangle, Undo2, Redo2 } from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeRules, 
    toggleRule, 
    exportToRem, 
    exportToJson, 
    rawLines,
    fileName,
    undo,
    redo,
    history,
    future
  } = useCnabStore();

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const rulesList = [
    { id: 'isNumeric', label: 'Validar Numéricos' },
    { id: 'validateDate', label: 'Validar Datas' },
    { id: 'validateInscricaoTipo', label: 'Tipo Inscrição (1/2)' },
    { id: 'validateCNPJ_CPF', label: 'Tamanho CPF/CNPJ' },
    { id: 'validateUF', label: 'UF Válida' },
  ];

  return (
    <aside className="w-80 h-full glass border-r border-slate-700 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
        <h1 className="text-xl font-bold tracking-tight">CNAB Viewer</h1>
      </div>

      <div className="space-y-8 flex-1">
        {/* File Info */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Arquivo Atual</h3>
          {rawLines.length > 0 ? (
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm font-medium truncate mb-1">{fileName}</p>
              <p className="text-xs text-slate-500">{rawLines.length} registros</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Nenhum arquivo carregado</p>
          )}
        </div>

        {/* Validation Rules */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regras de Validação</h3>
          </div>
          <div className="space-y-2">
            {rulesList.map((rule) => (
              <label 
                key={rule.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <span className="text-sm text-slate-300">{rule.label}</span>
                <input 
                  type="checkbox"
                  checked={activeRules[rule.id]}
                  onChange={() => toggleRule(rule.id)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* History Actions */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Histórico</h3>
          <div className="flex gap-2">
            <button 
              onClick={undo}
              disabled={history.length === 0}
              title="Desfazer (Ctrl+Z)"
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Desfazer</span>
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              title="Refazer (Ctrl+Y)"
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <Redo2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Refazer</span>
            </button>
          </div>
        </div>

        {/* Export Actions */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Exportar</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={exportToRem}
              disabled={rawLines.length === 0}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Remessa</span>
            </button>
            <button 
              onClick={exportToJson}
              disabled={rawLines.length === 0}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileJson className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">JSON</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-700">
        <p className="text-[10px] text-slate-500 text-center">
          Versão 1.0.0 • Client-Side Only
        </p>
      </div>
    </aside>
  );
};
