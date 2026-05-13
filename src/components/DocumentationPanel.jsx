import React, { useState, useEffect, useMemo } from 'react';
import { X, Book, Info, ExternalLink, Search, Loader2, BookOpen, ChevronRight, Maximize2, GripVertical } from 'lucide-react';
import { docService } from '../services/DocService';
import { marked } from 'marked';

export const DocumentationPanel = ({ isOpen, onClose, initialRule, initialSection, width, onResizeStart }) => {
  const [loading, setLoading] = useState(false);
  const [rule, setRule] = useState(null);
  const [section, setSection] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullView, setIsFullView] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log(`[DocPanel] Loading documentation: rule=${initialRule}, section=${initialSection}`);
      setLoading(true);
      docService.load().then(() => {
        setLoading(false);
        if (initialRule) {
          const found = docService.getRule(initialRule);
          console.log(`[DocPanel] Found rule:`, found);
          setRule(found);
          setSection(null);
          setSearchResults([]);
        } else if (initialSection) {
          const found = docService.getSectionHtml(initialSection);
          console.log(`[DocPanel] Found section:`, found);
          setSection(found);
          setRule(null);
          setSearchResults([]);
        } else {
          setRule(null);
          setSection(null);
          setSearchResults([]);
        }
      });
    }
  }, [isOpen, initialRule, initialSection]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const sections = docService.searchSections(query);
    setSearchResults(sections);
  };

  const selectSection = (sectionId) => {
    setLoading(true);
    const found = docService.getSectionHtml(sectionId);
    setSection(found);
    setRule(null);
    setSearchResults([]);
    setLoading(false);
  };

  const openFullManual = () => {
    // Aumentamos para 15000 linhas para dar mais contexto, mas ainda protegendo o browser
    const contentToParse = docService.rawContent ? docService.rawContent.split('\n').slice(0, 15000).join('\n') : '';
    const parsedHtml = marked(contentToParse);

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Manual FEBRABAN 240 v10.9 - Completo</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap');
          
          body { 
            background: #0f172a; 
            color: #cbd5e1; 
            font-family: 'Inter', sans-serif; 
            line-height: 1.6; 
          }
          .container { max-width: 1100px; margin: 0 auto; padding: 60px 20px; }
          
          /* Typography Improvements */
          h1 { color: #f8fafc; font-size: 2.5rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid #334155; padding-bottom: 0.75rem; }
          h2 { color: #f1f5f9; font-size: 1.8rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
          h3 { color: #e2e8f0; font-size: 1.4rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; }
          
          p { margin-bottom: 1.25rem; }
          ul, ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
          li { margin-bottom: 0.5rem; }
          
          code { font-family: 'JetBrains Mono', monospace; background: #1e293b; padding: 0.2rem 0.4rem; rounded: 4px; color: #38bdf8; font-size: 0.9em; }
          
          /* Table Styling */
          .table-container { overflow-x: auto; margin: 2.5rem 0; border-radius: 12px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.5); }
          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          th { background: #1e293b; padding: 14px; text-align: left; border-bottom: 1px solid #334155; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
          td { padding: 14px; border-bottom: 1px solid #1e293b; border-right: 1px solid #1e293b; }
          tr:last-child td { border-bottom: none; }
          td:last-child { border-right: none; }
          tr:hover { background: rgba(59, 130, 246, 0.03); }
          
          strong { color: #f8fafc; font-weight: 600; }
          
          .header-card {
            margin-bottom: 50px; 
            padding: 40px; 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
            border-radius: 20px; 
            border: 1px solid #334155;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .footer-note {
            text-align: center; 
            padding: 60px; 
            color: #64748b; 
            font-style: italic;
            border-top: 1px dashed #334155;
            margin-top: 60px;
          }
          
          /* Scrollbar */
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: #0f172a; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; }
          ::-webkit-scrollbar-thumb:hover { background: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-card">
            <h1 style="margin-top: 0; border: none;">Manual Técnico Integrado</h1>
            <p style="font-size: 1.1rem; color: #94a3b8;">Documentação Completa - FEBRABAN CNAB240 V10.9</p>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
              <span style="padding: 4px 12px; background: #3b82f620; color: #60a5fa; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #3b82f640;">OFICIAL</span>
              <span style="padding: 4px 12px; background: #10b98120; color: #34d399; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #10b98140;">v10.9</span>
            </div>
          </div>
          
          <div class="markdown-content">
            ${parsedHtml.replace(/<table>/g, '<div class="table-container"><table>').replace(/<\/table>/g, '</table></div>')}
          </div>
          
          <div class="footer-note">
            <p>Fim da visualização parcial (15.000 linhas).</p>
            <p>Para uma consulta completa e interativa, utilize as ferramentas de busca e auditoria no aplicativo principal.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win.document.write(fullHtml);
    win.document.close();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-y-0 right-0 bg-slate-900 border-l border-slate-800 shadow-2xl z-[60] flex flex-col transition-all duration-300 animate-in slide-in-from-right`}
      style={{ width: isFullView ? '100%' : `${width}px` }}
    >
      {/* Resize Handle */}
      {!isFullView && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors group z-20"
          onMouseDown={onResizeStart}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-500 rounded p-0.5 pointer-events-none">
            <GripVertical size={10} className="text-white" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Manual Técnico</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">FEBRABAN 240 v10.9</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullView(!isFullView)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            title={isFullView ? "Vista Normal" : "Vista Expandida"}
          >
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-950/30 border-b border-slate-800/50">
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Buscar regra (G001) ou seção (Header)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        </div>
        
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto overflow-x-hidden">
            {searchResults.map((res) => (
              <button
                key={res.id}
                onClick={() => selectSection(res.id)}
                className="w-full px-4 py-3 text-left hover:bg-blue-500/10 flex items-center justify-between group border-b border-slate-700/50 last:border-0"
              >
                <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 truncate pr-4">{res.title}</span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-sm font-medium animate-pulse">Carregando manual...</p>
          </div>
        ) : rule || section ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                {rule ? `Campo: ${rule.id}` : 'Seção do Manual'}
              </span>
              <button 
                onClick={openFullManual}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-400 uppercase tracking-tighter transition-colors"
              >
                <ExternalLink size={14} />
                Manual Completo
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-50 leading-tight mb-6">
              {rule ? rule.title : section.title}
            </h2>

            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: rule ? rule.html : section.html }}
            />

            <div className="mt-12 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-4">
              <Info size={24} className="text-blue-400 shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-tight">Fonte Oficial</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Informações extraídas do Manual FEBRABAN 240 posições v10.9 (Atualizado 2021).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-slate-500 opacity-60">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50 shadow-inner">
              <Book size={40} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-300">Consulta ao Manual</h3>
              <p className="text-sm max-w-[280px] mx-auto leading-relaxed">
                {(initialRule || initialSection) 
                  ? `Não encontramos resultados diretos para "${initialRule || initialSection}". Tente buscar por termos genéricos como "Header" ou "Segmento".` 
                  : 'Selecione uma regra no arquivo ou use a busca acima para visualizar as especificações técnicas.'}
              </p>
            </div>
            
            <button 
              onClick={openFullManual}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-slate-700 hover:border-blue-500/50"
            >
              Ver Manual Completo
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm text-[10px] text-slate-500 text-center uppercase tracking-[0.2em] font-bold">
        Interface de Auditoria CNAB
      </div>
    </div>
  );
};
