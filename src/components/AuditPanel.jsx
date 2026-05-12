import React, { useMemo, useState, useEffect } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { AlertCircle, CheckCircle2, ChevronRight, XCircle, Search, Info } from 'lucide-react';

export const AuditPanel = ({ onMinimize }) => {
  const { rawLines, activeRules, selectLine, setFocusedField } = useCnabStore();
  const [errors, setErrors] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Processamento em Chunks para não travar a UI em arquivos gigantes
  useEffect(() => {
    setIsScanning(true);
    const result = [];
    let currentLine = 0;
    const CHUNK_SIZE = 500;
    
    const scanChunk = () => {
      const end = Math.min(currentLine + CHUNK_SIZE, rawLines.length);
      
      for (let i = currentLine; i < end; i++) {
        const parsed = cnabEngine.parseLine(rawLines[i], activeRules);
        const lineErrors = parsed._metadata?.errors || {};
        
        Object.entries(lineErrors).forEach(([field, message]) => {
          result.push({
            lineIndex: i,
            fieldName: field,
            message: message,
            type: field === '_line' ? 'critical' : 'validation'
          });
        });
      }

      currentLine = end;
      setProgress(Math.round((currentLine / rawLines.length) * 100));

      if (currentLine < rawLines.length) {
        requestAnimationFrame(scanChunk);
      } else {
        setErrors(result);
        setIsScanning(false);
      }
    };

    const timer = setTimeout(scanChunk, 800); // Debounce inicial
    return () => clearTimeout(timer);
  }, [rawLines, activeRules]);

  const allErrors = errors;
  const criticalCount = allErrors.filter(e => e.type === 'critical').length;
  const validationCount = allErrors.filter(e => e.type === 'validation').length;

  const handleJumpToError = (err) => {
    selectLine(err.lineIndex);
    if (err.fieldName !== '_line') {
      setFocusedField(err.fieldName);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Auditoria Global</h3>
        </div>
        <button 
          onClick={onMinimize}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
          title="Minimizar"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 bg-slate-950/30">
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="text-[10px] text-red-400/70 font-bold uppercase mb-1">Críticos</div>
          <div className="text-xl font-cnab text-red-400">{criticalCount}</div>
        </div>
        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
          <div className="text-[10px] text-orange-400/70 font-bold uppercase mb-1">Avisos</div>
          <div className="text-xl font-cnab text-orange-400">{validationCount}</div>
        </div>
      </div>

      {isScanning && (
        <div className="px-4 py-2 border-b border-slate-800 bg-blue-500/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-blue-400 font-bold uppercase animate-pulse">Escaneando Arquivo...</span>
            <span className="text-[9px] text-blue-400 font-mono">{progress}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
        {allErrors.length === 0 && !isScanning ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-medium">Nenhuma irregularidade encontrada</p>
          </div>
        ) : (
          allErrors.map((err, i) => (
            <button
              key={i}
              onClick={() => handleJumpToError(err)}
              className="w-full text-left p-2 rounded border border-transparent hover:border-slate-700 hover:bg-slate-800/50 group transition-all"
            >
              <div className="flex items-start gap-2">
                {err.type === 'critical' ? (
                  <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                      Linha {err.lineIndex + 1}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">
                      {err.fieldName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {err.message}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
