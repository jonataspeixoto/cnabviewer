import React from 'react';
import { AlertTriangle, Download, Trash2, X } from 'lucide-react';

export const SaveConfirmationModal = ({ isOpen, onClose, onConfirm, onDiscard }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Alterações não salvas</h3>
              <p className="text-sm text-slate-400">Deseja baixar o arquivo editado antes de fechar este projeto?</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Salvar e Fechar
            </button>
            
            <button
              onClick={onDiscard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              Descartar alterações
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
