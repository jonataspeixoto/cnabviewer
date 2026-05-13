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
  const schema = cnabEngine.getSchema(currentLine, rawLines, selectedLineIndex);
  
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
    <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] font-bold text-slate-500 shrink-0 z-40 select-none">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter">Linha:</span>
          <span className="text-slate-200 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            {String(selectedLineIndex + 1).padStart(5, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter">Posição:</span>
          <div className="flex items-center bg-slate-800 px-2 py-0.5 rounded border border-slate-700 gap-1">
            <span className="text-amber-400 font-mono font-bold">{absolutePosition}</span>
            <span className="text-slate-600 font-mono text-[9px]">/ 240</span>
          </div>
        </div>

        {field && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">Campo Atual</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">{field.label}</span>
                <span className="text-[9px] text-slate-600 font-mono bg-slate-900 px-1 rounded border border-slate-800">
                  {field.start}-{field.end}
                </span>
                {field.ruleId && (
                  <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
                    {field.ruleId}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col pl-4 border-l border-slate-800/50">
              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">Valor do Campo</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-950/50 px-2 py-0.5 rounded truncate max-w-[150px]">
                "{currentValue}"
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {schema && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{schema.label}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span>{rawLines.length} Registros</span>
          <div className="w-[1px] h-3 bg-slate-800"></div>
          <span>v10.9</span>
        </div>
      </div>
    </div>
  );
};
