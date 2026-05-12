import React from 'react';
import { Sidebar } from './components/Sidebar';
import { CnabExplorer } from './components/CnabExplorer';
import { EditorPanel } from './components/EditorPanel';
import { AuditPanel } from './components/AuditPanel';
import { useCnabStore } from './store/useCnabStore';

function App() {
  const { visualSettings, toggleVisualSetting } = useCnabStore();
  const [editorWidth, setEditorWidth] = React.useState(400);
  const [auditWidth, setAuditWidth] = React.useState(320);
  const [isResizingEditor, setIsResizingEditor] = React.useState(false);
  const [isResizingAudit, setIsResizingAudit] = React.useState(false);

  const startResizingEditor = React.useCallback((e) => {
    e.preventDefault();
    setIsResizingEditor(true);
  }, []);

  const startResizingAudit = React.useCallback((e) => {
    e.preventDefault();
    setIsResizingAudit(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizingEditor(false);
    setIsResizingAudit(false);
  }, []);

  const resize = React.useCallback((e) => {
    if (isResizingEditor) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 250 && newWidth < 800) setEditorWidth(newWidth);
    }
    if (isResizingAudit) {
      const newWidth = window.innerWidth - e.clientX - (visualSettings.isEditorCollapsed ? 40 : editorWidth);
      if (newWidth > 200 && newWidth < 600) setAuditWidth(newWidth);
    }
  }, [isResizingEditor, isResizingAudit, editorWidth, visualSettings.isEditorCollapsed]);

  React.useEffect(() => {
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
    <div className="flex h-screen w-full bg-cnab-bg text-slate-200 select-none overflow-hidden" style={{ cursor: (isResizingEditor || isResizingAudit) ? 'col-resize' : 'default' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-400">Ambiente de Processamento Local</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Sistema Ativo</span>
             </div>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <CnabExplorer />
          
          {/* Editor Panel Section */}
          {!visualSettings.isEditorCollapsed ? (
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

          {/* Audit Panel Section */}
          {!visualSettings.isAuditCollapsed ? (
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
    </div>
  );
}

export default App;
