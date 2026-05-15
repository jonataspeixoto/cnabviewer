import React, { useState, useCallback } from 'react';
import { CnabExplorer } from './components/CnabExplorer';
import { EditorPanel } from './components/EditorPanel';
import { AuditPanel } from './components/AuditPanel';
import { ContextBar } from './components/ContextBar';
import { StatusBar } from './components/StatusBar';
import { SaveConfirmationModal } from './components/SaveConfirmationModal';
import { DocumentationPanel } from './components/DocumentationPanel';
import { AppHeader } from './components/AppHeader';
import { useCnabStore } from './store/useCnabStore';
import { useResizable } from './hooks/useResizable';

function App() {
  const historyLen = useCnabStore(state => state.history.length);
  const isDocOpen = useCnabStore(state => state.isDocOpen);
  const focusedRule = useCnabStore(state => state.focusedRule);
  const focusedSection = useCnabStore(state => state.focusedSection);
  const closeDoc = useCnabStore(state => state.closeDoc);
  
  const toggleVisualSetting = useCnabStore(state => state.toggleVisualSetting);
  const exportToRem = useCnabStore(state => state.exportToRem);
  const { isEditorCollapsed, isAuditCollapsed } = useCnabStore(state => state.visualSettings);
  const resetProject = useCnabStore(state => state.resetProject);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { width: editorWidth, isResizing: isResizingEditor, startResizing: startResizingEditor } = useResizable(400, 200, 800, 'right');
  const { width: auditWidth, isResizing: isResizingAudit, startResizing: startResizingAudit } = useResizable(320, 150, 600, 'right');
  const { width: docWidth, isResizing: isResizingDoc, startResizing: startResizingDoc } = useResizable(450, 300, 900, 'right');

  const handleNewFile = useCallback(() => {
    if (historyLen > 0) setShowConfirmModal(true);
    else resetProject();
  }, [historyLen, resetProject]);

  const handleConfirmClose = useCallback(() => {
    try {
      exportToRem();
      resetProject();
      setShowConfirmModal(false);
    } catch (err) {
      alert("Erro ao gerar arquivo para download.");
    }
  }, [exportToRem, resetProject]);

  const handleDiscardClose = useCallback(() => {
    resetProject();
    setShowConfirmModal(false);
  }, [resetProject]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-slate-200 font-sans select-none" 
         style={{ cursor: (isResizingEditor || isResizingAudit || isResizingDoc) ? 'col-resize' : 'default' }}>
      
      <AppHeader handleNewFile={handleNewFile} />

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
            >
              <div className="[writing-mode:vertical-lr] rotate-180 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400">
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
            >
              <div className="[writing-mode:vertical-lr] rotate-180 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400">
                Auditoria
              </div>
            </div>
          )}
        </div>
      </main>

      <StatusBar />

      <SaveConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmClose}
        onDiscard={handleDiscardClose}
      />

      <DocumentationPanel 
        isOpen={isDocOpen} 
        onClose={closeDoc} 
        initialRule={focusedRule}
        initialSection={focusedSection}
        width={docWidth}
        onResizeStart={startResizingDoc}
      />
    </div>
  );
}

export default App;
