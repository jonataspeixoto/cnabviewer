import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { CNAB_RULES } from '../utils/cnab/rules';
import { CNAB_SCHEMAS } from '../utils/cnab/schemas';
import { AlertCircle, CheckCircle2, ChevronRight, XCircle, Settings, ClipboardList, Filter, Search, BookOpen } from 'lucide-react';
import AuditWorker from '../utils/cnab/audit.worker.js?worker';

export const AuditPanel = ({ onMinimize }) => {
  const rawLines = useCnabStore(state => state.rawLines);
  const activeRules = useCnabStore(state => state.activeRules);
  const disabledFields = useCnabStore(state => state.disabledFields);
  const toggleFieldValidation = useCnabStore(state => state.toggleFieldValidation);
  const toggleRule = useCnabStore(state => state.toggleRule);
  const jumpToLine = useCnabStore(state => state.jumpToLine);
  const setBulkRules = useCnabStore(state => state.setBulkRules);
  const auditErrors = useCnabStore(state => state.auditErrors);
  const setAuditErrors = useCnabStore(state => state.setAuditErrors);
  
  const currentWorker = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('diagnostico'); 
  const [ruleSearch, setRuleSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'critical', 'validation'

  // Filtra as regras baseada na busca
  const filteredRuleIds = useMemo(() => {
    const search = ruleSearch.toLowerCase();
    return Object.keys(CNAB_RULES).filter(id => {
      const rule = CNAB_RULES[id];
      return id.toLowerCase().includes(search) || 
             rule.label.toLowerCase().includes(search) || 
             (rule.desc && rule.desc.toLowerCase().includes(search));
    });
  }, [ruleSearch]);

  // Filtra os erros baseada no tipo selecionado
  const filteredErrors = useMemo(() => {
    if (filterType === 'all') return auditErrors;
    return auditErrors.filter(e => e.type === filterType);
  }, [auditErrors, filterType]);

  useEffect(() => {
    if (!rawLines || rawLines.length === 0) {
      setAuditErrors([]);
      setProgress(0);
      return;
    }

    const timer = setTimeout(() => {
      setIsScanning(true);
      const worker = new AuditWorker();

      worker.postMessage({
        rawLines,
        activeRules,
        disabledFields
      });

      worker.onmessage = (e) => {
        const { type, progress, errors: finalErrors, errorsByLine } = e.data;
        
        if (type === 'PROGRESS') {
          setProgress(progress);
        } else if (type === 'COMPLETE') {
          setAuditErrors(finalErrors, errorsByLine);
          setIsScanning(false);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        console.error("Worker Error:", err);
        setIsScanning(false);
        worker.terminate();
      };

      currentWorker.current = worker;
    }, 500);

    return () => {
      clearTimeout(timer);
      if (currentWorker.current) {
        currentWorker.current.terminate();
      }
    };
  }, [rawLines, activeRules, disabledFields]);

  const criticalCount = auditErrors.filter(e => e.type === 'critical').length;
  const validationCount = auditErrors.filter(e => e.type === 'validation').length;

  const handleJumpToError = (err) => {
    jumpToLine(err.lineIndex, err.fieldName !== '_line' ? err.fieldName : null);
  };

  const toggleFilter = (type) => {
    if (filterType === type) setFilterType('all');
    else setFilterType(type);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden border-l border-slate-800">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <button 
          onClick={() => setActiveTab('diagnostico')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all
            ${activeTab === 'diagnostico' ? 'text-blue-400 bg-blue-500/5 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Diagnóstico
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all
            ${activeTab === 'config' ? 'text-blue-400 bg-blue-500/5 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Regras
        </button>
        <button 
          onClick={onMinimize}
          className="px-3 hover:bg-slate-800 text-slate-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'diagnostico' ? (
          <>
            <div className="p-4 grid grid-cols-2 gap-2 bg-slate-950/30">
              <button 
                onClick={() => toggleFilter('critical')}
                className={`p-3 rounded-lg border transition-all text-left group
                  ${filterType === 'critical' ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/10' : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'}`}
              >
                <div className={`text-[9px] font-bold uppercase mb-1 transition-colors ${filterType === 'critical' ? 'text-red-300' : 'text-red-400/60'}`}>Críticos</div>
                <div className="flex items-center justify-between">
                  <div className={`text-xl font-cnab transition-colors ${filterType === 'critical' ? 'text-red-100' : 'text-red-400'}`}>{criticalCount}</div>
                  {filterType === 'critical' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                </div>
              </button>
              
              <button 
                onClick={() => toggleFilter('validation')}
                className={`p-3 rounded-lg border transition-all text-left group
                  ${filterType === 'validation' ? 'bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/10' : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40'}`}
              >
                <div className={`text-[9px] font-bold uppercase mb-1 transition-colors ${filterType === 'validation' ? 'text-orange-300' : 'text-orange-400/60'}`}>Validação</div>
                <div className="flex items-center justify-between">
                  <div className={`text-xl font-cnab transition-colors ${filterType === 'validation' ? 'text-orange-100' : 'text-orange-400'}`}>{validationCount}</div>
                  {filterType === 'validation' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
                </div>
              </button>
            </div>

            {isScanning && (
              <div className="px-4 py-2 border-b border-slate-800 bg-blue-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-blue-400 font-bold uppercase animate-pulse">Analisando...</span>
                  <span className="text-[9px] text-blue-400 font-mono">{progress}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
              {filteredErrors.length === 0 && !isScanning ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs font-medium">
                    {filterType === 'all' ? 'Arquivo em Conformidade' : `Sem erros de ${filterType === 'critical' ? 'Críticos' : 'Validação'}`}
                  </p>
                </div>
              ) : (
                filteredErrors.map((err, i) => (
                  <button
                    key={i}
                    onClick={() => handleJumpToError(err)}
                    className="w-full text-left p-2 rounded border border-transparent hover:border-slate-700 hover:bg-slate-800/50 group transition-all animate-in fade-in slide-in-from-left-2 duration-200"
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
                          <span className="text-[9px] text-slate-600 font-mono italic">
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
          </>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Rules Configuration */}
            <div className="p-4 bg-slate-950/30 border-b border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Regras FEBRABAN
                </h4>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setBulkRules(true)}
                    className="text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-tighter"
                  >
                    Ativar Todas
                  </button>
                  <button 
                    onClick={() => setBulkRules(false)}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-tighter"
                  >
                    Desativar Todas
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="text"
                  placeholder="Buscar ID ou descrição..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-[11px] text-slate-200 outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-2">
              <div className="space-y-1 pb-8">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Lista de Validações</div>
                {filteredRuleIds.map((id) => {
                  const rule = CNAB_RULES[id];
                  const isActive = activeRules[id] !== false;
                  return (
                    <div 
                      key={id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group
                        ${isActive ? 'bg-slate-800/40 border-slate-800/50 hover:bg-slate-800/60' : 'bg-slate-950/40 border-transparent opacity-40 hover:opacity-70'}`}
                      onClick={() => toggleRule(id)}
                    >
                      <div className="pt-0.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                          ${isActive ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'}`}>
                          {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                            {id}
                          </span>
                          <span className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors">{rule.label}</span>
                        </div>
                        {rule.desc && (
                          <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 italic">{rule.desc}</p>
                        )}
                      </div>
                      
                      {/* Documentation Button */}
                      <button 
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          useCnabStore.getState().openDoc(id);
                        }}
                        className="p-2 hover:bg-blue-500/10 rounded-md text-slate-600 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                        title="Ver no Manual"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Specific Field Ignoring */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 px-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ignorar por Campo</h4>
                {Object.values(CNAB_SCHEMAS).map(schema => (
                  <div key={schema.id} className="space-y-1 mb-4">
                    <div className="text-[9px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-slate-700" />
                       {schema.label}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {schema.fields.filter(f => f.rule || f.ruleId).map(field => {
                        const fieldId = `${schema.id}:${field.name}`;
                        const isIgnored = disabledFields.includes(fieldId);
                        return (
                          <button
                            key={fieldId}
                            onClick={() => toggleFieldValidation(fieldId)}
                            className={`flex items-center justify-between p-2 rounded-md text-[10px] transition-all border
                              ${isIgnored ? 'bg-red-500/5 border-red-500/20 text-red-400/60' : 'bg-slate-800/20 border-transparent text-slate-400 hover:bg-slate-800/40'}`}
                          >
                            <span>{field.label}</span>
                            {isIgnored ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 opacity-20" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
