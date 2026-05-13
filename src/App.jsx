import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CnabExplorer } from './components/CnabExplorer';
import { EditorPanel } from './components/EditorPanel';
import { AuditPanel } from './components/AuditPanel';
import { ContextBar } from './components/ContextBar';
import { SaveConfirmationModal } from './components/SaveConfirmationModal';
import { useCnabStore } from './store/useCnabStore';
import { Undo2, Redo2, Download, FileJson, Layers, X } from 'lucide-react';

function App() {
  // Seletores Granulares para evitar renderizações globais inúteis
  const fileName = useCnabStore(state => state.fileName);
  const historyLen = useCnabStore(state => state.history.length);
  const futureLen = useCnabStore(state => state.future.length);
  const linesCount = useCnabStore(state => state.rawLines.length);
  
  const toggleVisualSetting = useCnabStore(state => state.toggleVisualSetting);
  const undo = useCnabStore(state => state.undo);
  const redo = useCnabStore(state => state.redo);
  const setRawLines = useCnabStore(state => state.setRawLines);
  const exportToRem = useCnabStore(state => state.exportToRem);
  const exportToJson = useCnabStore(state => state.exportToJson);
  const { isEditorCollapsed, isAuditCollapsed } = useCnabStore(state => state.visualSettings);
  const resetProject = useCnabStore(state => state.resetProject);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleNewFile = useCallback(() => {
    if (historyLen > 0) {
      setShowConfirmModal(true);
    } else {
      resetProject();
    }
  }, [historyLen, resetProject]);

  const handleConfirmClose = useCallback(() => {
    // Tenta fazer o download
    try {
      exportToRem();
      // Se chegou aqui sem erro, assumimos que o download foi disparado e podemos apagar
      resetProject();
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Falha no download:", err);
      alert("Erro ao gerar arquivo para download. Tente novamente.");
    }
  }, [exportToRem, resetProject]);

  const handleDiscardClose = useCallback(() => {
    resetProject();
    setShowConfirmModal(false);
  }, [resetProject]);

  // console.log(`[RENDER] App shell: file=${fileName} lines=${linesCount} undo=${historyLen}`);

  const [editorWidth, setEditorWidth] = useState(400);
  const [auditWidth, setAuditWidth] = useState(320);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingAudit, setIsResizingAudit] = useState(false);

  const startResizingEditor = useCallback((e) => {
    e.preventDefault();
    setIsResizingEditor(true);
  }, []);

  const startResizingAudit = useCallback((e) => {
    e.preventDefault();
    setIsResizingAudit(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingEditor(false);
    setIsResizingAudit(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizingEditor) {
      const auditEffectiveWidth = isAuditCollapsed ? 40 : auditWidth;
      const newWidth = window.innerWidth - e.clientX - auditEffectiveWidth;
      if (newWidth > 200 && newWidth < 800) setEditorWidth(newWidth);
    }
    if (isResizingAudit) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 150 && newWidth < 600) setAuditWidth(newWidth);
    }
  }, [isResizingEditor, isResizingAudit, auditWidth, isAuditCollapsed]);

  useEffect(() => {
    if (isResizingEditor || isResizingAudit) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingEditor, isResizingAudit, resize, stopResizing]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-slate-200 font-sans select-none" style={{ cursor: (isResizingEditor || isResizingAudit) ? 'col-resize' : 'default' }}>
      {/* Global Header */}
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

          {/* File Info */}
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

        {/* Action Center */}
        <div className="flex items-center gap-3">
          {/* History Group */}
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

          {/* Export Group */}
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

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ContextBar />
        
        <div className="flex-1 flex overflow-hidden">
          <CnabExplorer />
          
          {!isEditorCollapsed ? (
            <>
              <div 
                onMouseDown={startResizingEditor}
                className={`w-1 hover:w-1.5 bg-slate-800 hover:bg-blue-500/50 cursor-col-resize transition-all z-20 ${isResizingEditor ? 'bg-blue-500 w-1.5' : ''}`}
              />
              <div style={{ width: `${editorWidth}px` }} className="flex-shrink-0 flex flex-col border-l border-slate-800">
                <EditorPanel onMinimize={() => toggleVisualSetting('isEditorCollapsed')} />
              </div>
            </>
          ) : (
            <div 
              onClick={() => toggleVisualSetting('isEditorCollapsed')}
              className="w-10 bg-slate-900 border-l border-slate-800 hover:bg-slate-800 cursor-pointer flex flex-col items-center justify-center transition-colors overflow-hidden group"
              title="Expandir Detalhes"
            >
              <div className="[writing-mode:vertical-lr] rotate-180 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400 transition-colors">
                Detalhes
              </div>
            </div>
          )}

          {!isAuditCollapsed ? (
            <>
              <div 
                onMouseDown={startResizingAudit}
                className={`w-1 hover:w-1.5 bg-slate-800 hover:bg-blue-500/50 cursor-col-resize transition-all z-20 ${isResizingAudit ? 'bg-blue-500 w-1.5' : ''}`}
              />
              <div style={{ width: `${auditWidth}px` }} className="flex-shrink-0 flex flex-col border-l border-slate-800">
                <AuditPanel onMinimize={() => toggleVisualSetting('isAuditCollapsed')} />
              </div>
            </>
          ) : (
            <div 
              onClick={() => toggleVisualSetting('isAuditCollapsed')}
              className="w-10 bg-slate-900 border-l border-slate-800 hover:bg-slate-800 cursor-pointer flex flex-col items-center justify-center transition-colors overflow-hidden group"
              title="Expandir Auditoria"
            >
              <div className="[writing-mode:vertical-lr] rotate-180 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400 transition-colors">
                Auditoria
              </div>
            </div>
          )}
        </div>
      </main>
      <SaveConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmClose}
        onDiscard={handleDiscardClose}
      />
    </div>
  );
}

export default App;
