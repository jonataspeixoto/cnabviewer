import React from 'react';
import { useCnabStore } from '../store/useCnabStore';
import { cnabEngine } from '../utils/cnab/engine';
import { CNAB_RULES } from '../utils/cnab/rules';
import { MapPin, Hash, Type } from 'lucide-react';

export const StatusBar = () => {
  const selectedLineIndex = useCnabStore(state => state.selectedLineIndex);
  const focusedField = useCnabStore(state => state.focusedField);
  const cursorOffset = useCnabStore(state => state.cursorOffset);
  const rawLines = useCnabStore(state => state.rawLines);

  if (selectedLineIndex === null) return null;

  const currentLine = rawLines[selectedLineIndex];
  const schema = cnabEngine.getSchema(currentLine);
  
  // Encontrar o campo para saber o start absoluto
  const field = schema?.fields.find(f => f.name === focusedField);
  const rule = CNAB_RULES[field?.rule || field?.ruleId];
  const options = field?.options || rule?.options;
  
  // Se estiver em um campo, soma o start. Se estiver no modo 'Raw' (sem field), usa o offset direto.
  const absolutePosition = field 
    ? field.start + cursorOffset 
    : (focusedField === '_extra' ? (schema?.fields[schema.fields.length - 1]?.end || 240) + cursorOffset + 1 : cursorOffset + 1);

  // Pega o valor atual do campo para mostrar a descrição (ex: 2 -> CNPJ)
  const currentValue = field ? currentLine.substring(field.start - 1, field.end).trim() : '';
  const matchedOption = options?.find(opt => String(opt.value) === currentValue);

  return (
    <div className="h-7 bg-slate-900 border-t border-slate-800 flex items-center px-4 gap-6 text-[10px] font-bold text-slate-500 shrink-0 z-40 select-none">
      <div className="flex items-center gap-2 group">
        <Hash className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors" />
        <span className="text-slate-400">LINHA:</span>
        <span className="text-blue-400 tabular-nums">{(selectedLineIndex + 1).toString().padStart(6, '0')}</span>
      </div>

      <div className="w-[1px] h-3 bg-slate-800" />

      <div className="flex items-center gap-2 group">
        <MapPin className="w-3 h-3 text-slate-600 group-hover:text-amber-500 transition-colors" />
        <span className="text-slate-400">POSIÇÃO:</span>
        <span className="text-amber-400 tabular-nums">{absolutePosition.toString().padStart(3, '0')}</span>
        <span className="text-slate-600">/ 240</span>
      </div>

      <div className="w-[1px] h-3 bg-slate-800" />

      <div className="flex items-center gap-2 group min-w-0">
        <Type className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-colors" />
        <span className="text-slate-400 shrink-0">CAMPO:</span>
        <span className="text-emerald-400 truncate uppercase tracking-wider">
          {field ? (matchedOption ? `${field.label}: ${currentValue} (${matchedOption.label})` : field.label) : '---'}
        </span>
        {field && (
          <span className="text-[9px] text-slate-600 ml-1 font-medium whitespace-nowrap">
            ({field.start}-{field.end})
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{schema?.label || 'DESCONHECIDO'}</span>
        </div>
      </div>
    </div>
  );
};
