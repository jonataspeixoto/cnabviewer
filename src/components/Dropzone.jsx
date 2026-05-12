import React, { useCallback } from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { Upload, FileText } from 'lucide-react';

export const Dropzone = () => {
  const setRawLines = useCnabStore((state) => state.setRawLines);

  const handleFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Split by newline and ensure 240 chars (some files might have \r\n)
      const lines = text.split(/\r?\n/).filter(line => line.length > 0);
      setRawLines(lines, file.name);
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group"
      onClick={() => document.getElementById('fileInput').click()}
    >
      <input 
        id="fileInput"
        type="file" 
        className="hidden" 
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="p-4 rounded-full bg-slate-700 group-hover:scale-110 transition-transform mb-4">
        <Upload className="w-8 h-8 text-blue-400" />
      </div>
      <p className="text-slate-300 font-medium">Arraste seu arquivo CNAB aqui</p>
      <p className="text-slate-500 text-sm mt-1">Suporta arquivos .rem, .ret e .txt (240 posições)</p>
      
      <div className="mt-6 flex gap-2">
        <div className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400">
          <FileText className="w-3 h-3" />
          FEBRABAN 240
        </div>
      </div>
    </div>
  );
};
